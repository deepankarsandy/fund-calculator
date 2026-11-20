import Decimal from 'decimal.js'
import type { YearProjection } from '../models/results'
import type { WithdrawalTiming } from '../models/profile'

export function simulatePortfolio(
  projections: YearProjection[],
  startingCorpus: number,
  annualReturn: number,
  timing: WithdrawalTiming
): YearProjection[] {
  let balance = new Decimal(startingCorpus)
  const r = new Decimal(annualReturn)

  return projections.map((row) => {
    const opening = balance
    let growth: Decimal
    let closing: Decimal

    if (timing === 'end_of_year') {
      growth = opening.mul(r)
      // Add savings surplus and subtract deficit withdrawals
      closing = opening
        .plus(growth)
        .plus(row.netSavings || 0)
        .minus(row.netWithdrawal || 0)
    } else {
      // Beginning of year timing: cashflows applied before investment growth
      const afterCashflow = opening.plus(row.netSavings || 0).minus(row.netWithdrawal || 0)
      if (afterCashflow.greaterThan(0)) {
        closing = afterCashflow.mul(r.plus(1))
        growth = closing.minus(afterCashflow)
      } else {
        closing = afterCashflow
        growth = new Decimal(0)
      }
    }

    balance = closing

    return {
      ...row,
      openingCorpus: opening.toNumber(),
      investmentGrowth: growth.toNumber(),
      closingCorpus: closing.toNumber(),
    }
  })
}
