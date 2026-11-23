import { getStoredSipInputs, StoredSipData } from '@/lib/sipStorage'
import { getStoredFdInputs } from '@/lib/fdStorage'
import { getStoredLoanEmiInputs } from '@/lib/loanEmiStorage'
import { getStoredPpfInputs } from '@/lib/ppfStorage'
import {
  calculateSip,
  calculateSwp,
  calculateSipToSwp,
  DEFAULT_SIP_INPUTS,
  DEFAULT_SWP_INPUTS,
  DEFAULT_SIP_TO_SWP_INPUTS,
} from '@/domain/calculations/sip'
import { calculateFd, FdCalculationInputs } from '@/domain/calculations/fd'
import { calculateLoanEmi, LoanEmiCalculationInputs } from '@/domain/calculations/loanEmi'
import { calculatePpf, PpfCalculationInputs } from '@/domain/calculations/ppf'
import type { OtherIncome, FutureLumpSum } from '@/domain/models/assets'
import type { ExpenseCategory, ExpenseItem } from '@/domain/models/expense'

export const LINKED_CALCULATORS_STORAGE_KEY = 'fundcalc_linked_calculators_config_v1'

export type SipLinkedType = 'sip' | 'swp' | 'combo'
export type FdLinkedType = 'cumulative' | 'monthly' | 'quarterly'
export type LoanLinkedType = 'home' | 'car' | 'personal' | 'custom'

export interface LinkedSipConfig {
  enabled: boolean
  selectedType: SipLinkedType
  enabledTypes: {
    sip: boolean
    swp: boolean
    combo: boolean
  }
}

export interface LinkedFdConfig {
  enabled: boolean
  selectedType: FdLinkedType
  enabledTypes: {
    cumulative: boolean
    monthly: boolean
    quarterly: boolean
  }
}

export interface LinkedLoanConfig {
  enabled: boolean
  selectedType: LoanLinkedType
  enabledTypes: {
    home: boolean
    car: boolean
    personal: boolean
    custom: boolean
  }
}

export interface LinkedPpfConfig {
  enabled: boolean
}

export interface LinkedCalculatorsConfig {
  sip: LinkedSipConfig
  fd: LinkedFdConfig
  loan: LinkedLoanConfig
  ppf: LinkedPpfConfig
}

export const DEFAULT_LINKED_CALCULATORS_CONFIG: LinkedCalculatorsConfig = {
  sip: {
    enabled: true,
    selectedType: 'sip',
    enabledTypes: {
      sip: true,
      swp: false,
      combo: false,
    },
  },
  fd: {
    enabled: true,
    selectedType: 'cumulative',
    enabledTypes: {
      cumulative: true,
      monthly: false,
      quarterly: false,
    },
  },
  loan: {
    enabled: true,
    selectedType: 'home',
    enabledTypes: {
      home: true,
      car: false,
      personal: false,
      custom: false,
    },
  },
  ppf: {
    enabled: false,
  },
}

export function getLinkedCalculatorsConfig(): LinkedCalculatorsConfig {
  if (typeof window === 'undefined') return DEFAULT_LINKED_CALCULATORS_CONFIG
  try {
    const raw = localStorage.getItem(LINKED_CALCULATORS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        sip: {
          ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip,
          ...(parsed.sip || {}),
          enabledTypes: {
            ...DEFAULT_LINKED_CALCULATORS_CONFIG.sip.enabledTypes,
            ...(parsed.sip?.enabledTypes || {}),
          },
        },
        fd: {
          ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd,
          ...(parsed.fd || {}),
          enabledTypes: {
            ...DEFAULT_LINKED_CALCULATORS_CONFIG.fd.enabledTypes,
            ...(parsed.fd?.enabledTypes || {}),
          },
        },
        loan: {
          ...DEFAULT_LINKED_CALCULATORS_CONFIG.loan,
          ...(parsed.loan || {}),
          enabledTypes: {
            ...DEFAULT_LINKED_CALCULATORS_CONFIG.loan.enabledTypes,
            ...(parsed.loan?.enabledTypes || {}),
          },
        },
        ppf: {
          ...DEFAULT_LINKED_CALCULATORS_CONFIG.ppf,
          ...(parsed.ppf || {}),
        },
      }
    }
  } catch {
    // Ignore parse error
  }
  return DEFAULT_LINKED_CALCULATORS_CONFIG
}

export function saveLinkedCalculatorsConfig(config: LinkedCalculatorsConfig): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LINKED_CALCULATORS_STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore storage errors
  }
}

// ─── Computed Projection Summaries ──────────────────────────────────────────

export interface SipTypeSummary {
  type: SipLinkedType
  label: string
  shortDescription: string
  monthlyAmount: number
  annualAmount: number
  maturityAmount?: number
  tenureYears: number
  startYear: number
  endYear?: number
  annualReturnRate: number
  ratePercent: number
  isConfigured: boolean
}

export interface FdTypeSummary {
  type: FdLinkedType
  label: string
  shortDescription: string
  principalAmount: number
  interestRate: number
  tenureYears: number
  tenureMonths: number
  periodicPayoutAmount: number
  annualInterestAmount: number
  maturityAmount: number
  payoutFrequency: string
  isConfigured: boolean
}

export interface LoanTypeSummary {
  type: LoanLinkedType
  label: string
  shortDescription: string
  loanAmount: number
  annualInterestRate: number
  tenureYears: number
  monthlyEmi: number
  annualPayment: number
  actualPayoffYears: number
  actualTotalInterest: number
  isConfigured: boolean
}

export function getSipSummaries(stored?: StoredSipData): Record<SipLinkedType, SipTypeSummary> {
  const data = stored || getStoredSipInputs()

  // 1. Regular SIP
  const sipInputs = data.sip || DEFAULT_SIP_INPUTS
  const sipRes = calculateSip(sipInputs)
  const sipSummary: SipTypeSummary = {
    type: 'sip',
    label: 'Regular SIP (Maturity Lump Sum)',
    shortDescription: 'Monthly wealth compounding yielding lump sum maturity corpus',
    monthlyAmount: sipInputs.monthlyInvestment,
    annualAmount: sipInputs.monthlyInvestment * 12,
    maturityAmount: sipRes.netCorpus,
    tenureYears: sipInputs.timeHorizonYears,
    startYear: 1,
    endYear: sipInputs.timeHorizonYears,
    annualReturnRate: sipInputs.annualReturnRate,
    ratePercent: sipInputs.annualReturnRate,
    isConfigured: sipInputs.monthlyInvestment > 0,
  }

  // 2. SWP
  const swpInputs = data.swp || DEFAULT_SWP_INPUTS
  const swpRes = calculateSwp(swpInputs)
  const swpMonthly = swpInputs.monthlyWithdrawal
  const swpSummary: SipTypeSummary = {
    type: 'swp',
    label: 'SWP (Systematic Withdrawal Income)',
    shortDescription: 'Regular monthly cashflow payout drawn from accumulated capital',
    monthlyAmount: swpMonthly,
    annualAmount: swpMonthly * 12,
    maturityAmount: swpRes.finalBalance,
    tenureYears: swpInputs.timeHorizonYears,
    startYear: 1,
    endYear: swpInputs.timeHorizonYears,
    annualReturnRate: swpInputs.annualReturnRate,
    ratePercent: swpInputs.annualReturnRate,
    isConfigured: swpMonthly > 0,
  }

  // 3. SIP to SWP Combo
  const comboInputs = data.combo || DEFAULT_SIP_TO_SWP_INPUTS
  const comboRes = calculateSipToSwp(comboInputs)
  const comboMonthly = comboInputs.monthlySwp
  const comboSummary: SipTypeSummary = {
    type: 'combo',
    label: 'SIP-to-SWP Combo Plan',
    shortDescription: 'Phase 1 accumulation followed by Phase 2 lifetime monthly pension',
    monthlyAmount: comboMonthly,
    annualAmount: comboMonthly * 12,
    maturityAmount: comboRes.finalRemainingBalance,
    tenureYears: comboRes.swpYears,
    startYear: comboRes.sipYears + 1,
    endYear: comboRes.sipYears + comboRes.swpYears,
    annualReturnRate: comboInputs.swpReturnRate,
    ratePercent: comboInputs.swpReturnRate,
    isConfigured: comboMonthly > 0,
  }

  return {
    sip: sipSummary,
    swp: swpSummary,
    combo: comboSummary,
  }
}

export function getFdSummaries(stored?: FdCalculationInputs): Record<FdLinkedType, FdTypeSummary> {
  const inputs = stored || getStoredFdInputs()
  const tenureYears = Math.max(
    1,
    Math.round((inputs.tenureYears || 0) + (inputs.tenureMonths || 0) / 12)
  )

  // Cumulative
  const cumRes = calculateFd({ ...inputs, payoutType: 'cumulative' })
  const cumSummary: FdTypeSummary = {
    type: 'cumulative',
    label: 'Cumulative FD (Compounded Maturity)',
    shortDescription: 'Full interest reinvested; lump sum maturity received at tenure end',
    principalAmount: inputs.principalAmount,
    interestRate: inputs.annualInterestRate + (inputs.isSeniorCitizen ? 0.5 : 0),
    tenureYears,
    tenureMonths: inputs.tenureMonths || 0,
    periodicPayoutAmount: 0,
    annualInterestAmount: 0,
    maturityAmount: cumRes.netPostTaxMaturity || cumRes.maturityAmount,
    payoutFrequency: 'At Maturity',
    isConfigured: inputs.principalAmount > 0,
  }

  // Monthly
  const monRes = calculateFd({ ...inputs, payoutType: 'monthly' })
  const monSummary: FdTypeSummary = {
    type: 'monthly',
    label: 'Monthly Payout FD (Regular Income)',
    shortDescription:
      'Monthly interest credited directly as cashflow; principal returned at maturity',
    principalAmount: inputs.principalAmount,
    interestRate: inputs.annualInterestRate + (inputs.isSeniorCitizen ? 0.5 : 0),
    tenureYears,
    tenureMonths: inputs.tenureMonths || 0,
    periodicPayoutAmount: monRes.periodicPayoutAmount,
    annualInterestAmount: monRes.periodicPayoutAmount * 12,
    maturityAmount: inputs.principalAmount,
    payoutFrequency: 'Monthly',
    isConfigured: inputs.principalAmount > 0,
  }

  // Quarterly
  const qtrRes = calculateFd({ ...inputs, payoutType: 'quarterly' })
  const qtrSummary: FdTypeSummary = {
    type: 'quarterly',
    label: 'Quarterly Payout FD (Quarterly Income)',
    shortDescription: 'Quarterly interest credited to account; principal returned at tenure end',
    principalAmount: inputs.principalAmount,
    interestRate: inputs.annualInterestRate + (inputs.isSeniorCitizen ? 0.5 : 0),
    tenureYears,
    tenureMonths: inputs.tenureMonths || 0,
    periodicPayoutAmount: qtrRes.periodicPayoutAmount,
    annualInterestAmount: qtrRes.periodicPayoutAmount * 4,
    maturityAmount: inputs.principalAmount,
    payoutFrequency: 'Quarterly',
    isConfigured: inputs.principalAmount > 0,
  }

  return {
    cumulative: cumSummary,
    monthly: monSummary,
    quarterly: qtrSummary,
  }
}

export interface PpfSummary {
  label: string
  shortDescription: string
  annualDeposit: number
  monthlyDeposit: number
  depositFrequency: 'yearly' | 'monthly'
  annualInterestRate: number
  tenureYears: number
  contributionYears: number
  maturityAmount: number
  totalPrincipal: number
  totalInterest: number
  totalTaxSaved80C: number
  isExtended: boolean
  isConfigured: boolean
}

export function getPpfSummary(stored?: PpfCalculationInputs): PpfSummary {
  const inputs = stored || getStoredPpfInputs()
  const res = calculatePpf(inputs)

  const isConfigured =
    (inputs.annualDeposit > 0 || (inputs.startMode === 'existing' && inputs.existingCorpus > 0)) &&
    res.maturityAmount > 0

  return {
    label: `PPF Account (${res.tenureYears} Years · 100% Tax-Free)`,
    shortDescription:
      res.extensionYears > 0
        ? `Govt sovereign scheme extended by ${res.extensionYears} yrs with EEE tax exemption`
        : 'Govt sovereign scheme with 15-yr statutory lock-in & EEE tax exemption',
    annualDeposit:
      inputs.depositFrequency === 'yearly' ? inputs.annualDeposit : inputs.monthlyDeposit * 12,
    monthlyDeposit:
      inputs.depositFrequency === 'monthly'
        ? inputs.monthlyDeposit
        : Math.round(inputs.annualDeposit / 12),
    depositFrequency: inputs.depositFrequency,
    annualInterestRate: inputs.annualInterestRate,
    tenureYears: res.tenureYears,
    contributionYears: res.contributionYears,
    maturityAmount: res.maturityAmount,
    totalPrincipal: res.totalPrincipalDeposited,
    totalInterest: res.totalInterestEarned,
    totalTaxSaved80C: res.totalTaxSaved80C,
    isExtended: res.extensionYears > 0,
    isConfigured,
  }
}

export function getLoanInputsForType(
  type: LoanLinkedType,
  stored?: LoanEmiCalculationInputs
): LoanEmiCalculationInputs {
  const active = stored || getStoredLoanEmiInputs()
  if (type === 'custom') {
    return active
  }
  if (type === 'home') {
    return {
      ...active,
      loanType: 'home',
      loanAmount: active.loanType === 'home' ? active.loanAmount : 4000000,
      annualInterestRate: active.loanType === 'home' ? active.annualInterestRate : 8.5,
      tenureYears: active.loanType === 'home' ? active.tenureYears : 20,
      tenureMonths: active.loanType === 'home' ? active.tenureMonths : 0,
    }
  }
  if (type === 'car') {
    return {
      ...active,
      loanType: 'car',
      loanAmount: active.loanType === 'car' ? active.loanAmount : 800000,
      annualInterestRate: active.loanType === 'car' ? active.annualInterestRate : 9.0,
      tenureYears: active.loanType === 'car' ? active.tenureYears : 5,
      tenureMonths: active.loanType === 'car' ? active.tenureMonths : 0,
    }
  }
  // Personal
  return {
    ...active,
    loanType: 'personal',
    loanAmount: active.loanType === 'personal' ? active.loanAmount : 300000,
    annualInterestRate: active.loanType === 'personal' ? active.annualInterestRate : 13.0,
    tenureYears: active.loanType === 'personal' ? active.tenureYears : 3,
    tenureMonths: active.loanType === 'personal' ? active.tenureMonths : 0,
  }
}

export function getLoanSummaries(
  stored?: LoanEmiCalculationInputs
): Record<LoanLinkedType, LoanTypeSummary> {
  const active = stored || getStoredLoanEmiInputs()

  const types: LoanLinkedType[] = ['home', 'car', 'personal', 'custom']
  const summaries: Partial<Record<LoanLinkedType, LoanTypeSummary>> = {}

  for (const t of types) {
    const inputs = getLoanInputsForType(t, active)
    const res = calculateLoanEmi(inputs)
    const payoffYears = Math.max(1, Math.ceil(res.actualPayoffMonths / 12))

    let label = 'Custom Loan'
    let desc = 'Configured in Loan EMI calculator'
    if (t === 'home') {
      label = 'Home Loan'
      desc = 'Housing loan with fixed contractual monthly EMI'
    } else if (t === 'car') {
      label = 'Car Loan'
      desc = 'Automobile loan EMI over medium-term tenure'
    } else if (t === 'personal') {
      label = 'Personal Loan'
      desc = 'Short-term personal loan obligation'
    }

    summaries[t] = {
      type: t,
      label,
      shortDescription: desc,
      loanAmount: inputs.loanAmount,
      annualInterestRate: inputs.annualInterestRate,
      tenureYears: inputs.tenureYears,
      monthlyEmi: res.monthlyEmi,
      annualPayment: res.monthlyEmi * 12,
      actualPayoffYears: payoffYears,
      actualTotalInterest: res.actualTotalInterest,
      isConfigured: inputs.loanAmount > 0 && res.monthlyEmi > 0,
    }
  }

  return summaries as Record<LoanLinkedType, LoanTypeSummary>
}

// ─── Synchronization Engine ──────────────────────────────────────────────────

export interface SyncResult {
  addedLumpSums: FutureLumpSum[]
  addedOtherIncome: OtherIncome[]
  addedExpenseItems: ExpenseItem[]
}

/**
 * Builds the array of linked FutureLumpSum and OtherIncome items according to current config.
 */
export function buildLinkedIncomeItems(config?: LinkedCalculatorsConfig): {
  futureContributions: FutureLumpSum[]
  otherIncome: OtherIncome[]
} {
  const cfg = config || getLinkedCalculatorsConfig()
  const futureContributions: FutureLumpSum[] = []
  const otherIncome: OtherIncome[] = []

  // 1. SIP Calculator
  if (cfg.sip.enabled) {
    const sipSummaries = getSipSummaries()

    const enabledTypes = cfg.sip.enabledTypes || {
      [cfg.sip.selectedType || 'sip']: true,
    }
    const activeSipTypes: SipLinkedType[] = (['sip', 'swp', 'combo'] as SipLinkedType[]).filter(
      (t) => enabledTypes[t]
    )

    activeSipTypes.forEach((type) => {
      const summary = sipSummaries[type]
      if (!summary || !summary.isConfigured) return

      if (type === 'sip' && summary.maturityAmount && summary.maturityAmount > 0) {
        futureContributions.push({
          id: 'linked-sip-maturity',
          label: `SIP Maturity (SIP Calculator - ${summary.tenureYears} yrs)`,
          amount: summary.maturityAmount,
          year: summary.tenureYears,
        })
      } else if (type === 'swp' && summary.annualAmount > 0) {
        otherIncome.push({
          id: 'linked-sip-swp',
          label: `SWP Monthly Payout (SIP Calculator - ₹${summary.monthlyAmount.toLocaleString('en-IN')}/mo)`,
          annualAmount: summary.annualAmount,
          startYear: 1,
          endYear: summary.tenureYears,
          inflationLinked: false,
          incomeType: 'other',
        })
      } else if (type === 'combo' && summary.annualAmount > 0) {
        otherIncome.push({
          id: 'linked-sip-combo',
          label: `SIP-to-SWP Monthly Payout (SIP Calculator - ₹${summary.monthlyAmount.toLocaleString('en-IN')}/mo)`,
          annualAmount: summary.annualAmount,
          startYear: summary.startYear,
          endYear: summary.endYear,
          inflationLinked: false,
          incomeType: 'other',
        })
      }
    })
  }

  // 2. FD Calculator
  if (cfg.fd.enabled) {
    const fdSummaries = getFdSummaries()

    const enabledTypes = cfg.fd.enabledTypes || {
      [cfg.fd.selectedType || 'cumulative']: true,
    }
    const activeFdTypes: FdLinkedType[] = (
      ['cumulative', 'monthly', 'quarterly'] as FdLinkedType[]
    ).filter((t) => enabledTypes[t])

    activeFdTypes.forEach((type) => {
      const summary = fdSummaries[type]
      if (!summary || !summary.isConfigured) return

      if (type === 'cumulative' && summary.maturityAmount > 0) {
        futureContributions.push({
          id: 'linked-fd-cumulative',
          label: `FD Maturity (FD Calculator - ${summary.tenureYears} yrs)`,
          amount: summary.maturityAmount,
          year: summary.tenureYears,
        })
      } else if (type === 'monthly' && summary.annualInterestAmount > 0) {
        otherIncome.push({
          id: 'linked-fd-monthly',
          label: `FD Monthly Interest (FD Calculator - ₹${summary.periodicPayoutAmount.toLocaleString('en-IN')}/mo)`,
          annualAmount: summary.annualInterestAmount,
          startYear: 1,
          endYear: summary.tenureYears,
          inflationLinked: false,
          incomeType: 'other',
        })
        futureContributions.push({
          id: 'linked-fd-principal-monthly',
          label: `FD Principal Returned (FD Calculator)`,
          amount: summary.principalAmount,
          year: summary.tenureYears,
        })
      } else if (type === 'quarterly' && summary.annualInterestAmount > 0) {
        otherIncome.push({
          id: 'linked-fd-quarterly',
          label: `FD Quarterly Interest (FD Calculator - ₹${summary.periodicPayoutAmount.toLocaleString('en-IN')}/qtr)`,
          annualAmount: summary.annualInterestAmount,
          startYear: 1,
          endYear: summary.tenureYears,
          inflationLinked: false,
          incomeType: 'other',
        })
        futureContributions.push({
          id: 'linked-fd-principal-quarterly',
          label: `FD Principal Returned (FD Calculator)`,
          amount: summary.principalAmount,
          year: summary.tenureYears,
        })
      }
    })
  }

  // 3. PPF Calculator
  if (cfg.ppf?.enabled) {
    const ppfSummary = getPpfSummary()
    if (ppfSummary && ppfSummary.isConfigured && ppfSummary.maturityAmount > 0) {
      futureContributions.push({
        id: 'linked-ppf-maturity',
        label: `PPF Maturity (PPF Calculator - ${ppfSummary.tenureYears} yrs, Tax-Free)`,
        amount: ppfSummary.maturityAmount,
        year: ppfSummary.tenureYears,
      })
    }
  }

  return { futureContributions, otherIncome }
}

/**
 * Builds the array of linked ExpenseItems according to current config.
 */
export function buildLinkedLoanExpenseItems(config?: LinkedCalculatorsConfig): ExpenseItem[] {
  const cfg = config || getLinkedCalculatorsConfig()
  const items: ExpenseItem[] = []

  if (!cfg.loan.enabled) return items

  const loanSummaries = getLoanSummaries()

  const enabledTypes = cfg.loan.enabledTypes || {
    [cfg.loan.selectedType || 'home']: true,
  }
  const activeLoanTypes: LoanLinkedType[] = (
    ['home', 'car', 'personal', 'custom'] as LoanLinkedType[]
  ).filter((t) => enabledTypes[t])

  activeLoanTypes.forEach((type) => {
    const summary = loanSummaries[type]
    if (!summary || !summary.isConfigured || summary.monthlyEmi <= 0) return

    items.push({
      id: `linked-loan-emi-${type}`,
      categoryId: 'financial',
      name: `Loan EMI (${summary.label} - Loan Calc)`,
      amount: summary.monthlyEmi,
      frequency: 'monthly',
      startYear: 1,
      endYear: summary.actualPayoffYears,
      inflationRate: 0, // Contractual fixed EMI does not inflate
      essential: true,
      appliesTo: 'household',
      type: 'recurring',
      notes: `Synced from Loan EMI Calculator (${summary.annualInterestRate}% p.a. for ${summary.actualPayoffYears} yrs)`,
      skipped: false,
    })
  })

  return items
}

/**
 * Synchronizes linked calculator data into scenario store slices.
 * Non-destructive: preserves all user-entered custom income items, lump sums, and expense categories.
 */
export function applyLinkedDataToStore(
  assets: { otherIncome: OtherIncome[]; futureContributions: FutureLumpSum[] },
  categories: ExpenseCategory[],
  config?: LinkedCalculatorsConfig
): {
  updatedAssets: { otherIncome: OtherIncome[]; futureContributions: FutureLumpSum[] }
  updatedCategories: ExpenseCategory[]
} {
  const cfg = config || getLinkedCalculatorsConfig()

  // 1. Separate manual items from system-linked items
  const cleanOtherIncome = (assets.otherIncome || []).filter(
    (item) => !String(item.id || '').startsWith('linked-')
  )
  const cleanFutureContributions = (assets.futureContributions || []).filter(
    (item) => !String(item.id || '').startsWith('linked-')
  )

  // 2. Generate updated linked items
  const { futureContributions: newLinkedLs, otherIncome: newLinkedOi } = buildLinkedIncomeItems(cfg)

  const updatedAssets = {
    ...assets,
    otherIncome: [...cleanOtherIncome, ...newLinkedOi],
    futureContributions: [...cleanFutureContributions, ...newLinkedLs],
  }

  // 3. Update categories with linked loan EMI
  const newLoanItems = buildLinkedLoanExpenseItems(cfg)

  const updatedCategories = categories.map((cat) => {
    // Remove any existing linked loan items
    const cleanItems = cat.items.filter((item) => !String(item.id || '').startsWith('linked-'))

    if (cat.id === 'financial') {
      return {
        ...cat,
        items: [...cleanItems, ...newLoanItems],
      }
    }
    return {
      ...cat,
      items: cleanItems,
    }
  })

  return { updatedAssets, updatedCategories }
}
