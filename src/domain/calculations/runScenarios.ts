import type { ExpenseCategory } from '../models/expense'
import type { Assets } from '../models/assets'
import type { Assumptions } from '../models/assumptions'
import type { Profile } from '../models/profile'
import type { CalculationResults, ScenarioResult } from '../models/results'
import { SCENARIO_PRESETS } from '../models/assumptions'
import { annualiseExpense } from './annualise'
import { calculateCorpus, netReturn } from './corpusFormula'
import { projectCashflows } from './projectCashflows'
import { simulatePortfolio } from './simulatePortfolio'
import { generateWarnings } from '../validation/warnings'
import type { HouseholdMember } from '../models/household'

interface RunScenariosInput {
  profile: Profile
  members: HouseholdMember[]
  categories: ExpenseCategory[]
  assumptions: Assumptions
  assets: Assets
}

function computeAnnualBase(categories: ExpenseCategory[]): {
  total: number
  essential: number
  discretionary: number
} {
  let total = 0
  let essential = 0
  let discretionary = 0

  for (const cat of categories) {
    if (cat.skipped) continue
    if (cat.parentAmount != null && cat.parentAmount > 0 && cat.parentFrequency) {
      const freq = cat.parentFrequency
      const mult = freq === 'monthly' ? 12 : freq === 'yearly' ? 1 : 1
      total += cat.parentAmount * mult
      essential += cat.parentAmount * mult
      continue
    }
    for (const item of cat.items) {
      if (item.skipped || item.type === 'one_time' || item.frequency === 'one_time') continue
      const annual = annualiseExpense(item)
      total += annual
      if (item.essential) essential += annual
      else discretionary += annual
    }
  }

  return { total, essential, discretionary }
}

function runOneScenario(
  label: string,
  inflationRate: number,
  returnRate: number,
  input: RunScenariosInput,
): ScenarioResult {
  const { profile, categories, assumptions, assets } = input
  const planningYears = profile.targetAge - profile.currentAge

  const effectiveReturn =
    assumptions.returnBasis === 'gross'
      ? netReturn(returnRate, assumptions.investmentFeeRate, assumptions.taxDragRate)
      : returnRate

  const { total, essential, discretionary } = computeAnnualBase(categories)

  const requiredCorpus = calculateCorpus(
    total,
    effectiveReturn,
    inflationRate,
    planningYears,
    assumptions.withdrawalTiming,
  )

  const fundingGap = Math.max(0, requiredCorpus - assets.existingInvestableCorpus)
  const safetyMarginAmount = requiredCorpus * assumptions.safetyMarginPercent
  const corpusWithSafetyMargin = requiredCorpus + safetyMarginAmount

  const rawProjections = projectCashflows({
    categories,
    assets,
    assumptions: { ...assumptions, globalInflationRate: inflationRate, annualInvestmentReturn: effectiveReturn },
    currentAge: profile.currentAge,
    planningYears,
  })

  const yearProjections = simulatePortfolio(
    rawProjections,
    requiredCorpus,
    effectiveReturn,
    assumptions.withdrawalTiming,
  )

  return {
    label,
    inflationRate,
    returnRate: effectiveReturn,
    currentAnnualExpense: total,
    currentMonthlyEquivalent: total / 12,
    essentialAnnualExpense: essential,
    discretionaryAnnualExpense: discretionary,
    requiredCorpus,
    existingCorpus: assets.existingInvestableCorpus,
    fundingGap,
    safetyMarginAmount,
    corpusWithSafetyMargin,
    yearProjections,
  }
}

export function runScenarios(input: RunScenariosInput): CalculationResults {
  const { assumptions } = input

  const scenarios: ScenarioResult[] = [
    runOneScenario(
      'Optimistic',
      SCENARIO_PRESETS.optimistic.globalInflationRate,
      SCENARIO_PRESETS.optimistic.annualInvestmentReturn,
      input,
    ),
    runOneScenario(
      'Base',
      assumptions.globalInflationRate,
      assumptions.annualInvestmentReturn,
      input,
    ),
    runOneScenario(
      'Conservative',
      SCENARIO_PRESETS.conservative.globalInflationRate,
      SCENARIO_PRESETS.conservative.annualInvestmentReturn,
      input,
    ),
  ]

  const warnings = generateWarnings({
    profile: input.profile,
    members: input.members,
    categories: input.categories,
    assumptions: input.assumptions,
  })

  return {
    scenarios,
    warnings,
    calculatedAt: new Date().toISOString(),
  }
}
