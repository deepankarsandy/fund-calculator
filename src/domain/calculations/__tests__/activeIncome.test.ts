import { describe, it, expect } from 'vitest'
import { projectCashflows } from '../projectCashflows'
import { simulatePortfolio } from '../simulatePortfolio'
import { runScenarios } from '../runScenarios'
import type { ExpenseCategory } from '../../models/expense'
import { DEFAULT_ASSETS, type Assets } from '../../models/assets'
import { DEFAULT_ASSUMPTIONS, type Assumptions } from '../../models/assumptions'
import { DEFAULT_PROFILE, type Profile } from '../../models/profile'

describe('Active Earned Income & Career Savings Cashflow Projections', () => {
  const baseAssumptions: Assumptions = {
    ...DEFAULT_ASSUMPTIONS,
    annualInvestmentReturn: 0.10,
    globalInflationRate: 0.06,
    withdrawalTiming: 'beginning_of_year',
  }

  const baseCategories: ExpenseCategory[] = [
    {
      id: 'housing',
      label: 'Housing Expenses',
      description: 'Living costs',
      defaultInflationRate: 0.06,
      parentAmount: 50000, // 50k per month = 6,00,000 / year
      parentFrequency: 'monthly',
      skipped: false,
      items: [],
    },
  ]

  it('calculates surplus when monthly income exceeds expenses and grows with increment', () => {
    const assets: Assets = {
      ...DEFAULT_ASSETS,
      existingInvestableCorpus: 1000000, // 10 Lakhs
      monthlyIncome: 100000,             // 1 Lakh/month = 12 Lakhs/year
      incomeEndAge: 40,                  // works till 40
      incomeGrowthRate: 0.10,            // 10% annual salary hike
    }

    const currentAge = 35 // 5 working years (age 35, 36, 37, 38, 39)
    const planningYears = 10

    const projections = projectCashflows({
      categories: baseCategories,
      assets,
      assumptions: baseAssumptions,
      currentAge,
      planningYears,
    })

    // Year 1 (Age 35 -> 36):
    // Earned income = 12,00,000
    // Expenses = 6,00,000
    // Surplus (netSavings) = 6,00,000
    // netWithdrawal = 0
    expect(projections[0].earnedIncome).toBe(1200000)
    expect(projections[0].expenses).toBe(600000)
    expect(projections[0].netSavings).toBe(600000)
    expect(projections[0].netWithdrawal).toBe(0)

    // Year 2 (Age 36 -> 37):
    // Earned income = 12,00,000 * 1.10 = 13,20,000
    // Expenses = 6,00,000 * 1.06 = 6,36,000
    // Surplus = 13,20,000 - 6,36,000 = 6,84,000
    expect(projections[1].earnedIncome).toBeCloseTo(1320000, 1)
    expect(projections[1].expenses).toBeCloseTo(636000, 1)
    expect(projections[1].netSavings).toBeCloseTo(684000, 1)
    expect(projections[1].netWithdrawal).toBe(0)

    // Year 6 (Age 40 -> 41, retirement reached):
    // Earned income = 0
    // Expenses = 600,000 * (1.06)^5 = 802,935.34
    // netSavings = 0
    // netWithdrawal = expenses
    expect(projections[5].earnedIncome).toBe(0)
    expect(projections[5].netSavings).toBe(0)
    expect(projections[5].netWithdrawal).toBeGreaterThan(800000)
  })

  it('portfolio accumulates during surplus years and decumulates during retirement', () => {
    const assets: Assets = {
      ...DEFAULT_ASSETS,
      existingInvestableCorpus: 500000,
      monthlyIncome: 100000,
      incomeEndAge: 40,
      incomeGrowthRate: 0.08,
    }

    const currentAge = 35
    const planningYears = 15

    const projections = projectCashflows({
      categories: baseCategories,
      assets,
      assumptions: baseAssumptions,
      currentAge,
      planningYears,
    })

    const simulated = simulatePortfolio(
      projections,
      assets.existingInvestableCorpus,
      baseAssumptions.annualInvestmentReturn,
      baseAssumptions.withdrawalTiming
    )

    // At retirement year 5 (age 40), the portfolio should have grown significantly
    const balanceAtRetirement = simulated[4].closingCorpus
    expect(balanceAtRetirement).toBeGreaterThan(assets.existingInvestableCorpus)

    // After retirement (e.g. year 10), without income, the corpus starts getting drawn down
    const balanceAfterRetirement = simulated[simulated.length - 1].closingCorpus
    expect(balanceAtRetirement).toBeGreaterThan(balanceAfterRetirement)
  })

  it('runs scenarios and reports career savings and peak corpus', () => {
    const profile: Profile = {
      ...DEFAULT_PROFILE,
      currentAge: 30,
      targetAge: 80,
      areaType: 'city',
    }

    const assets: Assets = {
      ...DEFAULT_ASSETS,
      existingInvestableCorpus: 1000000,
      monthlyIncome: 120000,
      incomeEndAge: 55,
      incomeGrowthRate: 0.08,
    }

    const result = runScenarios({
      profile,
      members: [],
      categories: baseCategories,
      assets,
      assumptions: baseAssumptions,
    })

    const baseScenario = result.scenarios.find(s => s.label === 'Base')
    expect(baseScenario).toBeDefined()
    expect(baseScenario!.totalAccumulatedSavings).toBeGreaterThan(0)
    expect(baseScenario!.peakCorpus).toBeGreaterThan(1000000)
    expect(baseScenario!.peakCorpusAge).toBeGreaterThanOrEqual(50)
    expect(baseScenario!.totalLifetimeExpenses).toBeGreaterThan(0)
    expect(baseScenario!.totalLifetimeIncome).toBeGreaterThan(0)

    // Lifestyle comparisons
    expect(result.lifestyleComparisons).toHaveLength(3)
    const [bare, comfortable, luxury] = result.lifestyleComparisons
    expect(bare.totalLifetimeCostOfLiving).toBeLessThan(comfortable.totalLifetimeCostOfLiving)
    expect(comfortable.totalLifetimeCostOfLiving).toBeLessThan(luxury.totalLifetimeCostOfLiving)

    // Warnings include dependents recommendation when no dependents are present
    expect(result.warnings.some(w => w.includes('No dependents'))).toBe(true)
  })
})
