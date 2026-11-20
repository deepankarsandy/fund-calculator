import { describe, it, expect } from 'vitest'
import { runScenarios } from '../runScenarios'
import type { ExpenseCategory } from '../../models/expense'
import { DEFAULT_ASSETS, type Assets } from '../../models/assets'
import { DEFAULT_ASSUMPTIONS, type Assumptions } from '../../models/assumptions'
import { DEFAULT_PROFILE, type Profile } from '../../models/profile'

describe('Shortfall Remedies (3 Independent OR Pathways)', () => {
  const assumptions: Assumptions = {
    ...DEFAULT_ASSUMPTIONS,
    annualInvestmentReturn: 0.10, // 10%
    globalInflationRate: 0.06,    // 6%
    withdrawalTiming: 'beginning_of_year',
  }

  // Monthly living expense: 1,00,000 / month = 12 Lakhs / year
  const categories: ExpenseCategory[] = [
    {
      id: 'housing',
      label: 'Living Costs',
      description: 'Household',
      defaultInflationRate: 0.06,
      parentAmount: 100000,
      parentFrequency: 'monthly',
      skipped: false,
      items: [],
    },
  ]

  it('calculates 3 independent OR pathways when retirement plan has a shortfall', () => {
    // Current age 35, plans to retire at 55 (20 working years), lifespan till 80 (25 retirement years)
    const profile: Profile = {
      ...DEFAULT_PROFILE,
      currentAge: 35,
      targetAge: 80,
    }

    // Monthly income 1,20,000 / month.
    // Saving 20k/mo initially with 5% annual hike.
    // Starting liquid savings: 10 Lakhs.
    const assets: Assets = {
      ...DEFAULT_ASSETS,
      existingInvestableCorpus: 1000000,
      monthlyIncome: 120000,
      incomeEndAge: 55,
      incomeGrowthRate: 0.05,
    }

    const results = runScenarios({
      profile,
      members: [],
      categories,
      assumptions,
      assets,
    })

    const base = results.scenarios[1] // Base scenario
    expect(base.retirementFundingGap).toBeGreaterThan(0)
    expect(base.shortfallRemedies).toBeDefined()

    const remedies = base.shortfallRemedies!
    expect(remedies.hasShortfall).toBe(true)

    // 1. Savings Pathway
    expect(remedies.savingsRemedy.currentSavings).toBe(1000000)
    expect(remedies.savingsRemedy.extraSavingsNeeded).toBeGreaterThan(0)
    expect(remedies.savingsRemedy.totalSavingsNeeded).toBe(
      remedies.savingsRemedy.currentSavings + remedies.savingsRemedy.extraSavingsNeeded,
    )

    // 2. Monthly Salary Pathway
    expect(remedies.salaryRemedy.isAchievable).toBe(true)
    expect(remedies.salaryRemedy.currentMonthlySalary).toBe(120000)
    expect(remedies.salaryRemedy.totalMonthlySalaryNeeded).toBeGreaterThan(120000)
    expect(remedies.salaryRemedy.extraMonthlySalaryNeeded).toBe(
      remedies.salaryRemedy.totalMonthlySalaryNeeded - 120000,
    )
    expect(remedies.salaryRemedy.percentIncreaseNeeded).toBeGreaterThan(0)

    // Verify that applying the new salary alone eliminates the shortfall:
    const resultsWithNewSalary = runScenarios({
      profile,
      members: [],
      categories,
      assumptions,
      assets: {
        ...assets,
        monthlyIncome: remedies.salaryRemedy.totalMonthlySalaryNeeded,
      },
    })
    const baseWithNewSalary = resultsWithNewSalary.scenarios[1]
    expect(baseWithNewSalary.readinessScore).toBeGreaterThanOrEqual(100)
    expect(baseWithNewSalary.retirementFundingGap).toBe(0)

    // 3. Retirement Age Pathway
    expect(remedies.retirementAgeRemedy.isAchievable).toBe(true)
    expect(remedies.retirementAgeRemedy.currentRetirementAge).toBe(55)
    expect(remedies.retirementAgeRemedy.recommendedRetirementAge).toBeGreaterThan(55)
    expect(remedies.retirementAgeRemedy.extraYearsToWork).toBe(
      remedies.retirementAgeRemedy.recommendedRetirementAge - 55,
    )
    expect(remedies.retirementAgeRemedy.remainingRetirementYears).toBe(
      80 - remedies.retirementAgeRemedy.recommendedRetirementAge,
    )

    // Verify that applying the recommended retirement age alone eliminates the shortfall:
    const resultsWithNewRetirementAge = runScenarios({
      profile,
      members: [],
      categories,
      assumptions,
      assets: {
        ...assets,
        incomeEndAge: remedies.retirementAgeRemedy.recommendedRetirementAge,
      },
    })
    const baseWithNewRetirementAge = resultsWithNewRetirementAge.scenarios[1]
    expect(baseWithNewRetirementAge.readinessScore).toBeGreaterThanOrEqual(100)
    expect(baseWithNewRetirementAge.retirementFundingGap).toBe(0)

    // Verify that applying total current savings alone eliminates the shortfall:
    const resultsWithNewSavings = runScenarios({
      profile,
      members: [],
      categories,
      assumptions,
      assets: {
        ...assets,
        existingInvestableCorpus: remedies.savingsRemedy.totalSavingsNeeded,
      },
    })
    const baseWithNewSavings = resultsWithNewSavings.scenarios[1]
    expect(baseWithNewSavings.readinessScore).toBeGreaterThanOrEqual(100)
    expect(baseWithNewSavings.retirementFundingGap).toBe(0)
  })

  it('reports zero extra needed when plan is already fully funded', () => {
    const profile: Profile = {
      ...DEFAULT_PROFILE,
      currentAge: 30,
      targetAge: 80,
    }

    // High salary and large initial savings -> Fully funded
    const assets: Assets = {
      ...DEFAULT_ASSETS,
      existingInvestableCorpus: 50000000, // 5 Cr
      monthlyIncome: 300000,
      incomeEndAge: 60,
      incomeGrowthRate: 0.08,
    }

    const results = runScenarios({
      profile,
      members: [],
      categories,
      assumptions,
      assets,
    })

    const base = results.scenarios[1]
    expect(base.readinessScore).toBeGreaterThanOrEqual(100)
    expect(base.shortfallRemedies?.hasShortfall).toBe(false)
    expect(base.shortfallRemedies?.savingsRemedy.extraSavingsNeeded).toBe(0)
    expect(base.shortfallRemedies?.salaryRemedy.extraMonthlySalaryNeeded).toBe(0)
    expect(base.shortfallRemedies?.retirementAgeRemedy.extraYearsToWork).toBe(0)
  })
})
