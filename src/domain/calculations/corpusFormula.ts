import Decimal from 'decimal.js'
import type { WithdrawalTiming } from '../models/profile'

/**
 * Required corpus — Convention A: first year-end withdrawal equals E0.
 *
 * When r ≠ g:  C = E0 × [1 - ((1+g)/(1+r))^n] / (r - g)
 * When r = g:  C = E0 × n / (1 + r)
 *
 * For beginning-of-year withdrawals, multiply result by (1 + r).
 */
export function calculateCorpus(
  e0: number,
  r: number,
  g: number,
  n: number,
  timing: WithdrawalTiming = 'end_of_year',
): number {
  if (n <= 0 || e0 <= 0) return 0

  const E0 = new Decimal(e0)
  const R = new Decimal(r)
  const G = new Decimal(g)
  const N = new Decimal(n)

  let corpus: Decimal

  if (R.minus(G).abs().lessThan(1e-10)) {
    // Special case r ≈ g: C = E0 × n / (1 + r)
    corpus = E0.mul(N).div(R.plus(1))
  } else {
    // C = E0 × [1 - ((1+g)/(1+r))^n] / (r - g)
    const ratio = G.plus(1).div(R.plus(1))
    const bracket = new Decimal(1).minus(ratio.pow(N))
    corpus = E0.mul(bracket).div(R.minus(G))
  }

  if (timing === 'beginning_of_year') {
    corpus = corpus.mul(R.plus(1))
  }

  return corpus.toNumber()
}

/** Net effective return after fees and taxes from a gross return. */
export function netReturn(
  grossReturn: number,
  feeRate: number,
  taxDrag: number,
): number {
  return new Decimal(grossReturn).minus(feeRate).minus(taxDrag).toNumber()
}

/** Approximate real return: (1+nominal)/(1+inflation) - 1 */
export function realReturn(nominalReturn: number, inflationRate: number): number {
  return new Decimal(1)
    .plus(nominalReturn)
    .div(new Decimal(1).plus(inflationRate))
    .minus(1)
    .toNumber()
}
