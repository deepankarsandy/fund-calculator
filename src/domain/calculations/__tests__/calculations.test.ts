import { describe, it, expect } from 'vitest'
import { projectInflation } from '../projectInflation'
import { calculateCorpus } from '../corpusFormula'
import { simulatePortfolio } from '../simulatePortfolio'
import type { YearProjection } from '../../models/results'

describe('projectInflation', () => {
  it('Test 2: ₹1,00,000 at 5% for 10 years ≈ ₹1,62,889', () => {
    const result = projectInflation(100000, 0.05, 10)
    expect(result).toBeCloseTo(162889, -1)
  })

  it('returns original amount when years = 0', () => {
    expect(projectInflation(100000, 0.05, 0)).toBe(100000)
  })

  it('returns 0 when amount is 0', () => {
    expect(projectInflation(0, 0.05, 10)).toBe(0)
  })
})

describe('calculateCorpus - Convention A', () => {
  it('Test 3: basic growing annuity', () => {
    // E0=100000, r=0.07, g=0.05, n=10, end-of-year
    const corpus = calculateCorpus(100000, 0.07, 0.05, 10, 'end_of_year')
    // Formula: 100000 × [1 - (1.05/1.07)^10] / (0.07 - 0.05)
    const expected = (100000 * (1 - Math.pow(1.05 / 1.07, 10))) / (0.07 - 0.05)
    expect(corpus).toBeCloseTo(expected, 0)
  })

  it('Test 4: r = g special case — no division by zero', () => {
    // C = E0 × n / (1 + r)
    const corpus = calculateCorpus(100000, 0.05, 0.05, 10, 'end_of_year')
    const expected = (100000 * 10) / 1.05
    expect(corpus).toBeCloseTo(expected, 0)
  })

  it('Test 5: g = 0 reduces to level annuity PV', () => {
    // PV of level annuity = E0 × [1 - (1+r)^-n] / r
    const corpus = calculateCorpus(100000, 0.07, 0, 10, 'end_of_year')
    const expected = (100000 * (1 - Math.pow(1.07, -10))) / 0.07
    expect(corpus).toBeCloseTo(expected, 0)
  })

  it('Test 9: beginning-of-year corpus > end-of-year corpus', () => {
    const eoy = calculateCorpus(100000, 0.07, 0.05, 10, 'end_of_year')
    const boy = calculateCorpus(100000, 0.07, 0.05, 10, 'beginning_of_year')
    expect(boy).toBeGreaterThan(eoy)
  })

  it('Test 10: longer horizon does not decrease corpus', () => {
    const c50 = calculateCorpus(100000, 0.07, 0.05, 50, 'end_of_year')
    const c55 = calculateCorpus(100000, 0.07, 0.05, 55, 'end_of_year')
    expect(c55).toBeGreaterThanOrEqual(c50)
  })

  it('returns 0 for n = 0', () => {
    expect(calculateCorpus(100000, 0.07, 0.05, 0)).toBe(0)
  })
})

describe('simulatePortfolio reconciliation', () => {
  it('Test 3: corpus from formula depletes to ~0 after n withdrawals', () => {
    const e0 = 100000
    const r = 0.07
    const g = 0.05
    const n = 10
    const corpus = calculateCorpus(e0, r, g, n, 'end_of_year')

    // Build projections manually with inflating withdrawals
    const projections: YearProjection[] = Array.from({ length: n }, (_, i) => ({
      year: i + 1,
      age: 30 + i + 1,
      earnedIncome: 0,
      otherIncome: 0,
      totalIncome: 0,
      expenses: e0 * Math.pow(1 + g, i),
      netSavings: 0,
      netWithdrawal: e0 * Math.pow(1 + g, i),
      investmentGrowth: 0,
      openingCorpus: 0,
      closingCorpus: 0,
    }))

    const simulated = simulatePortfolio(projections, corpus, r, 'end_of_year')
    const finalBalance = simulated[simulated.length - 1].closingCorpus
    expect(Math.abs(finalBalance)).toBeLessThan(1) // within ₹1
  })
})
