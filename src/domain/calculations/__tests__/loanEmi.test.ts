import { describe, it, expect } from 'vitest'
import { calculateLoanEmi } from '../loanEmi'

describe('calculateLoanEmi', () => {
  it('calculates standard Indian 20-year home loan EMI at 8.5%', () => {
    const res = calculateLoanEmi({
      loanAmount: 4000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      tenureMonths: 0,
      monthlyExtraPrepayment: 0,
      annualLumpSumPrepayment: 0,
      enableTaxDeduction: false,
    })

    expect(res.totalTenureMonths).toBe(240)
    // Standard EMI on 40L at 8.5% for 20 years is approx ₹34,713/month
    expect(res.monthlyEmi).toBeGreaterThan(34500)
    expect(res.monthlyEmi).toBeLessThan(35000)
    expect(res.totalOriginalInterest).toBeGreaterThan(4300000)
    expect(res.actualPayoffMonths).toBe(240)
    expect(res.yearlyAmortization).toHaveLength(20)
    expect(res.yearlyAmortization[19].endingBalance).toBe(0)
  })

  it('calculates interest savings and tenure reduction with monthly prepayments', () => {
    const regular = calculateLoanEmi({
      loanAmount: 4000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      monthlyExtraPrepayment: 0,
    })

    const withPrepay = calculateLoanEmi({
      loanAmount: 4000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      monthlyExtraPrepayment: 5000, // Extra ₹5,000 every month
    })

    // Prepayment should reduce actual interest and tenure
    expect(withPrepay.actualTotalInterest).toBeLessThan(regular.actualTotalInterest)
    expect(withPrepay.actualPayoffMonths).toBeLessThan(regular.actualPayoffMonths)
    expect(withPrepay.interestSaved).toBeGreaterThan(800000) // saves 8+ Lakhs
    expect(withPrepay.tenureMonthsSaved).toBeGreaterThan(40) // saves 3+ years
  })

  it('calculates Section 24(b) and Section 80C tax deductions under Old Regime', () => {
    const res = calculateLoanEmi({
      loanAmount: 4000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      loanType: 'home',
      taxRegime: 'old',
      enableTaxDeduction: true,
      taxSlabPercent: 30,
    })

    expect(res.totalTaxSavings).toBeGreaterThan(0)
    expect(res.netEffectiveCost).toBe(res.actualTotalPayment - res.totalTaxSavings)
    // Check first year deductions
    const yr1 = res.yearlyAmortization[0]
    expect(yr1.taxSavingsSec24b).toBe(60000) // 200,000 * 30% = 60,000
    expect(yr1.taxSavingsSec80c).toBeGreaterThan(0)
  })

  it('disables tax deductions when New Tax Regime is chosen', () => {
    const res = calculateLoanEmi({
      loanAmount: 4000000,
      annualInterestRate: 8.5,
      tenureYears: 20,
      loanType: 'home',
      taxRegime: 'new', // under new regime, 24b/80c not allowed
      enableTaxDeduction: true,
    })

    expect(res.totalTaxSavings).toBe(0)
    expect(res.netEffectiveCost).toBe(res.actualTotalPayment)
  })

  it('handles zero loan amount gracefully', () => {
    const res = calculateLoanEmi({
      loanAmount: 0,
      annualInterestRate: 8.5,
      tenureYears: 10,
    })

    expect(res.monthlyEmi).toBe(0)
    expect(res.actualTotalPayment).toBe(0)
    expect(res.actualTotalInterest).toBe(0)
  })

  it('supports flat rate loan calculation with equivalent reducing APR', () => {
    // 5 Lakhs at 10% flat rate for 5 years
    const flatRes = calculateLoanEmi({
      loanAmount: 500000,
      annualInterestRate: 10.0,
      tenureYears: 5,
      interestMethod: 'flat',
    })

    // Total flat interest = 500,000 * 10% * 5 = 250,000
    expect(flatRes.totalOriginalInterest).toBe(250000)
    expect(flatRes.totalOriginalPayment).toBe(750000)
    // Monthly EMI = 750,000 / 60 = 12,500
    expect(flatRes.monthlyEmi).toBe(12500)
    // Equivalent reducing APR is nearly 18%+
    expect(flatRes.equivalentReducingApr).toBeGreaterThan(17)
    expect(flatRes.interestMethod).toBe('flat')
  })
})
