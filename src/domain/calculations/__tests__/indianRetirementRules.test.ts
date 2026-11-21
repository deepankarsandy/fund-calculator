import { describe, it, expect } from 'vitest'
import {
  calculateNpsRetirementProjection,
  calculatePfMaturityProjection,
  buildDefaultAssetsFromProfile,
  NPS_MANDATORY_ANNUITY_RATIO,
  NPS_DEFAULT_ANNUITY_RATE,
  EPF_DEFAULT_INTEREST_RATE,
} from '../indianRetirementRules'
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/domain/models/userProfile'
import type { Assets } from '@/domain/models/assets'

describe('Indian Retirement Rules - NPS & EPF Calculations', () => {
  describe('calculateNpsRetirementProjection', () => {
    it('accurately calculates NPS accumulation, 40% annuity, and pension for standard 30-year horizon', () => {
      // Monthly 5,000, age 30 to 60 (30 years) at 10% CAGR
      const result = calculateNpsRetirementProjection({
        monthlyNpsInvestment: 5000,
        currentAge: 30,
        retirementAge: 60,
      })

      expect(result.workingYears).toBe(30)
      // FV for 5000/mo over 360 months at 10% should be ~1.14 Cr
      expect(result.totalAccumulatedCorpus).toBeGreaterThan(11000000)
      expect(result.totalAccumulatedCorpus).toBeLessThan(12000000)

      // Annuity is 40% of total corpus
      expect(result.annuityCorpus).toBe(
        Math.round(result.totalAccumulatedCorpus * NPS_MANDATORY_ANNUITY_RATIO)
      )
      // Lump sum is 60% of total corpus
      expect(result.lumpSumCorpus).toBe(result.totalAccumulatedCorpus - result.annuityCorpus)

      // Annual pension is 6% of annuity corpus
      expect(result.annualPension).toBe(Math.round(result.annuityCorpus * NPS_DEFAULT_ANNUITY_RATE))
      expect(result.annualPension).toBeGreaterThan(250000)
      expect(result.monthlyPension).toBe(Math.round(result.annualPension / 12))

      // NPS Pension starts at retirement (Year workingYears + 1 = 31)
      expect(result.startYear).toBe(31)
    })

    it('returns zero for 0 monthly investment or when already retired', () => {
      const zeroInv = calculateNpsRetirementProjection({
        monthlyNpsInvestment: 0,
        currentAge: 30,
        retirementAge: 60,
      })
      expect(zeroInv.totalAccumulatedCorpus).toBe(0)
      expect(zeroInv.annualPension).toBe(0)

      const alreadyRetired = calculateNpsRetirementProjection({
        monthlyNpsInvestment: 5000,
        currentAge: 60,
        retirementAge: 60,
      })
      expect(alreadyRetired.workingYears).toBe(0)
      expect(alreadyRetired.totalAccumulatedCorpus).toBe(0)
      expect(alreadyRetired.startYear).toBe(1)
    })
  })

  describe('calculatePfMaturityProjection', () => {
    it('accurately calculates EPF maturity at official 8.25% EPFO rate', () => {
      // Monthly 10,000, age 30 to 60 (30 years) at 8.25% EPFO interest
      const result = calculatePfMaturityProjection({
        monthlyPfInvestment: 10000,
        currentAge: 30,
        retirementAge: 60,
      })

      expect(result.workingYears).toBe(30)
      expect(result.annualInterestRate).toBe(EPF_DEFAULT_INTEREST_RATE)
      // FV for 10,000/mo over 360 months at 8.25% should be ~1.57 Cr
      expect(result.maturityLumpSum).toBeGreaterThan(15000000)
      expect(result.maturityLumpSum).toBeLessThan(16500000)
      // Matures at retirement year
      expect(result.maturityYear).toBe(30)
    })

    it('returns 0 maturity for zero contribution', () => {
      const result = calculatePfMaturityProjection({
        monthlyPfInvestment: 0,
        currentAge: 30,
        retirementAge: 60,
      })
      expect(result.maturityLumpSum).toBe(0)
    })
  })

  describe('buildDefaultAssetsFromProfile', () => {
    it('synchronizes NPS pension and EPF maturity while preserving existing custom income streams and insurance plans', () => {
      const existingAssets: Assets = {
        monthlyIncome: 80000,
        incomeEndAge: 55,
        incomeGrowthRate: 0.05,
        existingInvestableCorpus: 300000,
        otherIncome: [
          {
            id: 'custom-insurance-plan',
            incomeType: 'insurance_plan',
            label: 'Guaranteed Income Life Plan',
            annualAmount: 120000,
            startYear: 1, // Starts from CURRENT YEAR!
            endYear: 20,
            inflationLinked: false,
          },
          {
            id: 'commercial-rent',
            incomeType: 'rental',
            label: 'Commercial Property Rent',
            annualAmount: 240000,
            startYear: 1,
            inflationLinked: true,
          },
        ],
        futureContributions: [
          {
            id: 'ancestral-property',
            label: 'Ancestral Land Sale',
            amount: 4000000,
            year: 10,
          },
        ],
      }

      const profile: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        currentAge: 30,
        retirementAge: 60,
        monthlyIncome: 120000,
        annualIncomeGrowthRate: 8.0,
        existingInvestableCorpus: 600000,
        monthlyPfInvestment: 10000,
        monthlyNpsInvestment: 5000,
      }

      const synced = buildDefaultAssetsFromProfile(profile, existingAssets)

      expect(synced.monthlyIncome).toBe(120000)
      expect(synced.incomeEndAge).toBe(60)
      expect(synced.incomeGrowthRate).toBe(0.08)
      expect(synced.existingInvestableCorpus).toBe(600000)

      // Verified: Custom insurance plan starting in current year is preserved!
      const insurancePlan = synced.otherIncome.find((i) => i.id === 'custom-insurance-plan')
      expect(insurancePlan).toBeDefined()
      expect(insurancePlan?.startYear).toBe(1)
      expect(insurancePlan?.annualAmount).toBe(120000)

      // Verified: Commercial rent is preserved!
      const rental = synced.otherIncome.find((i) => i.id === 'commercial-rent')
      expect(rental).toBeDefined()
      expect(rental?.annualAmount).toBe(240000)

      // Verified: NPS Pension is auto-filled and starts after set retirement age!
      const npsPension = synced.otherIncome.find(
        (i) => i.id === 'nps_pension' || i.incomeType === 'nps_annuity'
      )
      expect(npsPension).toBeDefined()
      expect(npsPension?.startYear).toBe(31) // Year workingYears + 1
      expect(npsPension?.annualAmount).toBeGreaterThan(250000)

      // Verified: Ancestral land sale is preserved!
      const landSale = synced.futureContributions.find((l) => l.id === 'ancestral-property')
      expect(landSale).toBeDefined()
      expect(landSale?.amount).toBe(4000000)

      // Verified: EPF Maturity is auto-filled with 8.25% compound value!
      const epfMaturity = synced.futureContributions.find((l) => l.id === 'pf_maturity')
      expect(epfMaturity).toBeDefined()
      expect(epfMaturity?.amount).toBeGreaterThan(15000000)
      expect(epfMaturity?.year).toBe(30)
    })
  })
})
