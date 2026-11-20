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
import { buildCategoriesForProfile } from './areaDefaults'
import { generateWarnings } from '../validation/warnings'
import { calculateShortfallRemedies } from './shortfallRemedies'
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

  const hasActiveIncome =
    (assets.monthlyIncome || 0) > 0 && assets.incomeEndAge > profile.currentAge
  const isRetired = !hasActiveIncome
  const retirementAge = hasActiveIncome
    ? Math.min(profile.targetAge, assets.incomeEndAge)
    : profile.currentAge
  const workingYears = hasActiveIncome ? retirementAge - profile.currentAge : 0
  const retirementYears = Math.max(1, profile.targetAge - retirementAge)

  // Determine starting simulation corpus:
  // For active earners, simulation starts from existing liquid assets today.
  // For already retired users without active income, simulate from the required corpus or existing corpus.
  const startingSimulationCorpus = hasActiveIncome
    ? assets.existingInvestableCorpus
    : assets.existingInvestableCorpus > 0
    ? assets.existingInvestableCorpus
    : calculateCorpus(
        total,
        effectiveReturn,
        inflationRate,
        planningYears,
        assumptions.withdrawalTiming,
      )

  // Simulate lifetime portfolio balance
  const yearProjections = simulatePortfolio(
    rawProjections,
    startingSimulationCorpus,
    effectiveReturn,
    assumptions.withdrawalTiming,
  )

  // Calculate Target Corpus Required at Retirement Age
  let targetCorpusAtRetirement: number
  if (isRetired) {
    targetCorpusAtRetirement = calculateCorpus(
      total,
      effectiveReturn,
      inflationRate,
      retirementYears,
      assumptions.withdrawalTiming,
    )
  } else {
    // First year of retirement expense (year index = workingYears)
    const firstRetirementExpense =
      rawProjections[workingYears]?.expenses ??
      total * Math.pow(1 + inflationRate, workingYears)
    const firstRetirementOtherIncome =
      rawProjections[workingYears]?.otherIncome ?? 0
    const netRetirementAnnualBaseline = Math.max(
      0,
      firstRetirementExpense - firstRetirementOtherIncome,
    )

    targetCorpusAtRetirement = calculateCorpus(
      netRetirementAnnualBaseline,
      effectiveReturn,
      inflationRate,
      retirementYears,
      assumptions.withdrawalTiming,
    )
  }

  // Projected portfolio accumulated by Retirement Age
  const projectedCorpusAtRetirement =
    workingYears > 0
      ? yearProjections[workingYears - 1]?.closingCorpus ?? assets.existingInvestableCorpus
      : assets.existingInvestableCorpus

  const retirementFundingGap = Math.max(
    0,
    targetCorpusAtRetirement - projectedCorpusAtRetirement,
  )
  const retirementSurplus = Math.max(
    0,
    projectedCorpusAtRetirement - targetCorpusAtRetirement,
  )
  const readinessScore =
    targetCorpusAtRetirement > 0
      ? Math.min(250, Math.round((projectedCorpusAtRetirement / targetCorpusAtRetirement) * 100))
      : 100

  // Starting Corpus Required Today & Starting Gap Today
  let requiredCorpus: number
  let fundingGap: number

  if (isRetired) {
    requiredCorpus = targetCorpusAtRetirement
    fundingGap = Math.max(0, requiredCorpus - assets.existingInvestableCorpus)
  } else {
    if (projectedCorpusAtRetirement >= targetCorpusAtRetirement) {
      // Career savings fully cover retirement!
      requiredCorpus = 0
      fundingGap = 0
    } else {
      // Shortfall at retirement discounted to today
      const discountFactor = new Decimal(1).plus(effectiveReturn).pow(workingYears)
      requiredCorpus = new Decimal(retirementFundingGap).div(discountFactor).toNumber()
      fundingGap = requiredCorpus
    }
  }

  const safetyMarginAmount = (targetCorpusAtRetirement || requiredCorpus) * assumptions.safetyMarginPercent
  const corpusWithSafetyMargin = (targetCorpusAtRetirement || requiredCorpus) + safetyMarginAmount

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

  const endingBalance = yearProjections[yearProjections.length - 1]?.closingCorpus ?? 0

  // Lifetime cumulative totals
  const totalLifetimeExpenses = rawProjections.reduce((sum, p) => sum + p.expenses, 0)
  const totalLifetimeIncome = rawProjections.reduce((sum, p) => sum + p.totalIncome, 0)
  const totalLifetimeSavingsInvested = rawProjections.reduce((sum, p) => sum + p.netSavings, 0)
  const totalLifetimeWithdrawals = rawProjections.reduce((sum, p) => sum + p.netWithdrawal, 0)
  const totalLifetimeInvestmentGrowth = yearProjections.reduce((sum, p) => sum + p.investmentGrowth, 0)

  const scenarioResult: ScenarioResult = {
    label,
    inflationRate,
    returnRate: effectiveReturn,
    isRetired,
    retirementAge,
    workingYears,
    retirementYears,
    currentAnnualExpense: total,
    currentMonthlyEquivalent: total / 12,
    essentialAnnualExpense: essential,
    discretionaryAnnualExpense: discretionary,
    targetCorpusAtRetirement,
    projectedCorpusAtRetirement,
    retirementFundingGap,
    retirementSurplus,
    readinessScore,
    totalLifetimeExpenses,
    totalLifetimeIncome,
    totalLifetimeSavingsInvested,
    totalLifetimeWithdrawals,
    totalLifetimeInvestmentGrowth,
    requiredCorpus,
    peakCorpus,
    peakCorpusAge,
    endingBalance,
    totalAccumulatedSavings,
    depletionAge,
    existingCorpus: assets.existingInvestableCorpus,
    fundingGap,
    safetyMarginAmount,
    corpusWithSafetyMargin,
    yearProjections,
  }

  const shortfallRemedies = calculateShortfallRemedies({
    scenario: scenarioResult,
    profile,
    assets,
    assumptions,
    categories,
  })

  return {
    ...scenarioResult,
    shortfallRemedies,
  }
}

function computeLifestyleComparisons(
  baseInput: RunScenariosInput,
  baseScenario: ScenarioResult,
): LifestyleComparison[] {
  const { categories, assumptions, profile, members } = baseInput
  const r = assumptions.annualInvestmentReturn
  const g = assumptions.globalInflationRate
  const currentLifestyle = profile.lifestyleScenario

  let bareScenario: ScenarioResult
  let comfortableScenario: ScenarioResult
  let luxuryScenario: ScenarioResult

  if (currentLifestyle === 'bare_minimum') {
    bareScenario = baseScenario

    // Derive comfortable baseline
    const comfortableDefaults = buildCategoriesForProfile(profile.areaType, 'comfortable', members)
    const comfortableCategories: ExpenseCategory[] = comfortableDefaults.map(cat => {
      const userCat = categories.find(c => c.id === cat.id)
      if (!userCat) return cat
      if (userCat.parentAmount != null && userCat.parentFrequency) {
        return { ...cat, parentAmount: Math.round(userCat.parentAmount / 0.65) }
      }
      return {
        ...cat,
        items: cat.items.map(defItem => {
          const userItem = userCat.items.find(ui => ui.name === defItem.name)
          if (userItem && userItem.essential && userItem.amount > 0) {
            return { ...defItem, amount: userItem.amount }
          }
          return defItem
        }),
      }
    })

    comfortableScenario = runOneScenario('Comfortable', g, r, {
      ...baseInput,
      categories: comfortableCategories,
    })

    const luxuryCategories: ExpenseCategory[] = comfortableCategories.map(cat => {
      if (cat.parentAmount != null && cat.parentFrequency) {
        return { ...cat, parentAmount: Math.round(cat.parentAmount * 1.4) }
      }
      return {
        ...cat,
        items: cat.items.map(it => ({
          ...it,
          amount: it.essential ? Math.round(it.amount * 1.15) : Math.round(it.amount * 1.5),
        })),
      }
    })

    luxuryScenario = runOneScenario('Luxury', g, r, {
      ...baseInput,
      categories: luxuryCategories,
    })
  } else if (currentLifestyle === 'luxury') {
    luxuryScenario = baseScenario

    // Reverse scale to comfortable baseline
    const comfortableCategories: ExpenseCategory[] = categories.map(cat => {
      if (cat.parentAmount != null && cat.parentFrequency) {
        return { ...cat, parentAmount: Math.round(cat.parentAmount / 1.4) }
      }
      return {
        ...cat,
        items: cat.items.map(it => ({
          ...it,
          amount: it.essential ? Math.round(it.amount / 1.15) : Math.round(it.amount / 1.5),
        })),
      }
    })

    comfortableScenario = runOneScenario('Comfortable', g, r, {
      ...baseInput,
      categories: comfortableCategories,
    })

    const bareMinCategories: ExpenseCategory[] = comfortableCategories.map(cat => {
      if (cat.parentAmount != null && cat.parentFrequency) {
        return { ...cat, parentAmount: Math.round(cat.parentAmount * 0.65) }
      }
      return {
        ...cat,
        items: cat.items.map(it => (it.essential ? it : { ...it, amount: 0, skipped: true })),
      }
    })

    bareScenario = runOneScenario('Bare Minimum', g, r, {
      ...baseInput,
      categories: bareMinCategories,
    })
  } else {
    // Current is comfortable (or custom)
    comfortableScenario = baseScenario

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

    bareScenario = runOneScenario('Bare Minimum', g, r, {
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

    luxuryScenario = runOneScenario('Luxury', g, r, {
      ...baseInput,
      categories: luxuryCategories,
    })
  }

  return [
    {
      lifestyle: 'bare_minimum',
      label: 'Frugal / Bare Minimum',
      description: 'Covers only core survival essentials (basic food, shelter, healthcare). No luxuries.',
      monthlyExpenseToday: bareScenario.currentMonthlyEquivalent,
      totalLifetimeCostOfLiving: bareScenario.totalLifetimeExpenses,
      requiredCorpus: bareScenario.isRetired ? bareScenario.requiredCorpus : bareScenario.targetCorpusAtRetirement,
      peakCorpus: bareScenario.isRetired ? bareScenario.peakCorpus : bareScenario.projectedCorpusAtRetirement,
      peakAge: bareScenario.isRetired ? bareScenario.peakCorpusAge : bareScenario.retirementAge,
    },
    {
      lifestyle: 'comfortable',
      label: 'Comfortable',
      description: 'Your configured balanced lifestyle with moderate leisure, gadgets, and vacations.',
      monthlyExpenseToday: comfortableScenario.currentMonthlyEquivalent,
      totalLifetimeCostOfLiving: comfortableScenario.totalLifetimeExpenses,
      requiredCorpus: comfortableScenario.isRetired ? comfortableScenario.requiredCorpus : comfortableScenario.targetCorpusAtRetirement,
      peakCorpus: comfortableScenario.isRetired ? comfortableScenario.peakCorpus : comfortableScenario.projectedCorpusAtRetirement,
      peakAge: comfortableScenario.isRetired ? comfortableScenario.peakCorpusAge : comfortableScenario.retirementAge,
    },
    {
      lifestyle: 'luxury',
      label: 'Luxury / Aspirational',
      description: 'Elevated lifestyle with premium housing, luxury travel, dining, and higher discretionary spending.',
      monthlyExpenseToday: luxuryScenario.currentMonthlyEquivalent,
      totalLifetimeCostOfLiving: luxuryScenario.totalLifetimeExpenses,
      requiredCorpus: luxuryScenario.isRetired ? luxuryScenario.requiredCorpus : luxuryScenario.targetCorpusAtRetirement,
      peakCorpus: luxuryScenario.isRetired ? luxuryScenario.peakCorpus : luxuryScenario.projectedCorpusAtRetirement,
      peakAge: luxuryScenario.isRetired ? luxuryScenario.peakCorpusAge : luxuryScenario.retirementAge,
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
