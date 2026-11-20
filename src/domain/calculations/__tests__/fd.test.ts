import { describe, it, expect } from 'vitest'
import { calculateFd } from '../fd'

describe('calculateFd', () => {
  it('calculates 5-year cumulative quarterly compounding bank FD', () => {
    const res = calculateFd({
      principalAmount: 200000,
      annualInterestRate: 7.0,
      tenureYears: 5,
      tenureMonths: 0,
      compoundingFrequency: 'quarterly',
      payoutType: 'cumulative',
      enableTax: false,
    })

    expect(res.principalAmount).toBe(200000)
    // 200,000 * (1 + 0.07/4)^20 = approx 282,956
    expect(res.maturityAmount).toBeGreaterThan(280000)
    expect(res.maturityAmount).toBeLessThan(285000)
    expect(res.totalInterestEarned).toBe(res.maturityAmount - 200000)
    expect(res.effectiveYieldPercent).toBeGreaterThan(7.0)
    expect(res.yearlySchedule).toHaveLength(5)
  })

  it('adds +0.50% rate bonus for senior citizen deposits', () => {
    const regular = calculateFd({
      principalAmount: 100000,
      annualInterestRate: 7.0,
      isSeniorCitizen: false,
      tenureYears: 3,
    })

    const senior = calculateFd({
      principalAmount: 100000,
      annualInterestRate: 7.0,
      isSeniorCitizen: true,
      tenureYears: 3,
    })

    expect(senior.effectiveAnnualRate).toBe(7.5)
    expect(senior.maturityAmount).toBeGreaterThan(regular.maturityAmount)
  })

  it('calculates Section 194A TDS when annual interest exceeds ₹40,000 threshold', () => {
    const res = calculateFd({
      principalAmount: 1000000, // 10 Lakhs at 7.0% gives ~70k annual interest
      annualInterestRate: 7.0,
      tenureYears: 1,
      isSeniorCitizen: false,
      enableTax: true,
      hasSubmittedForm15G: false,
      taxSlabRatePercent: 20,
    })

    expect(res.estimatedTds).toBeGreaterThan(0)
    expect(res.estimatedTaxLiability).toBe(Math.round(res.totalInterestEarned * 0.20))
  })

  it('exempts TDS when Form 15G/15H is submitted', () => {
    const res = calculateFd({
      principalAmount: 1000000,
      annualInterestRate: 7.0,
      tenureYears: 1,
      hasSubmittedForm15G: true,
      enableTax: true,
    })

    expect(res.estimatedTds).toBe(0)
  })

  it('calculates non-cumulative regular interest payouts', () => {
    const res = calculateFd({
      principalAmount: 1200000,
      annualInterestRate: 6.0,
      tenureYears: 2,
      payoutType: 'monthly',
    })

    // Monthly payout = 1,200,000 * 6% / 12 = 6,000
    expect(res.periodicPayoutAmount).toBe(6000)
    expect(res.maturityAmount).toBe(1200000)
    expect(res.totalInterestEarned).toBe(144000)
  })

  it('handles zero principal gracefully', () => {
    const res = calculateFd({
      principalAmount: 0,
      tenureYears: 3,
    })
    expect(res.maturityAmount).toBe(0)
    expect(res.totalInterestEarned).toBe(0)
  })
})
