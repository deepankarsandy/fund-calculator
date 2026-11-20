import { describe, it, expect } from 'vitest'
import {
  calculateInvestment,
  DEFAULT_INVESTMENT_INPUTS,
  DEFAULT_ASSET_ALLOCATIONS,
} from '../investment'

describe('calculateInvestment', () => {
  it('calculates simple lump sum compound growth', () => {
    const res = calculateInvestment({
      initialInvestment: 100000,
      timeHorizonYears: 5,
      mode: 'simple',
      simpleReturnRate: 10,
      enableTax: false,
    })

    expect(res.totalInvested).toBe(100000)
    // 100,000 * (1.10)^5 = 161,051
    expect(res.grossCorpus).toBe(161051)
    expect(res.estimatedReturns).toBe(61051)
    expect(res.yearlySchedule).toHaveLength(5)
    expect(res.yearlySchedule[4].grossBalance).toBe(161051)
  })

  it('calculates multi-asset portfolio compounding across asset classes', () => {
    const res = calculateInvestment({
      ...DEFAULT_INVESTMENT_INPUTS,
      initialInvestment: 500000,
      timeHorizonYears: 10,
      mode: 'multi_asset',
      enableTax: true,
    })

    expect(res.totalInvested).toBe(500000)
    expect(res.grossCorpus).toBeGreaterThan(500000)
    expect(res.assetResults).toHaveLength(DEFAULT_ASSET_ALLOCATIONS.length)
    expect(res.blendedReturnRate).toBeGreaterThan(8)
    expect(res.blendedReturnRate).toBeLessThan(12)
    expect(res.netCorpus).toBe(res.grossCorpus - res.estimatedTax)
    expect(res.yearlySchedule).toHaveLength(10)
  })

  it('computes Indian LTCG and slab tax deductions on multi-asset gains', () => {
    const res = calculateInvestment({
      initialInvestment: 1000000,
      timeHorizonYears: 10,
      mode: 'multi_asset',
      enableTax: true,
      allocations: [
        {
          id: 'equity',
          name: 'Equity',
          allocationPercent: 100,
          expectedReturnRate: 12,
          taxRatePercent: 12.5,
          taxExemptionAmount: 125000,
        },
      ],
    })

    // Equity only: 1,000,000 * (1.12)^10 = 3105848 approx
    expect(res.grossCorpus).toBeGreaterThan(3100000)
    const gains = res.grossCorpus - 1000000
    const expectedTaxable = Math.max(0, gains - 125000)
    const expectedTax = Math.round(expectedTaxable * 0.125)
    expect(res.estimatedTax).toBe(expectedTax)
    expect(res.netCorpus).toBe(res.grossCorpus - expectedTax)
  })

  it('handles zero or negative investment gracefully', () => {
    const res = calculateInvestment({
      initialInvestment: 0,
      timeHorizonYears: 10,
    })

    expect(res.grossCorpus).toBe(0)
    expect(res.totalInvested).toBe(0)
    expect(res.estimatedReturns).toBe(0)
    expect(res.netCorpus).toBe(0)
  })

  it('calculates inflation discounted real value', () => {
    const res = calculateInvestment({
      initialInvestment: 500000,
      timeHorizonYears: 10,
      mode: 'simple',
      simpleReturnRate: 10,
      inflationRatePercent: 6,
    })

    expect(res.realPurchasingPower).toBeLessThan(res.grossCorpus)
    const expectedReal = Math.round(res.grossCorpus / Math.pow(1.06, 10))
    expect(res.realPurchasingPower).toBe(expectedReal)
  })
})
