import Decimal from 'decimal.js'
import type { ExpenseItem } from '../models/expense'
import { FREQUENCY_MULTIPLIERS } from '../models/expense'

/** Returns the annualised amount for a recurring expense item. */
export function annualiseExpense(item: ExpenseItem): number {
  if (item.skipped || item.amount <= 0) return 0
  if (item.frequency === 'one_time') return 0
  if (item.frequency === 'every_n_years') {
    if (!item.everyNYears || item.everyNYears <= 0) return 0
    return new Decimal(item.amount).div(item.everyNYears).toNumber()
  }
  const multiplier = FREQUENCY_MULTIPLIERS[item.frequency]
  return new Decimal(item.amount).mul(multiplier).toNumber()
}

/** Returns total current annual expense from a list of items. */
export function totalAnnualExpense(items: ExpenseItem[]): number {
  return items.reduce((sum, item) => {
    return new Decimal(sum).plus(annualiseExpense(item)).toNumber()
  }, 0)
}
