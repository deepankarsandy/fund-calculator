import Decimal from 'decimal.js'

/**
 * Future nominal amount after `years` of inflation.
 * Formula: amount × (1 + rate)^years
 */
export function projectInflation(amount: number, rate: number, years: number): number {
  if (years === 0) return amount
  if (amount === 0) return 0
  return new Decimal(amount).mul(new Decimal(1).plus(rate).pow(years)).toNumber()
}

/** Today's purchasing-power equivalent of a future nominal amount. */
export function deflate(futureAmount: number, rate: number, years: number): number {
  if (years === 0) return futureAmount
  return new Decimal(futureAmount).div(new Decimal(1).plus(rate).pow(years)).toNumber()
}

/** Project to multiple standard horizons: 5, 10, 20, 30 years */
export function projectHorizons(amount: number, rate: number): Record<number, number> {
  return {
    5: projectInflation(amount, rate, 5),
    10: projectInflation(amount, rate, 10),
    20: projectInflation(amount, rate, 20),
    30: projectInflation(amount, rate, 30),
  }
}
