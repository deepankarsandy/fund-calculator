import { describe, it, expect } from 'vitest'
import { calculateSip, calculateSwp, calculateSipToSwp } from '../sip'

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

describe('calculateSipToSwp (Accumulation to Decumulation Journey)', () => {
  it('simulates a complete SIP-to-SWP journey from age 30 to 60 then 60 to 90', () => {
    const res = calculateSipToSwp({
      currentAge: 30,
      retirementAge: 60,
      targetAge: 90,
      monthlySip: 15000,
      sipReturnRate: 12.0,
      monthlySwp: 60000,
      swpReturnRate: 8.0,
      enableSipStepUp: false,
      enableSwpStepUp: false,
    })

    expect(res.currentAge).toBe(30)
    expect(res.retirementAge).toBe(60)
    expect(res.targetAge).toBe(90)
    expect(res.sipYears).toBe(30)
    expect(res.swpYears).toBe(30)
    expect(res.totalYears).toBe(60)

    // 15k/mo over 30 yrs = ₹54 Lakhs invested
    expect(res.totalSipInvested).toBe(5400000)
    // 15k/mo @ 12% over 30 yrs yields > ₹5 Crore
    expect(res.sipAccumulatedCorpus).toBeGreaterThan(50000000)
    expect(res.sipWealthGain).toBe(res.sipAccumulatedCorpus - res.totalSipInvested)

    // With ~5.3 Cr starting corpus at 60 and 8% return, withdrawing 60k/mo (7.2L/yr) is easily sustainable
    expect(res.isDepleted).toBe(false)
    expect(res.isEnough).toBe(true)
    expect(res.finalRemainingBalance).toBeGreaterThan(0)
    expect(res.totalSwpWithdrawn).toBe(60000 * 360) // 2.16 Cr
    expect(res.yearlySchedule).toHaveLength(60)

    // Verify phase transition in schedule
    expect(res.yearlySchedule[0].phase).toBe('sip')
    expect(res.yearlySchedule[0].age).toBe(30)
    expect(res.yearlySchedule[29].phase).toBe('sip')
    expect(res.yearlySchedule[29].age).toBe(59)
    expect(res.yearlySchedule[30].phase).toBe('swp')
    expect(res.yearlySchedule[30].age).toBe(60)
    expect(res.yearlySchedule[59].phase).toBe('swp')
    expect(res.yearlySchedule[59].age).toBe(89)
  })

  it('accurately detects depletion when monthly withdrawal is unsustainably high', () => {
    const res = calculateSipToSwp({
      currentAge: 30,
      retirementAge: 60,
      targetAge: 90,
      monthlySip: 5000, // Only 5k/mo (yields ~1.76 Cr)
      sipReturnRate: 12.0,
      monthlySwp: 250000, // Very high withdrawal 2.5L/mo (30L/yr)
      swpReturnRate: 8.0,
    })

    expect(res.isDepleted).toBe(true)
    expect(res.isEnough).toBe(false)
    expect(res.finalRemainingBalance).toBe(0)
    expect(res.depletionAge).toBeGreaterThanOrEqual(60)
    expect(res.depletionAge).toBeLessThan(90)
    expect(res.unfundedYears).toBeGreaterThan(0)

    // Recommendations should be populated
    expect(res.requiredMonthlySip).toBeGreaterThan(5000)
    expect(res.sustainableMonthlySwp).toBeLessThan(250000)
  })

  it('provides actionable requiredMonthlySip and sustainableMonthlySwp', () => {
    const res = calculateSipToSwp({
      currentAge: 30,
      retirementAge: 60,
      targetAge: 90,
      monthlySip: 10000,
      sipReturnRate: 12.0,
      monthlySwp: 100000,
      swpReturnRate: 8.0,
    })

    // Required SIP should be a valid realistic number
    expect(res.requiredMonthlySip).toBeGreaterThan(0)
    expect(res.sustainableMonthlySwp).toBeGreaterThan(0)
  })

  it('supports annual step-up during SIP and SWP phases', () => {
    const res = calculateSipToSwp({
      currentAge: 30,
      retirementAge: 40,
      targetAge: 50,
      monthlySip: 10000,
      enableSipStepUp: true,
      sipStepUpPercent: 10,
      monthlySwp: 20000,
      enableSwpStepUp: true,
      swpStepUpPercent: 5,
    })

    expect(res.yearlySchedule[1].monthlyAmount).toBe(11000) // Year 2 of SIP
    expect(res.yearlySchedule[11].monthlyAmount).toBe(21000) // Year 2 of SWP (20k * 1.05)
  })

  it('handles edge cases gracefully (zero SIP, zero SWP, invalid age ordering)', () => {
    const res = calculateSipToSwp({
      currentAge: 55,
      retirementAge: 40, // invalid: less than currentAge
      targetAge: 30, // invalid: less than retirementAge
      monthlySip: 0,
      monthlySwp: 0,
    })

    expect(res.currentAge).toBe(55)
    expect(res.retirementAge).toBeGreaterThan(55)
    expect(res.targetAge).toBeGreaterThan(res.retirementAge)
    expect(res.sipAccumulatedCorpus).toBe(0)
    expect(res.finalRemainingBalance).toBe(0)
    expect(res.isDepleted).toBe(false)
  })
})
