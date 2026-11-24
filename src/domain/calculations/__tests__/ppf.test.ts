import { describe, it, expect } from 'vitest'
import {
  calculatePpf,
  calculateEstimatedPpfBalance,
  MAX_PPF_ANNUAL_DEPOSIT,
} from '@/domain/calculations/ppf'

describe('calculatePpf', () => {
  it('calculates standard 15-year PPF with maximum annual contribution (₹1.5 Lakh)', () => {
    const res = calculatePpf({
      annualDeposit: 150000,
      annualInterestRate: 7.1,
      tenureYears: 15,
      contributionYears: 15,
      depositFrequency: 'yearly',
      startMode: 'new',
    })

    expect(res.totalPrincipalDeposited).toBe(2250000)
    // 15 years of 1.5L at 7.1% produces ~ ₹40.68 Lakhs
    expect(res.maturityAmount).toBeGreaterThan(4000000)
    expect(res.maturityAmount).toBeLessThan(4200000)
    expect(res.totalInterestEarned).toBe(res.maturityAmount - res.totalPrincipalDeposited)
    // 100% Tax-Free under EEE Section 10(11)
    expect(res.netPostTaxMaturity).toBe(res.maturityAmount)
    expect(res.yearlySchedule.length).toBe(15)
    expect(res.yearlySchedule[0].deposit).toBe(150000)
    expect(res.yearlySchedule[14].isExtended).toBe(false)
  })

  it('caps annual deposit at statutory maximum limit of ₹1,50,000 per financial year', () => {
    const res = calculatePpf({
      annualDeposit: 250000, // exceeds statutory limit
      tenureYears: 15,
      depositFrequency: 'yearly',
    })

    expect(res.yearlySchedule[0].deposit).toBe(MAX_PPF_ANNUAL_DEPOSIT)
    expect(res.totalPrincipalDeposited).toBe(15 * MAX_PPF_ANNUAL_DEPOSIT)
  })

  it('calculates 20-year PPF with 5-year extension with fresh contributions', () => {
    const res = calculatePpf({
      annualDeposit: 150000,
      tenureYears: 20,
      contributionYears: 20,
      extensionMode: 'with_contributions',
    })

    expect(res.totalPrincipalDeposited).toBe(3000000)
    // 20 years with continuous contributions reaches ~ ₹66.5 Lakhs
    expect(res.maturityAmount).toBeGreaterThan(6500000)
    expect(res.extensionYears).toBe(5)
    expect(res.yearlySchedule.length).toBe(20)
    expect(res.yearlySchedule[15].isExtended).toBe(true)
    expect(res.yearlySchedule[15].deposit).toBe(150000)
  })

  it('calculates 20-year PPF with 5-year extension WITHOUT fresh contributions (re-investment only)', () => {
    const res = calculatePpf({
      annualDeposit: 150000,
      tenureYears: 20,
      contributionYears: 15,
      extensionMode: 'without_contributions',
    })

    // Deposits only for initial 15 years
    expect(res.totalPrincipalDeposited).toBe(2250000)
    expect(res.yearlySchedule.length).toBe(20)
    // Years 16-20 have 0 fresh deposit but balance compounds
    expect(res.yearlySchedule[14].deposit).toBe(150000)
    expect(res.yearlySchedule[15].deposit).toBe(0)
    expect(res.yearlySchedule[15].interestEarned).toBeGreaterThan(0)
    expect(res.yearlySchedule[19].deposit).toBe(0)
    expect(res.yearlySchedule[19].closingBalance).toBeGreaterThan(
      res.yearlySchedule[14].closingBalance
    )
  })

  it('supports monthly deposit mode following Indian PPF 5th of month rule', () => {
    const res = calculatePpf({
      depositFrequency: 'monthly',
      monthlyDeposit: 12500, // 12,500 * 12 = 1,50,000 / yr
      tenureYears: 15,
      annualInterestRate: 7.1,
    })

    expect(res.totalPrincipalDeposited).toBe(2250000)
    expect(res.maturityAmount).toBeGreaterThan(3900000)
    expect(res.yearlySchedule.length).toBe(15)
  })

  it('handles existing PPF account with prior years already completed', () => {
    const res = calculatePpf({
      startMode: 'existing',
      yearsAlreadyInvested: 5,
      existingCorpus: 1000000,
      annualDeposit: 150000,
      tenureYears: 15,
      contributionYears: 15,
    })

    // Remaining projection years: 15 - 5 = 10
    expect(res.tenureYears).toBe(10)
    expect(res.yearlySchedule.length).toBe(10)
    expect(res.yearlySchedule[0].openingBalance).toBe(1000000)
  })

  it('computes Section 80C annual tax savings correctly based on slab rate', () => {
    const res = calculatePpf({
      annualDeposit: 150000,
      tenureYears: 15,
      taxSlabRatePercent: 30, // 30% tax bracket
    })

    // ₹1,50,000 * 30% = ₹45,000/yr saved under Section 80C
    expect(res.yearlySchedule[0].taxSaved80C).toBe(45000)
    expect(res.totalTaxSaved80C).toBe(15 * 45000)
  })

  describe('calculateEstimatedPpfBalance', () => {
    it('accurately calculates accumulated balance for 5 years @ 7.1% with ₹1.5L annual deposit', () => {
      const balance = calculateEstimatedPpfBalance(5, 150000, 7.1, 'yearly')
      // Exactly matches 5-year closing balance
      expect(balance).toBe(925701)
    })

    it('returns 0 when years <= 0', () => {
      expect(calculateEstimatedPpfBalance(0, 150000, 7.1)).toBe(0)
      expect(calculateEstimatedPpfBalance(-3, 150000, 7.1)).toBe(0)
    })

    it('calculates monthly deposit balance using PPF monthly compounding formula', () => {
      const balance = calculateEstimatedPpfBalance(5, 150000, 7.1, 'monthly', 12500)
      expect(balance).toBeGreaterThan(850000)
      expect(balance).toBeLessThan(950000)
    })
  })
})
