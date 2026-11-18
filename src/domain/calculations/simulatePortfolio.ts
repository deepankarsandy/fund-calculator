import Decimal from 'decimal.js'
import type { YearProjection } from '../models/results'
import type { WithdrawalTiming } from '../models/profile'

export function simulatePortfolio(
  projections: YearProjection[],
  startingCorpus: number,
  annualReturn: number,
  timing: WithdrawalTiming,
): YearProjection[] {
  let balance = new Decimal(startingCorpus)
  const r = new Decimal(annualReturn)

  return projections.map(row => {
    const opening = balance
    let growth: Decimal
    let closing: Decimal

    if (timing === 'end_of_year') {
      growth = opening.mul(r)
      closing = opening.plus(growth).minus(row.netWithdrawal)
    } else {
      const afterWithdrawal = opening.minus(row.netWithdrawal)
      closing = afterWithdrawal.mul(r.plus(1))
      growth = closing.minus(afterWithdrawal)
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
