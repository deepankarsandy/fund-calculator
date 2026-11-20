import { describe, it, expect } from 'vitest'
import {
  calculateCustomPlan,
  calculateAnnualIRR,
  DEFAULT_CUSTOM_PLAN_INPUTS,
  PLAN_PRESETS,
} from '../customPlan'

describe('customPlan calculation and XIRR', () => {
  it('calculates the exact scenario from user: 1L/yr for 10 yrs, yr 15-40 receive payouts', () => {
    // Invest ₹1L/yr for 10 years (Yr 1 to 10)
    // From Yr 15 till Yr 40 (26 years), receive ₹1,20,000/yr + ₹10,00,000 maturity at Yr 40
    const res = calculateCustomPlan({
      ...DEFAULT_CUSTOM_PLAN_INPUTS,
      annualInvestment: 100000,
      investmentDurationYears: 10,
      payoutStartYear: 15,
      payoutDurationYears: 26,
      annualPayout: 120000,
      maturityLumpSum: 1000000,
      inflationRatePercent: 6.0,
    })

    // Total invested: 10 * 100,000 = 1,000,000
    expect(res.totalInvested).toBe(1000000)

    // Total received: 26 * 120,000 + 1,000,000 = 3,120,000 + 1,000,000 = 4,120,000
    expect(res.totalReceived).toBe(4120000)

    // Gain multiplier: 4.12x
    expect(res.gainMultiplier).toBe(4.12)
    expect(res.netProfit).toBe(3120000)

    // XIRR should be around 5.5% - 6.0% (typical for Indian guaranteed income plans!)
    expect(res.xirrPercent).toBeGreaterThan(5.0)
    expect(res.xirrPercent).toBeLessThan(7.0)

    // Real return should be near 0% because inflation is 6.0%
    expect(res.realXirrPercent).toBeCloseTo(res.xirrPercent - 6.0, 0)

    // Total Real purchasing power should be substantially lower than 41.2 Lakhs
    expect(res.totalRealPurchasingPower).toBeLessThan(res.totalReceived)
    expect(res.totalRealPurchasingPower).toBeLessThan(2000000) // Less than half!
    expect(res.purchasingPowerLossPercent).toBeGreaterThan(50) // More than 50% purchasing power lost!

    // Schedule verification
    expect(res.schedule).toHaveLength(40)
    expect(res.schedule[0].invested).toBe(100000)
    expect(res.schedule[9].invested).toBe(100000)
    expect(res.schedule[10].invested).toBe(0) // Yr 11: waiting period
    expect(res.schedule[13].received).toBe(0) // Yr 14: waiting period
    expect(res.schedule[14].received).toBe(120000) // Yr 15: first payout
    expect(res.schedule[39].received).toBe(1120000) // Yr 40: 1.2L payout + 10L maturity
  })

  it('accurately calculates IRR using calculateAnnualIRR for a known cash flow', () => {
    // Invest 1000 at t=0, receive 1100 at t=1 -> IRR is exactly 10%
    const simple = calculateAnnualIRR([
      { t: 0, amount: -1000 },
      { t: 1, amount: 1100 },
    ])
    expect(simple).not.toBeNull()
    expect(Number((simple! * 100).toFixed(2))).toBe(10.0)

    // Invest 100,000 at t=0, receive 200,000 at t=7 -> (2)^(1/7) - 1 = 10.41%
    const doubleIn7 = calculateAnnualIRR([
      { t: 0, amount: -100000 },
      { t: 7, amount: 200000 },
    ])
    expect(doubleIn7).not.toBeNull()
    expect(Number((doubleIn7! * 100).toFixed(2))).toBe(10.41)
  })

  it('handles lump-sum only return mode correctly', () => {
    const res = calculateCustomPlan({
      investmentInputType: 'per_year',
      annualInvestment: 150000,
      investmentStartYear: 1,
      investmentDurationYears: 10,
      payoutType: 'lumpsum_only',
      payoutStartYear: 20,
      maturityLumpSum: 3600000,
      inflationRatePercent: 6.0,
    })

    expect(res.totalInvested).toBe(1500000)
    expect(res.totalReceived).toBe(3600000)
    expect(res.xirrPercent).toBeGreaterThan(5.0)
    expect(res.xirrPercent).toBeLessThan(7.5)
    expect(res.schedule[19].received).toBe(3600000)
  })

  it('handles custom year-by-year schedule with money-back survival benefits', () => {
    const moneyBackPreset = PLAN_PRESETS.find((p) => p.id === 'money_back')!
    const res = calculateCustomPlan(moneyBackPreset.inputs)

    expect(res.totalInvested).toBe(1500000)
    // 3 survival benefits of 2L each + 15L maturity = 21 Lakhs
    expect(res.totalReceived).toBe(2100000)
    expect(res.schedule[4].received).toBe(200000) // Year 5
    expect(res.schedule[9].received).toBe(200000) // Year 10
    expect(res.schedule[14].received).toBe(200000) // Year 15
    expect(res.schedule[19].received).toBe(1500000) // Year 20
    expect(res.xirrPercent).toBeGreaterThan(0)
  })

  it('handles total investment mode evenly distributed', () => {
    const res = calculateCustomPlan({
      investmentInputType: 'total',
      totalInvestment: 500000,
      investmentDurationYears: 5,
      payoutType: 'lumpsum_only',
      payoutStartYear: 10,
      maturityLumpSum: 1000000,
    })

    expect(res.totalInvested).toBe(500000)
    expect(res.schedule[0].invested).toBe(100000)
    expect(res.schedule[4].invested).toBe(100000)
    expect(res.schedule[5].invested).toBe(0)
  })

  it('computes opportunity benchmark comparison against PPF and Equity', () => {
    const res = calculateCustomPlan({
      annualInvestment: 100000,
      investmentDurationYears: 10,
      payoutType: 'lumpsum_only',
      payoutStartYear: 20,
      maturityLumpSum: 2500000,
    })

    // PPF (7.1%) and Equity (12%) benchmarks
    expect(res.benchmarkPpfCorpus).toBeGreaterThan(0)
    expect(res.benchmarkEquityCorpus).toBeGreaterThan(res.benchmarkPpfCorpus)
  })
})
