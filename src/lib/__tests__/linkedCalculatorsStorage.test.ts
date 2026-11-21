import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLinkedCalculatorsConfig,
  saveLinkedCalculatorsConfig,
  getSipSummaries,
  getFdSummaries,
  getLoanSummaries,
  buildLinkedIncomeItems,
  buildLinkedLoanExpenseItems,
  applyLinkedDataToStore,
  DEFAULT_LINKED_CALCULATORS_CONFIG,
} from '../linkedCalculatorsStorage'
import { saveStoredSipInputs, StoredSipData } from '../sipStorage'
import { saveStoredFdInputs } from '../fdStorage'
import {
  DEFAULT_SIP_INPUTS,
  DEFAULT_SWP_INPUTS,
  DEFAULT_SIP_TO_SWP_INPUTS,
} from '@/domain/calculations/sip'
import { DEFAULT_FD_INPUTS } from '@/domain/calculations/fd'
import { DEFAULT_CATEGORIES } from '@/domain/data/defaultCategories'

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

describe('Linked Calculators Storage & Synchronization Logic', () => {
  beforeEach(() => {
    memoryStore.clear()
  })

  it('provides default config when storage is empty', () => {
    const config = getLinkedCalculatorsConfig()
    expect(config.sip.enabled).toBe(true)
    expect(config.fd.enabled).toBe(true)
    expect(config.loan.enabled).toBe(true)
    expect(config.sip.selectedType).toBe('sip')
    expect(config.fd.selectedType).toBe('cumulative')
    expect(config.loan.selectedType).toBe('home')
  })

  it('persists and retrieves updated configuration', () => {
    const customConfig = {
      ...DEFAULT_LINKED_CALCULATORS_CONFIG,
      sip: {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip,
        enabled: false,
        selectedType: 'swp' as const,
      },
    }
    saveLinkedCalculatorsConfig(customConfig)
    const retrieved = getLinkedCalculatorsConfig()
    expect(retrieved.sip.enabled).toBe(false)
    expect(retrieved.sip.selectedType).toBe('swp')
  })

  describe('SIP Summaries & Linking', () => {
    it('computes correct summaries for all 3 SIP types', () => {
      const storedData: StoredSipData = {
        mode: 'sip',
        sip: { ...DEFAULT_SIP_INPUTS, monthlyInvestment: 20000, timeHorizonYears: 15 },
        swp: { ...DEFAULT_SWP_INPUTS, initialInvestment: 5000000, monthlyWithdrawal: 35000 },
        combo: {
          ...DEFAULT_SIP_TO_SWP_INPUTS,
          monthlySip: 15000,
          currentAge: 30,
          retirementAge: 40,
          targetAge: 60,
          monthlySwp: 40000,
        },
      }
      saveStoredSipInputs(storedData)

      const summaries = getSipSummaries(storedData)

      // Regular SIP
      expect(summaries.sip.monthlyAmount).toBe(20000)
      expect(summaries.sip.tenureYears).toBe(15)
      expect(summaries.sip.maturityAmount).toBeGreaterThan(20000 * 12 * 15)

      // SWP
      expect(summaries.swp.monthlyAmount).toBe(35000)
      expect(summaries.swp.annualAmount).toBe(35000 * 12)

      // Combo
      expect(summaries.combo.startYear).toBe(11)
      expect(summaries.combo.endYear).toBe(30)
      expect(summaries.combo.monthlyAmount).toBeGreaterThan(0)
    })

    it('injects Regular SIP maturity lump sum into futureContributions when enabled', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: {
          enabled: true,
          selectedType: 'sip' as const,
          enabledTypes: { sip: true, swp: false, combo: false },
        },
        fd: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd, enabled: false },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)

      expect(futureContributions.length).toBe(1)
      expect(futureContributions[0].id).toBe('linked-sip-maturity')
      expect(futureContributions[0].year).toBe(10)
      expect(futureContributions[0].amount).toBeGreaterThan(1000000)
      expect(otherIncome.length).toBe(0)
    })

    it('injects SWP monthly payout into otherIncome when enabled', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: {
          enabled: true,
          selectedType: 'swp' as const,
          enabledTypes: { sip: false, swp: true, combo: false },
        },
        fd: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd, enabled: false },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)

      expect(otherIncome.length).toBe(1)
      expect(otherIncome[0].id).toBe('linked-sip-swp')
      expect(otherIncome[0].startYear).toBe(1)
      expect(otherIncome[0].annualAmount).toBeGreaterThan(0)
      expect(otherIncome[0].inflationLinked).toBe(false)
      expect(futureContributions.length).toBe(0)
    })

    it('injects SIP-to-SWP combo payout with delayed startYear into otherIncome', () => {
      saveStoredSipInputs({
        mode: 'combo',
        sip: DEFAULT_SIP_INPUTS,
        swp: DEFAULT_SWP_INPUTS,
        combo: {
          ...DEFAULT_SIP_TO_SWP_INPUTS,
          currentAge: 30,
          retirementAge: 40, // 10 years SIP
          targetAge: 60,
          monthlySwp: 50000,
        },
      })

      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: {
          enabled: true,
          selectedType: 'combo' as const,
          enabledTypes: { sip: false, swp: false, combo: true },
        },
        fd: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd, enabled: false },
      }
      const { otherIncome } = buildLinkedIncomeItems(cfg)

      expect(otherIncome.length).toBe(1)
      expect(otherIncome[0].id).toBe('linked-sip-combo')
      expect(otherIncome[0].startYear).toBe(11) // starts after 10 years of SIP accumulation
      expect(otherIncome[0].annualAmount).toBeGreaterThan(0)
    })

    it('excludes SIP items when sip.enabled is false', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip, enabled: false },
        fd: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd, enabled: false },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)
      expect(futureContributions.length).toBe(0)
      expect(otherIncome.length).toBe(0)
    })

    it('supports linking multiple SIP sub-types simultaneously (e.g. Regular SIP + SWP)', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: {
          enabled: true,
          selectedType: 'sip' as const,
          enabledTypes: { sip: true, swp: true, combo: false },
        },
        fd: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd, enabled: false },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)

      // Both Regular SIP maturity and SWP payout are added
      expect(futureContributions.some((l) => l.id === 'linked-sip-maturity')).toBe(true)
      expect(otherIncome.some((i) => i.id === 'linked-sip-swp')).toBe(true)
      expect(otherIncome.some((i) => i.id === 'linked-sip-combo')).toBe(false)
    })

    it('supports individual SIP sub-type exclusion', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: {
          enabled: true,
          selectedType: 'sip' as const,
          enabledTypes: { sip: false, swp: true, combo: false },
        },
        fd: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd, enabled: false },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)

      // SIP is excluded, only SWP is included
      expect(futureContributions.some((l) => l.id === 'linked-sip-maturity')).toBe(false)
      expect(otherIncome.some((i) => i.id === 'linked-sip-swp')).toBe(true)
    })
  })

  describe('FD Summaries & Linking', () => {
    it('computes correct summaries for cumulative, monthly, and quarterly FD', () => {
      const fdInputs = {
        ...DEFAULT_FD_INPUTS,
        principalAmount: 500000,
        annualInterestRate: 7.5,
        tenureYears: 3,
        tenureMonths: 0,
      }
      saveStoredFdInputs(fdInputs)

      const summaries = getFdSummaries(fdInputs)

      // Cumulative
      expect(summaries.cumulative.principalAmount).toBe(500000)
      expect(summaries.cumulative.maturityAmount).toBeGreaterThan(500000)
      expect(summaries.cumulative.tenureYears).toBe(3)

      // Monthly
      expect(summaries.monthly.periodicPayoutAmount).toBeGreaterThan(0)
      expect(summaries.monthly.annualInterestAmount).toBeCloseTo(
        summaries.monthly.periodicPayoutAmount * 12,
        -1
      )

      // Quarterly
      expect(summaries.quarterly.periodicPayoutAmount).toBeGreaterThan(0)
      expect(summaries.quarterly.annualInterestAmount).toBeCloseTo(
        summaries.quarterly.periodicPayoutAmount * 4,
        -1
      )
    })

    it('injects Cumulative FD maturity into futureContributions', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip, enabled: false },
        fd: {
          enabled: true,
          selectedType: 'cumulative' as const,
          enabledTypes: { cumulative: true, monthly: false, quarterly: false },
        },
      }
      const { futureContributions } = buildLinkedIncomeItems(cfg)

      expect(futureContributions.length).toBe(1)
      expect(futureContributions[0].id).toBe('linked-fd-cumulative')
      expect(futureContributions[0].amount).toBeGreaterThan(200000)
      expect(futureContributions[0].year).toBe(5)
    })

    it('injects Monthly Payout FD with interest income and principal repayment', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip, enabled: false },
        fd: {
          enabled: true,
          selectedType: 'monthly' as const,
          enabledTypes: { cumulative: false, monthly: true, quarterly: false },
        },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)

      expect(otherIncome.length).toBe(1)
      expect(otherIncome[0].id).toBe('linked-fd-monthly')
      expect(otherIncome[0].annualAmount).toBeGreaterThan(0)

      expect(futureContributions.length).toBe(1)
      expect(futureContributions[0].id).toBe('linked-fd-principal-monthly')
      expect(futureContributions[0].amount).toBe(200000) // principal returned at end of tenure
    })

    it('supports linking multiple FD sub-types simultaneously (e.g. Cumulative + Monthly)', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip, enabled: false },
        fd: {
          enabled: true,
          selectedType: 'cumulative' as const,
          enabledTypes: { cumulative: true, monthly: true, quarterly: false },
        },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)

      // Both Cumulative maturity and Monthly payout interest/principal are added
      expect(futureContributions.some((l) => l.id === 'linked-fd-cumulative')).toBe(true)
      expect(otherIncome.some((i) => i.id === 'linked-fd-monthly')).toBe(true)
      expect(futureContributions.some((l) => l.id === 'linked-fd-principal-monthly')).toBe(true)
      expect(otherIncome.some((i) => i.id === 'linked-fd-quarterly')).toBe(false)
    })

    it('supports individual FD sub-type exclusion', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        sip: { ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip, enabled: false },
        fd: {
          enabled: true,
          selectedType: 'cumulative' as const,
          enabledTypes: { cumulative: false, monthly: true, quarterly: false },
        },
      }
      const { futureContributions, otherIncome } = buildLinkedIncomeItems(cfg)

      expect(futureContributions.some((l) => l.id === 'linked-fd-cumulative')).toBe(false)
      expect(otherIncome.some((i) => i.id === 'linked-fd-monthly')).toBe(true)
    })
  })

  describe('Loan EMI Summaries & Linking', () => {
    it('computes correct summaries for Home, Car, and Personal loans', () => {
      const summaries = getLoanSummaries()

      expect(summaries.home.monthlyEmi).toBeGreaterThan(30000)
      expect(summaries.home.actualPayoffYears).toBe(20)

      expect(summaries.car.monthlyEmi).toBeGreaterThan(15000)
      expect(summaries.car.actualPayoffYears).toBe(5)

      expect(summaries.personal.monthlyEmi).toBeGreaterThan(9000)
      expect(summaries.personal.actualPayoffYears).toBe(3)
    })

    it('builds loan expense item with 0% inflation rate and fixed tenure', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        loan: {
          enabled: true,
          selectedType: 'home' as const,
          enabledTypes: { home: true, car: false, personal: false, custom: false },
        },
      }
      const items = buildLinkedLoanExpenseItems(cfg)

      expect(items.length).toBe(1)
      expect(items[0].id).toBe('linked-loan-emi-home')
      expect(items[0].categoryId).toBe('financial')
      expect(items[0].amount).toBeGreaterThan(30000)
      expect(items[0].frequency).toBe('monthly')
      expect(items[0].inflationRate).toBe(0) // Fixed EMI exempt from inflation
      expect(items[0].startYear).toBe(1)
      expect(items[0].endYear).toBe(20)
    })

    it('excludes loan expense items when loan.enabled is false', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        loan: {
          ...DEFAULT_LINKED_CALCULATORS_CONFIG.loan,
          enabled: false,
        },
      }
      const items = buildLinkedLoanExpenseItems(cfg)
      expect(items.length).toBe(0)
    })

    it('supports linking multiple loan sub-types simultaneously (e.g. Home + Car)', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        loan: {
          enabled: true,
          selectedType: 'home' as const,
          enabledTypes: { home: true, car: true, personal: false, custom: false },
        },
      }
      const items = buildLinkedLoanExpenseItems(cfg)

      expect(items.length).toBe(2)
      expect(items.some((i) => i.id === 'linked-loan-emi-home')).toBe(true)
      expect(items.some((i) => i.id === 'linked-loan-emi-car')).toBe(true)
      expect(items.some((i) => i.id === 'linked-loan-emi-personal')).toBe(false)
    })

    it('supports individual loan sub-type exclusion', () => {
      const cfg = {
        ...DEFAULT_LINKED_CALCULATORS_CONFIG,
        loan: {
          enabled: true,
          selectedType: 'home' as const,
          enabledTypes: { home: false, car: true, personal: false, custom: false },
        },
      }
      const items = buildLinkedLoanExpenseItems(cfg)

      expect(items.length).toBe(1)
      expect(items[0].id).toBe('linked-loan-emi-car')
    })
  })

  describe('Non-Destructive State Merging (applyLinkedDataToStore)', () => {
    it('preserves user custom income sources and lump sums while updating linked items', () => {
      const customIncome = {
        id: 'custom-rent-1',
        label: 'Commercial Property Rent',
        annualAmount: 240000,
        startYear: 1,
        inflationLinked: true,
        incomeType: 'rental' as const,
      }
      const customLumpSum = {
        id: 'custom-land-sale',
        label: 'Ancestral Land Sale',
        amount: 5000000,
        year: 5,
      }

      const initialAssets = {
        otherIncome: [customIncome],
        futureContributions: [customLumpSum],
      }

      const { updatedAssets } = applyLinkedDataToStore(
        initialAssets,
        DEFAULT_CATEGORIES,
        DEFAULT_LINKED_CALCULATORS_CONFIG
      )

      // User items are preserved intact
      expect(updatedAssets.otherIncome.some((i) => i.id === 'custom-rent-1')).toBe(true)
      expect(updatedAssets.futureContributions.some((l) => l.id === 'custom-land-sale')).toBe(true)

      // Linked items are added
      expect(updatedAssets.futureContributions.some((l) => l.id.startsWith('linked-'))).toBe(true)
    })

    it('cleanly removes linked items when calculators are excluded without touching custom items', () => {
      const customIncome = {
        id: 'custom-rent-1',
        label: 'Commercial Property Rent',
        annualAmount: 240000,
        startYear: 1,
        inflationLinked: true,
        incomeType: 'rental' as const,
      }

      const initialAssets = {
        otherIncome: [customIncome],
        futureContributions: [],
      }

      // First apply with enabled
      const step1 = applyLinkedDataToStore(
        initialAssets,
        DEFAULT_CATEGORIES,
        DEFAULT_LINKED_CALCULATORS_CONFIG
      )

      // Now exclude all calculators
      const disabledCfg: any = {
        sip: { enabled: false, selectedType: 'sip', enabledTypes: {} },
        fd: { enabled: false, selectedType: 'cumulative', enabledTypes: {} },
        loan: { enabled: false, selectedType: 'home', enabledTypes: {} },
      }
      const step2 = applyLinkedDataToStore(
        step1.updatedAssets,
        step1.updatedCategories,
        disabledCfg
      )

      // User custom items remain
      expect(step2.updatedAssets.otherIncome.some((i) => i.id === 'custom-rent-1')).toBe(true)

      // All linked items are cleanly removed
      expect(step2.updatedAssets.otherIncome.some((i) => i.id.startsWith('linked-'))).toBe(false)
      expect(step2.updatedAssets.futureContributions.some((l) => l.id.startsWith('linked-'))).toBe(
        false
      )

      const finCat = step2.updatedCategories.find((c) => c.id === 'financial')
      expect(finCat?.items.some((i) => i.id.startsWith('linked-'))).toBe(false)
    })
  })
})
