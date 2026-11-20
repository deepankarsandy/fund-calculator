import { describe, it, expect } from 'vitest'
import { calculateSip, calculateSwp } from '../sip'

describe('calculateSip', () => {
  it('calculates standard 10-year monthly SIP with 12% returns', () => {
    const res = calculateSip({
      monthlyInvestment: 10000,
      annualReturnRate: 12,
      timeHorizonYears: 10,
      enableStepUp: false,
      enableTax: false,
    })

    // Total invested for 10k/mo over 10 years = 12,00,000
    expect(res.totalInvested).toBe(1200000)
    // Standard SIP future value for 10k/mo at 12% is approx ₹23.23 Lakhs
    expect(res.grossCorpus).toBeGreaterThan(2300000)
    expect(res.grossCorpus).toBeLessThan(2350000)
    expect(res.estimatedReturns).toBe(res.grossCorpus - res.totalInvested)
    expect(res.yearlySchedule).toHaveLength(10)
    expect(res.yearlySchedule[9].endBalance).toBe(res.grossCorpus)
  })

  it('applies Indian Budget 2024 LTCG tax (12.5% with ₹1.25L exemption)', () => {
    const res = calculateSip({
      monthlyInvestment: 10000,
      annualReturnRate: 12,
      timeHorizonYears: 10,
      enableTax: true,
      taxRatePercent: 12.5,
      taxExemptionAmount: 125000,
    })

    const expectedTaxable = Math.max(0, res.estimatedReturns - 125000)
    const expectedTax = Math.round(expectedTaxable * 0.125)
    expect(res.taxableGains).toBe(expectedTaxable)
    expect(res.estimatedTax).toBe(expectedTax)
    expect(res.netCorpus).toBe(res.grossCorpus - expectedTax)
  })

  it('supports annual step-up SIP compounding', () => {
    const regularRes = calculateSip({
      monthlyInvestment: 10000,
      annualReturnRate: 12,
      timeHorizonYears: 5,
      enableStepUp: false,
    })

    const stepUpRes = calculateSip({
      monthlyInvestment: 10000,
      annualReturnRate: 12,
      timeHorizonYears: 5,
      enableStepUp: true,
      stepUpPercentage: 10,
    })

    // Step-up invested amount should be strictly greater than regular
    expect(stepUpRes.totalInvested).toBeGreaterThan(regularRes.totalInvested)
    expect(stepUpRes.grossCorpus).toBeGreaterThan(regularRes.grossCorpus)
    expect(stepUpRes.yearlySchedule[1].monthlyContribution).toBe(11000)
  })

  it('calculates real purchasing power discount with inflation', () => {
    const res = calculateSip({
      monthlyInvestment: 10000,
      annualReturnRate: 12,
      timeHorizonYears: 10,
      inflationRatePercent: 6,
    })

    // Real purchasing power should be less than gross corpus
    expect(res.realPurchasingPower).toBeLessThan(res.grossCorpus)
    const expectedPurchasingPower = Math.round(res.grossCorpus / Math.pow(1.06, 10))
    expect(res.realPurchasingPower).toBe(expectedPurchasingPower)
  })

  it('handles edge cases gracefully (0% return, zero monthly investment)', () => {
    const zeroRes = calculateSip({
      monthlyInvestment: 0,
      annualReturnRate: 12,
      timeHorizonYears: 5,
    })
    expect(zeroRes.grossCorpus).toBe(0)
    expect(zeroRes.totalInvested).toBe(0)

    const noReturnRes = calculateSip({
      monthlyInvestment: 5000,
      annualReturnRate: 0,
      timeHorizonYears: 2,
    })
    expect(noReturnRes.totalInvested).toBe(120000)
    expect(noReturnRes.grossCorpus).toBe(120000)
    expect(noReturnRes.estimatedReturns).toBe(0)
  })
})

describe('calculateSwp', () => {
  it('calculates regular monthly SWP withdrawals and remaining balance', () => {
    const res = calculateSwp({
      initialInvestment: 5000000, // 50 Lakhs
      monthlyWithdrawal: 30000, // 30k / mo = 3.6L / yr
      annualReturnRate: 8.0, // 8% returns
      timeHorizonYears: 10,
      enableStepUpWithdrawal: false,
    })

    expect(res.initialInvestment).toBe(5000000)
    expect(res.totalWithdrawn).toBe(3600000) // 30k * 120
    expect(res.finalBalance).toBeGreaterThan(4500000)
    expect(res.isDepleted).toBe(false)
    expect(res.depletionYear).toBeNull()
    expect(res.yearlySchedule).toHaveLength(10)
  })

  it('detects when corpus depletes under high withdrawals', () => {
    const res = calculateSwp({
      initialInvestment: 1000000, // 10 Lakhs
      monthlyWithdrawal: 50000, // 50k / mo = 6L / yr
      annualReturnRate: 5.0,
      timeHorizonYears: 10,
    })

    expect(res.isDepleted).toBe(true)
    expect(res.depletionYear).toBeLessThanOrEqual(3)
    expect(res.finalBalance).toBe(0)
  })

  it('supports annual step-up withdrawal increases', () => {
    const res = calculateSwp({
      initialInvestment: 5000000,
      monthlyWithdrawal: 25000,
      annualReturnRate: 8.0,
      timeHorizonYears: 5,
      enableStepUpWithdrawal: true,
      stepUpWithdrawalPercent: 10,
    })

    expect(res.yearlySchedule[1].monthlyWithdrawal).toBe(27500)
    expect(res.yearlySchedule[2].monthlyWithdrawal).toBe(30250)
  })
})
