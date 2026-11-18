import type { ExpenseCategory } from '../models/expense'
import type { Assets } from '../models/assets'
import type { Assumptions } from '../models/assumptions'
import type { Profile } from '../models/profile'
import type { CalculationResults, ScenarioResult, LifestyleComparison } from '../models/results'
import { SCENARIO_PRESETS } from '../models/assumptions'
import { annualiseExpense } from './annualise'
import { calculateCorpus, netReturn } from './corpusFormula'
import { projectCashflows } from './projectCashflows'
import { simulatePortfolio } from './simulatePortfolio'
import { generateWarnings } from '../validation/warnings'
import type { HouseholdMember } from '../models/household'
import Decimal from 'decimal.js'

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

  // Generate raw cashflows (including active income and expenses)
  const rawProjections = projectCashflows({
    categories,
    assets,
    assumptions: {
      ...assumptions,
      globalInflationRate: inflationRate,
      annualInvestmentReturn: effectiveReturn,
    },
    currentAge: profile.currentAge,
    planningYears,
  })

  const hasActiveIncome = (assets.monthlyIncome || 0) > 0

  let requiredCorpus: number
  let startingSimulationCorpus: number

  if (hasActiveIncome) {
    // With active income: calculate Net Present Value of all net withdrawals minus net savings
    // C0 = sum( (withdrawal - savings) / (1 + r)^t )
    const rDec = new Decimal(effectiveReturn)
    const npv = rawProjections.reduce((sum, p) => {
      const netCashDemand = new Decimal(p.netWithdrawal).minus(p.netSavings)
      const discount = rDec.plus(1).pow(p.year)
      return sum.plus(netCashDemand.div(discount))
    }, new Decimal(0))

    requiredCorpus = Math.max(0, npv.toNumber())
    // The simulation runs starting from the user's actual existing corpus
    startingSimulationCorpus = assets.existingInvestableCorpus
  } else {
    // Pure retirement model from today:
    requiredCorpus = calculateCorpus(
      total,
      effectiveReturn,
      inflationRate,
      planningYears,
      assumptions.withdrawalTiming,
    )
    startingSimulationCorpus = requiredCorpus
  }

  const fundingGap = Math.max(0, requiredCorpus - assets.existingInvestableCorpus)
  const safetyMarginAmount = requiredCorpus * assumptions.safetyMarginPercent
  const corpusWithSafetyMargin = requiredCorpus + safetyMarginAmount

  // Simulate lifetime portfolio balance
  const yearProjections = simulatePortfolio(
    rawProjections,
    startingSimulationCorpus,
    effectiveReturn,
    assumptions.withdrawalTiming,
  )

  // Find peak corpus and when it occurs
  let peakCorpus = startingSimulationCorpus
  let peakCorpusAge = profile.currentAge
  let totalAccumulatedSavings = 0
  let depletionAge: number | undefined

  yearProjections.forEach(p => {
    totalAccumulatedSavings += p.netSavings
    if (p.closingCorpus > peakCorpus) {
      peakCorpus = p.closingCorpus
      peakCorpusAge = p.age
    }
    if (p.closingCorpus <= 0 && !depletionAge && p.netWithdrawal > 0) {
      depletionAge = p.age
    }
  })

  // Lifetime cumulative totals
  const totalLifetimeExpenses = rawProjections.reduce((sum, p) => sum + p.expenses, 0)
  const totalLifetimeIncome = rawProjections.reduce((sum, p) => sum + p.totalIncome, 0)
  const totalLifetimeSavingsInvested = rawProjections.reduce((sum, p) => sum + p.netSavings, 0)
  const totalLifetimeWithdrawals = rawProjections.reduce((sum, p) => sum + p.netWithdrawal, 0)
  const totalLifetimeInvestmentGrowth = yearProjections.reduce((sum, p) => sum + p.investmentGrowth, 0)

  return {
    label,
    inflationRate,
    returnRate: effectiveReturn,
    currentAnnualExpense: total,
    currentMonthlyEquivalent: total / 12,
    essentialAnnualExpense: essential,
    discretionaryAnnualExpense: discretionary,
    totalLifetimeExpenses,
    totalLifetimeIncome,
    totalLifetimeSavingsInvested,
    totalLifetimeWithdrawals,
    totalLifetimeInvestmentGrowth,
    requiredCorpus,
    peakCorpus,
    peakCorpusAge,
    totalAccumulatedSavings,
    depletionAge,
    existingCorpus: assets.existingInvestableCorpus,
    fundingGap,
    safetyMarginAmount,
    corpusWithSafetyMargin,
    yearProjections,
  }
}

function computeLifestyleComparisons(
  baseInput: RunScenariosInput,
  baseScenario: ScenarioResult,
): LifestyleComparison[] {
  const { categories, assumptions } = baseInput
  const r = assumptions.annualInvestmentReturn
  const g = assumptions.globalInflationRate

  // 1. Bare Minimum Categories (essentials only, or 65% of parent amount)
  const bareMinCategories: ExpenseCategory[] = categories.map(cat => {
    if (cat.parentAmount != null && cat.parentFrequency) {
      return {
        ...cat,
        parentAmount: Math.round(cat.parentAmount * 0.65),
      }
    }
    return {
      ...cat,
      items: cat.items.map(it => (it.essential ? it : { ...it, amount: 0, skipped: true })),
    }
  })

  const bareScenario = runOneScenario('Bare Minimum', g, r, {
    ...baseInput,
    categories: bareMinCategories,
  })

  // 2. Luxury / Aspirational Categories (+40% to parent, or 1.5x discretionary)
  const luxuryCategories: ExpenseCategory[] = categories.map(cat => {
    if (cat.parentAmount != null && cat.parentFrequency) {
      return {
        ...cat,
        parentAmount: Math.round(cat.parentAmount * 1.4),
      }
    }
    return {
      ...cat,
      items: cat.items.map(it => ({
        ...it,
        amount: it.essential ? Math.round(it.amount * 1.15) : Math.round(it.amount * 1.5),
      })),
    }
  })

  const luxuryScenario = runOneScenario('Luxury', g, r, {
    ...baseInput,
    categories: luxuryCategories,
  })

  return [
    {
      lifestyle: 'bare_minimum',
      label: 'Frugal / Bare Minimum',
      description: 'Covers only core survival essentials (basic food, shelter, healthcare). No luxuries.',
      monthlyExpenseToday: bareScenario.currentMonthlyEquivalent,
      totalLifetimeCostOfLiving: bareScenario.totalLifetimeExpenses,
      requiredCorpus: bareScenario.requiredCorpus,
      peakCorpus: bareScenario.peakCorpus,
      peakAge: bareScenario.peakCorpusAge,
    },
    {
      lifestyle: 'comfortable',
      label: 'Comfortable (Current Plan)',
      description: 'Your configured balanced lifestyle with moderate leisure, gadgets, and vacations.',
      monthlyExpenseToday: baseScenario.currentMonthlyEquivalent,
      totalLifetimeCostOfLiving: baseScenario.totalLifetimeExpenses,
      requiredCorpus: baseScenario.requiredCorpus,
      peakCorpus: baseScenario.peakCorpus,
      peakAge: baseScenario.peakCorpusAge,
    },
    {
      lifestyle: 'luxury',
      label: 'Luxury / Aspirational',
      description: 'Elevated lifestyle with premium housing, luxury travel, dining, and higher discretionary spending.',
      monthlyExpenseToday: luxuryScenario.currentMonthlyEquivalent,
      totalLifetimeCostOfLiving: luxuryScenario.totalLifetimeExpenses,
      requiredCorpus: luxuryScenario.requiredCorpus,
      peakCorpus: luxuryScenario.peakCorpus,
      peakAge: luxuryScenario.peakCorpusAge,
    },
  ]
}

export function runScenarios(input: RunScenariosInput): CalculationResults {
  const { assumptions } = input

  const baseScenario = runOneScenario(
    'Base',
    assumptions.globalInflationRate,
    assumptions.annualInvestmentReturn,
    input,
  )

  const scenarios: ScenarioResult[] = [
    runOneScenario(
      'Optimistic',
      SCENARIO_PRESETS.optimistic.globalInflationRate,
      SCENARIO_PRESETS.optimistic.annualInvestmentReturn,
      input,
    ),
    baseScenario,
    runOneScenario(
      'Conservative',
      SCENARIO_PRESETS.conservative.globalInflationRate,
      SCENARIO_PRESETS.conservative.annualInvestmentReturn,
      input,
    ),
  ]

  const lifestyleComparisons = computeLifestyleComparisons(input, baseScenario)

  const warnings = generateWarnings({
    profile: input.profile,
    members: input.members,
    categories: input.categories,
    assumptions: input.assumptions,
  })

  // Add warning if active income ends but portfolio depletes early
  if (input.assets.monthlyIncome > 0 && scenarios[1].depletionAge) {
    warnings.push(
      `Under base assumptions, your savings may be depleted around Age ${scenarios[1].depletionAge}. Consider saving more or adjusting your retirement age.`,
    )
  }

  return {
    scenarios,
    lifestyleComparisons,
    warnings,
    calculatedAt: new Date().toISOString(),
  }
}
