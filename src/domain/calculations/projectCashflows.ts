import Decimal from 'decimal.js'
import type { ExpenseCategory } from '../models/expense'
import type { Assets } from '../models/assets'
import type { Assumptions } from '../models/assumptions'
import type { YearProjection } from '../models/results'
import { annualiseExpense } from './annualise'
import { projectInflation } from './projectInflation'
import { FREQUENCY_MULTIPLIERS } from '../models/expense'

export interface CashflowInput {
  categories: ExpenseCategory[]
  assets: Assets
  assumptions: Assumptions
  currentAge: number
  planningYears: number
}

interface FlatRecurring {
  annualBase: number
  inflationRate: number
  startYear: number
  endYear?: number
}

interface FlatOneTime {
  amount: number
  year: number
}

export function projectCashflows(input: CashflowInput): YearProjection[] {
  const { categories, assets, assumptions, currentAge, planningYears } = input

  // Build flat recurring expense list
  const recurringItems: FlatRecurring[] = []
  const oneTimeItems: FlatOneTime[] = []

  for (const cat of categories) {
    if (cat.skipped) continue

    // Parent-level shortcut
    if (cat.parentAmount != null && cat.parentAmount > 0 && cat.parentFrequency) {
      const mult = FREQUENCY_MULTIPLIERS[cat.parentFrequency] || 1
      recurringItems.push({
        annualBase: cat.parentAmount * mult,
        inflationRate: cat.defaultInflationRate,
        startYear: 1,
        endYear: undefined,
      })
      continue
    }

    for (const item of cat.items) {
      if (item.skipped || item.amount <= 0) continue
      const inflationRate = item.inflationRate ?? cat.defaultInflationRate
      if (item.type === 'one_time' || item.frequency === 'one_time') {
        oneTimeItems.push({ amount: item.amount, year: item.startYear })
      } else {
        recurringItems.push({
          annualBase: annualiseExpense(item),
          inflationRate,
          startYear: item.startYear,
          endYear: item.endYear,
        })
      }
    }
  }

  const projections: YearProjection[] = []
  const annualEarnedBaseline = (assets.monthlyIncome || 0) * 12

  for (let t = 1; t <= planningYears; t++) {
    const ageAtStartOfYear = currentAge + (t - 1)
    const ageAtEndOfYear = currentAge + t

    // Active Earned Income (grows with incomeGrowthRate until incomeEndAge)
    let earnedIncome = 0
    if (annualEarnedBaseline > 0 && ageAtStartOfYear < assets.incomeEndAge) {
      earnedIncome = new Decimal(annualEarnedBaseline)
        .mul(new Decimal(1).plus(assets.incomeGrowthRate).pow(t - 1))
        .toNumber()
    }

    // Recurring expenses inflated to year t
    const recurringExpense = recurringItems
      .filter(i => t >= i.startYear && (i.endYear == null || t <= i.endYear))
      .reduce((sum, i) => {
        return new Decimal(sum)
          .plus(projectInflation(i.annualBase, i.inflationRate, t - 1))
          .toNumber()
      }, 0)

    // One-time expenses occurring in year t
    const oneTimeExpense = oneTimeItems
      .filter(i => i.year === t)
      .reduce((sum, i) => sum + i.amount, 0)

    const totalExpense = recurringExpense + oneTimeExpense

    // Other income (pensions, rent)
    const otherIncome = assets.otherIncome
      .filter(inc => t >= inc.startYear && (inc.endYear == null || t <= inc.endYear))
      .reduce((sum, inc) => {
        const amount = inc.inflationLinked
          ? projectInflation(inc.annualAmount, assumptions.globalInflationRate, t - 1)
          : inc.annualAmount
        return sum + amount
      }, 0)

    // Scheduled future lump sums
    const lumpSum = assets.futureContributions
      .filter(ls => ls.year === t)
      .reduce((sum, ls) => sum + ls.amount, 0)

    const totalNonEarnedIncome = otherIncome + lumpSum
    const totalIncome = earnedIncome + totalNonEarnedIncome

    // Net Cash Flow: Income vs Expense
    const netDifference = totalIncome - totalExpense
    let netSavings = 0
    let netWithdrawal = 0

    if (netDifference >= 0) {
      // Income exceeds expenses -> Surplus goes to investment!
      netSavings = netDifference
      netWithdrawal = 0
    } else {
      // Expenses exceed income -> Deficit withdrawn from savings!
      netSavings = 0
      netWithdrawal = Math.abs(netDifference)
    }

    projections.push({
      year: t,
      age: ageAtEndOfYear,
      expenses: totalExpense,
      earnedIncome,
      otherIncome: totalNonEarnedIncome,
      totalIncome,
      netSavings,
      netWithdrawal,
      investmentGrowth: 0,
      openingCorpus: 0,
      closingCorpus: 0,
    })
  }

  return projections
}
