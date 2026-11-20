import type { ExpenseCategory } from '../models/expense'
import type { Assets } from '../models/assets'
import type { Assumptions } from '../models/assumptions'
import type { Profile } from '../models/profile'
import type { ScenarioResult, ShortfallRemedies } from '../models/results'
import { calculateCorpus } from './corpusFormula'
import { projectCashflows } from './projectCashflows'
import { simulatePortfolio } from './simulatePortfolio'

export interface ShortfallRemediesInput {
  scenario: ScenarioResult
  profile: Profile
  assets: Assets
  assumptions: Assumptions
  categories: ExpenseCategory[]
}

export function calculateShortfallRemedies(input: ShortfallRemediesInput): ShortfallRemedies {
  const { scenario, profile, assets, assumptions, categories } = input

  // Check if scenario has a shortfall
  const hasShortfall =
    scenario.readinessScore < 100 || scenario.retirementFundingGap > 0 || scenario.fundingGap > 0

  const shortfallAmountAtRetirement = scenario.retirementFundingGap
  const discountedShortfallToday = scenario.fundingGap

  // 1. Current Savings Remedy: How much total and extra current savings need to be
  const currentSavings = assets.existingInvestableCorpus || 0
  const extraSavingsNeeded = hasShortfall ? discountedShortfallToday : 0
  const totalSavingsNeeded = currentSavings + extraSavingsNeeded

  const savingsRemedy = {
    currentSavings,
    totalSavingsNeeded: Math.round(totalSavingsNeeded),
    extraSavingsNeeded: Math.round(extraSavingsNeeded),
  }

  // If there is no shortfall, other remedies require 0 change
  if (!hasShortfall) {
    return {
      hasShortfall: false,
      shortfallAmountAtRetirement: 0,
      discountedShortfallToday: 0,
      savingsRemedy,
      salaryRemedy: {
        currentMonthlySalary: assets.monthlyIncome || 0,
        totalMonthlySalaryNeeded: assets.monthlyIncome || 0,
        extraMonthlySalaryNeeded: 0,
        percentIncreaseNeeded: 0,
        isAchievable: true,
      },
      retirementAgeRemedy: {
        currentRetirementAge: scenario.retirementAge,
        recommendedRetirementAge: scenario.retirementAge,
        extraYearsToWork: 0,
        remainingRetirementYears: scenario.retirementYears,
        isAchievable: true,
      },
    }
  }

  // 2. Monthly Salary Remedy: How much current monthly salary needs to be
  const currentMonthlySalary = assets.monthlyIncome || 0
  let totalMonthlySalaryNeeded = currentMonthlySalary
  let extraMonthlySalaryNeeded = 0
  let percentIncreaseNeeded = 0
  let salaryAchievable = true
  let salaryNote: string | undefined

  if (scenario.workingYears <= 0) {
    salaryAchievable = false
    salaryNote = 'Not applicable because you are already at or past your target retirement age.'
  } else {
    // Helper to test a monthly salary
    const testSalary = (salary: number): number => {
      const rawProjections = projectCashflows({
        categories,
        assets: { ...assets, monthlyIncome: Math.max(0, salary) },
        assumptions: {
          ...assumptions,
          globalInflationRate: scenario.inflationRate,
          annualInvestmentReturn: scenario.returnRate,
        },
        currentAge: profile.currentAge,
        planningYears: profile.targetAge - profile.currentAge,
      })

      const sim = simulatePortfolio(
        rawProjections,
        assets.existingInvestableCorpus,
        scenario.returnRate,
        assumptions.withdrawalTiming
      )

      return sim[scenario.workingYears - 1]?.closingCorpus ?? assets.existingInvestableCorpus
    }

    const targetCorpus = scenario.targetCorpusAtRetirement

    // Binary search for required monthly salary
    let low = currentMonthlySalary
    const roughExtraNeeded = Math.ceil(shortfallAmountAtRetirement / (scenario.workingYears * 12))
    let high = Math.max(currentMonthlySalary + roughExtraNeeded * 3, currentMonthlySalary + 5000000)

    // Expand high if necessary
    for (let i = 0; i < 5; i++) {
      if (testSalary(high) >= targetCorpus) break
      high *= 2
    }

    if (testSalary(high) < targetCorpus) {
      salaryAchievable = false
      salaryNote =
        'Shortfall is too large to be bridged by salary alone within remaining working years.'
    } else {
      for (let iter = 0; iter < 32; iter++) {
        const mid = (low + high) / 2
        const projected = testSalary(mid)
        if (projected >= targetCorpus) {
          high = mid
        } else {
          low = mid
        }
      }

      totalMonthlySalaryNeeded = Math.ceil(high)
      extraMonthlySalaryNeeded = Math.max(0, totalMonthlySalaryNeeded - currentMonthlySalary)
      percentIncreaseNeeded =
        currentMonthlySalary > 0
          ? Math.round((extraMonthlySalaryNeeded / currentMonthlySalary) * 1000) / 10
          : 0
    }
  }

  const salaryRemedy = {
    currentMonthlySalary,
    totalMonthlySalaryNeeded,
    extraMonthlySalaryNeeded,
    percentIncreaseNeeded,
    isAchievable: salaryAchievable,
    note: salaryNote,
  }

  // 3. Retirement Age Remedy: How long / retirement age the person needs to continue to work
  const currentRetirementAge = scenario.retirementAge
  let recommendedRetirementAge = currentRetirementAge
  let extraYearsToWork = 0
  let remainingRetirementYears = scenario.retirementYears
  let retirementAgeAchievable = false
  let retirementAgeNote: string | undefined

  if (currentRetirementAge >= profile.targetAge) {
    retirementAgeAchievable = false
    retirementAgeNote = `Target retirement age (${currentRetirementAge}) is already at or beyond planning horizon (${profile.targetAge}).`
  } else {
    // Test each subsequent retirement age from currentRetirementAge + 1 up to profile.targetAge
    for (let candAge = currentRetirementAge + 1; candAge <= profile.targetAge; candAge++) {
      const candWorkingYears = candAge - profile.currentAge
      const candRetirementYears = profile.targetAge - candAge

      const rawProjections = projectCashflows({
        categories,
        assets: { ...assets, incomeEndAge: candAge },
        assumptions: {
          ...assumptions,
          globalInflationRate: scenario.inflationRate,
          annualInvestmentReturn: scenario.returnRate,
        },
        currentAge: profile.currentAge,
        planningYears: profile.targetAge - profile.currentAge,
      })

      const sim = simulatePortfolio(
        rawProjections,
        assets.existingInvestableCorpus,
        scenario.returnRate,
        assumptions.withdrawalTiming
      )

      const candProjectedCorpus =
        sim[candWorkingYears - 1]?.closingCorpus ?? assets.existingInvestableCorpus

      // Calculate target corpus needed at this new retirement age
      let candTargetCorpus = 0
      if (candRetirementYears > 0) {
        const firstRetirementExpense =
          rawProjections[candWorkingYears]?.expenses ??
          scenario.currentAnnualExpense * Math.pow(1 + scenario.inflationRate, candWorkingYears)
        const firstRetirementOtherIncome = rawProjections[candWorkingYears]?.otherIncome ?? 0
        const netRetirementAnnualBaseline = Math.max(
          0,
          firstRetirementExpense - firstRetirementOtherIncome
        )

        candTargetCorpus = calculateCorpus(
          netRetirementAnnualBaseline,
          scenario.returnRate,
          scenario.inflationRate,
          candRetirementYears,
          assumptions.withdrawalTiming
        )
      }

      if (candProjectedCorpus >= candTargetCorpus) {
        recommendedRetirementAge = candAge
        extraYearsToWork = candAge - currentRetirementAge
        remainingRetirementYears = candRetirementYears
        retirementAgeAchievable = true
        break
      }
    }

    if (!retirementAgeAchievable) {
      retirementAgeNote = `Extending retirement up to Age ${profile.targetAge} alone is not sufficient to bridge the shortfall with current monthly savings rate. Consider Option 1 (Savings) or Option 2 (Salary).`
    }
  }

  const retirementAgeRemedy = {
    currentRetirementAge,
    recommendedRetirementAge,
    extraYearsToWork,
    remainingRetirementYears,
    isAchievable: retirementAgeAchievable,
    note: retirementAgeNote,
  }

  return {
    hasShortfall: true,
    shortfallAmountAtRetirement,
    discountedShortfallToday,
    savingsRemedy,
    salaryRemedy,
    retirementAgeRemedy,
  }
}
