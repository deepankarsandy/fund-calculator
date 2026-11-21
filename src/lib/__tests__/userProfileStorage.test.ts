import { describe, it, expect, beforeEach } from 'vitest'
import {
  getUserProfile,
  saveUserProfile,
  updateUserProfile,
  resetUserProfile,
  deriveSipInputsFromProfile,
  deriveInvestmentInputsFromProfile,
  deriveFdInputsFromProfile,
  deriveLoanEmiInputsFromProfile,
  syncProfileToCalculators,
} from '@/lib/userProfileStorage'
import {
  DEFAULT_USER_PROFILE,
  calculateAgeFromDob,
  calculateDobFromAge,
  normalizeDobToDdMmYyyy,
  isValidDob,
  parseDobToIso,
  formatDobToMmDdYyyy,
  UserProfile,
} from '@/domain/models/userProfile'
import { getStoredSipInputs } from '@/lib/sipStorage'
import { getStoredFdInputs } from '@/lib/fdStorage'
import { getStoredLoanEmiInputs } from '@/lib/loanEmiStorage'
import { getStoredInvestmentInputs } from '@/lib/investmentStorage'

const memoryStore = new Map<string, string>()

const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => memoryStore.set(key, value),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('UserProfile Domain & Storage', () => {
  beforeEach(() => {
    memoryStore.clear()
  })

  describe('calculateAgeFromDob', () => {
    it('calculates exact age from date of birth in both DD/MM/YYYY and legacy YYYY-MM-DD formats', () => {
      const refDate = new Date(2026, 4, 15) // May 15, 2026

      // Legacy YYYY-MM-DD format
      expect(calculateAgeFromDob('1994-01-10', refDate)).toBe(32)
      expect(calculateAgeFromDob('1994-11-20', refDate)).toBe(31)
      expect(calculateAgeFromDob('1994-05-15', refDate)).toBe(32)

      // New DD/MM/YYYY format
      expect(calculateAgeFromDob('10/01/1994', refDate)).toBe(32)
      expect(calculateAgeFromDob('20/11/1994', refDate)).toBe(31)
      expect(calculateAgeFromDob('15/05/1994', refDate)).toBe(32)

      // DD-MM-YYYY format
      expect(calculateAgeFromDob('15-05-1994', refDate)).toBe(32)
    })

    it('falls back safely for invalid or empty dob', () => {
      expect(calculateAgeFromDob('')).toBe(30)
      expect(calculateAgeFromDob('invalid-date')).toBe(30)
      expect(calculateAgeFromDob('15/05')).toBe(30)
    })

    it('derives approximate DOB from age in DD/MM/YYYY format', () => {
      const refDate = new Date(2026, 4, 15)
      const dob = calculateDobFromAge(30, refDate)
      expect(dob).toBe('15/05/1996')
    })

    it('normalizes legacy YYYY-MM-DD or variant DOB strings to DD/MM/YYYY without crashing', () => {
      expect(normalizeDobToDdMmYyyy('1994-05-15')).toBe('15/05/1994')
      expect(normalizeDobToDdMmYyyy('15/05/1994')).toBe('15/05/1994')
      expect(normalizeDobToDdMmYyyy('15-05-1994')).toBe('15/05/1994')
      expect(normalizeDobToDdMmYyyy('15051994')).toBe('15/05/1994')
      expect(normalizeDobToDdMmYyyy('')).toBe('')
      expect(normalizeDobToDdMmYyyy('invalid')).toBe('invalid')
    })

    it('validates DD/MM/YYYY and YYYY-MM-DD dates accurately', () => {
      expect(isValidDob('15/05/1994')).toBe(true)
      expect(isValidDob('1994-05-15')).toBe(true)
      expect(isValidDob('05-15-1994')).toBe(true) // MM-DD-YYYY
      expect(isValidDob('31/02/1994')).toBe(false) // Invalid date
      expect(isValidDob('15/05')).toBe(false)
      expect(isValidDob('')).toBe(false)
      expect(isValidDob('hello')).toBe(false)
    })

    it('converts DOB to ISO format for native date pickers and formats to MM-DD-YYYY', () => {
      expect(parseDobToIso('15/05/1994')).toBe('1994-05-15')
      expect(parseDobToIso('1994-05-15')).toBe('1994-05-15')
      expect(parseDobToIso('05-15-1994')).toBe('1994-05-15')
      expect(parseDobToIso('')).toBe('')

      expect(formatDobToMmDdYyyy('1994-05-15')).toBe('05-15-1994')
      expect(formatDobToMmDdYyyy('15/05/1994')).toBe('05-15-1994')
      expect(formatDobToMmDdYyyy('05-15-1994')).toBe('05-15-1994')
      expect(formatDobToMmDdYyyy('')).toBe('')
    })
  })

  describe('Storage CRUD', () => {
    it('returns DEFAULT_USER_PROFILE when storage is empty', () => {
      const profile = getUserProfile()
      expect(profile.country).toBe('India')
      expect(profile.currency).toBe('INR')
      expect(profile.currentAge).toBe(30)
      expect(profile.retirementAge).toBe(60)
      expect(profile.targetAge).toBe(85)
      expect(profile.overallInflationRate).toBe(6.0)
      expect(profile.ltcgTaxRate).toBe(12.5)
      expect(profile.isConfigured).toBe(false)
    })

    it('saves and loads profile changes', () => {
      const custom: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        name: 'Deepankar',
        dob: '1992-06-15',
        retirementAge: 55,
        targetAge: 90,
        monthlyIncome: 150000,
        overallInflationRate: 7.0,
        incomeTaxBracket: 30,
        isConfigured: true,
      }

      saveUserProfile(custom)
      const loaded = getUserProfile()

      expect(loaded.name).toBe('Deepankar')
      expect(loaded.retirementAge).toBe(55)
      expect(loaded.targetAge).toBe(90)
      expect(loaded.monthlyIncome).toBe(150000)
      expect(loaded.overallInflationRate).toBe(7.0)
      expect(loaded.incomeTaxBracket).toBe(30)
      expect(loaded.isConfigured).toBe(true)
    })

    it('saves and loads default dependents in profile', () => {
      const custom: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        dependents: [
          {
            id: 'dep-1',
            label: 'Spouse',
            relationship: 'spouse',
            age: 28,
            financiallyDependent: true,
            hasHealthInsurance: true,
          },
          {
            id: 'dep-2',
            label: 'Child 1',
            relationship: 'child',
            age: 3,
            financiallyDependent: true,
            supportUntilAge: 25,
            hasHealthInsurance: false,
          },
        ],
        isConfigured: true,
      }

      saveUserProfile(custom)
      const loaded = getUserProfile()

      expect(loaded.dependents).toHaveLength(2)
      expect(loaded.dependents[0].label).toBe('Spouse')
      expect(loaded.dependents[1].supportUntilAge).toBe(25)
    })

    it('updates partial fields smoothly', () => {
      updateUserProfile({ name: 'Aarav', monthlySipInvestment: 25000 })
      const loaded = getUserProfile()
      expect(loaded.name).toBe('Aarav')
      expect(loaded.monthlySipInvestment).toBe(25000)
      expect(loaded.currency).toBe('INR')
    })

    it('resets profile to defaults', () => {
      updateUserProfile({ name: 'To be wiped', retirementAge: 50 })
      resetUserProfile()
      const loaded = getUserProfile()
      expect(loaded.name).toBe('')
      expect(loaded.retirementAge).toBe(60)
    })
  })

  describe('Calculator Defaults Derivation', () => {
    const sampleProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      name: 'Aditi',
      dob: '1990-01-01', // Age ~36
      currentAge: 36,
      retirementAge: 58,
      targetAge: 88,
      monthlyIncome: 120000,
      monthlySipInvestment: 30000,
      existingInvestableCorpus: 1000000,
      incomeTaxBracket: 30,
      taxRegime: 'old',
      ltcgTaxRate: 12.5,
      overallInflationRate: 6.5,
      expectedEquityReturn: 13.0,
      expectedDebtReturn: 7.5,
      fdInterestRate: 7.25,
      loanInterestRate: 8.75,
      isConfigured: true,
    }

    it('derives SIP inputs correctly', () => {
      const derived = deriveSipInputsFromProfile(sampleProfile)

      // SIP mode
      expect(derived.sip.monthlyInvestment).toBe(30000)
      expect(derived.sip.annualReturnRate).toBe(13.0)
      expect(derived.sip.timeHorizonYears).toBe(22) // 58 - 36
      expect(derived.sip.inflationRatePercent).toBe(6.5)
      expect(derived.sip.taxRatePercent).toBe(12.5)

      // SWP mode
      expect(derived.swp.initialInvestment).toBe(1000000)
      expect(derived.swp.annualReturnRate).toBe(7.5)
      expect(derived.swp.timeHorizonYears).toBe(30) // 88 - 58
      expect(derived.swp.inflationRatePercent).toBe(6.5)

      // Combo mode
      expect(derived.combo.currentAge).toBe(36)
      expect(derived.combo.retirementAge).toBe(58)
      expect(derived.combo.targetAge).toBe(88)
      expect(derived.combo.monthlySip).toBe(30000)
      expect(derived.combo.sipReturnRate).toBe(13.0)
      expect(derived.combo.swpReturnRate).toBe(7.5)
      expect(derived.combo.inflationRatePercent).toBe(6.5)
      expect(derived.combo.taxRatePercent).toBe(12.5)
    })

    it('derives Investment inputs correctly', () => {
      const derived = deriveInvestmentInputsFromProfile(sampleProfile)

      expect(derived.initialInvestment).toBe(1000000)
      expect(derived.timeHorizonYears).toBe(22)
      expect(derived.simpleReturnRate).toBe(13.0)
      expect(derived.simpleTaxRate).toBe(12.5)
      expect(derived.inflationRatePercent).toBe(6.5)

      const equityAsset = derived.allocations.find((a) => a.id === 'equity')
      expect(equityAsset?.expectedReturnRate).toBe(13.0)
      expect(equityAsset?.taxRatePercent).toBe(12.5)

      const debtAsset = derived.allocations.find((a) => a.id === 'debt')
      expect(debtAsset?.expectedReturnRate).toBe(7.5)
    })

    it('derives FD inputs correctly with senior citizen flag', () => {
      // Non-senior (36 years)
      const derivedYoung = deriveFdInputsFromProfile(sampleProfile)
      expect(derivedYoung.annualInterestRate).toBe(7.25)
      expect(derivedYoung.isSeniorCitizen).toBe(false)
      expect(derivedYoung.taxSlabRatePercent).toBe(30)
      expect(derivedYoung.inflationRatePercent).toBe(6.5)

      // Senior citizen (65 years)
      const seniorProfile: UserProfile = {
        ...sampleProfile,
        currentAge: 65,
      }
      const derivedSenior = deriveFdInputsFromProfile(seniorProfile)
      expect(derivedSenior.isSeniorCitizen).toBe(true)
    })

    it('derives Loan EMI inputs correctly', () => {
      const derived = deriveLoanEmiInputsFromProfile(sampleProfile)

      expect(derived.annualInterestRate).toBe(8.75)
      expect(derived.taxRegime).toBe('old')
      expect(derived.taxSlabPercent).toBe(30)
      expect(derived.inflationRatePercent).toBe(6.5)
    })

    it('syncProfileToCalculators synchronizes all 4 calculators into localStorage', () => {
      syncProfileToCalculators(sampleProfile)

      const sip = getStoredSipInputs()
      expect(sip.sip.monthlyInvestment).toBe(30000)
      expect(sip.sip.annualReturnRate).toBe(13.0)

      const investment = getStoredInvestmentInputs()
      expect(investment.initialInvestment).toBe(1000000)
      expect(investment.simpleReturnRate).toBe(13.0)

      const fd = getStoredFdInputs()
      expect(fd.annualInterestRate).toBe(7.25)
      expect(fd.taxSlabRatePercent).toBe(30)

      const loan = getStoredLoanEmiInputs()
      expect(loan.annualInterestRate).toBe(8.75)
      expect(loan.taxSlabPercent).toBe(30)
    })
  })
})
