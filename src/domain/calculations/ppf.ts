export type PpfDepositFrequency = 'yearly' | 'monthly'
export type PpfExtensionMode = 'with_contributions' | 'without_contributions'
export type PpfStartMode = 'new' | 'existing'

export const MAX_PPF_ANNUAL_DEPOSIT = 150000
export const MIN_PPF_ANNUAL_DEPOSIT = 500
export const DEFAULT_PPF_INTEREST_RATE = 7.1

export interface PpfCalculationInputs {
  annualDeposit: number
  depositFrequency: PpfDepositFrequency
  monthlyDeposit: number
  annualInterestRate: number
  startMode: PpfStartMode
  investmentStartYear: number
  yearsAlreadyInvested: number
  existingCorpus: number
  tenureYears: number
  extensionMode: PpfExtensionMode
  contributionYears: number
  inflationRatePercent: number
  taxSlabRatePercent: number
}

export interface PpfYearlyBreakdown {
  year: number
  calendarYear?: number
  openingBalance: number
  deposit: number
  interestEarned: number
  closingBalance: number
  cumulativeDeposit: number
  cumulativeInterest: number
  isExtended: boolean
  isContributionActive: boolean
  taxSaved80C: number
}

export interface PpfCalculationResult {
  totalPrincipalDeposited: number
  totalInterestEarned: number
  maturityAmount: number
  netPostTaxMaturity: number
  totalTaxSaved80C: number
  realPurchasingPower: number
  effectiveAnnualRate: number
  tenureYears: number
  contributionYears: number
  extensionYears: number
  yearlySchedule: PpfYearlyBreakdown[]
}

export const DEFAULT_PPF_INPUTS: PpfCalculationInputs = {
  annualDeposit: 150000,
  depositFrequency: 'yearly',
  monthlyDeposit: 12500,
  annualInterestRate: 7.1,
  startMode: 'new',
  investmentStartYear: 1,
  yearsAlreadyInvested: 0,
  existingCorpus: 0,
  tenureYears: 15,
  extensionMode: 'with_contributions',
  contributionYears: 15,
  inflationRatePercent: 6.0,
  taxSlabRatePercent: 20.0,
}

/**
 * Calculates the accumulated PPF balance for an account held for a given number of past years,
 * based on the recurring deposit amount and interest rate.
 * Uses official Indian PPF annual compounding rules.
 */
export function calculateEstimatedPpfBalance(
  years: number,
  annualDeposit: number,
  annualInterestRate: number = DEFAULT_PPF_INTEREST_RATE,
  depositFrequency: PpfDepositFrequency = 'yearly',
  monthlyDeposit?: number
): number {
  if (years <= 0) return 0
  const rate = Math.max(0, annualInterestRate)
  const depositFreq = depositFrequency || 'yearly'
  const rawAnnual =
    depositFreq === 'yearly'
      ? Math.max(0, annualDeposit)
      : Math.max(0, (monthlyDeposit ?? Math.round(annualDeposit / 12)) * 12)
  const deposit = Math.min(MAX_PPF_ANNUAL_DEPOSIT, rawAnnual)
  const monthly = Math.min(12500, Math.round(deposit / 12))

  let balance = 0
  for (let y = 1; y <= years; y++) {
    let interest = 0
    if (rate > 0) {
      if (depositFreq === 'yearly') {
        interest = Math.round((balance + deposit) * (rate / 100))
      } else {
        interest = Math.round((balance + 6.5 * monthly) * (rate / 100))
      }
    }
    balance = balance + deposit + interest
  }
  return balance
}

/**
 * Calculates Public Provident Fund (PPF) growth, compounding, tax benefits, and yearly schedule.
 * Follows official Ministry of Finance / RBI PPF rules:
 * - Maximum deposit: ₹1,50,000 per financial year (Section 80C eligible)
 * - Minimum deposit: ₹500 per financial year
 * - Mandatory initial lock-in tenure: 15 financial years
 * - Extension in blocks of 5 years (with or without fresh contributions / re-investment)
 * - Interest calculated on lowest balance between 5th and end of each month, compounded annually
 * - 100% Tax-Free status under EEE (Exempt-Exempt-Exempt) regime:
 *   - Investment: Deductible under Sec 80C
 *   - Interest: 100% Tax-Free under Sec 10(11)
 *   - Maturity: 100% Tax-Free under Sec 10(11)
 */
export function calculatePpf(inputs: Partial<PpfCalculationInputs> = {}): PpfCalculationResult {
  const merged: PpfCalculationInputs = {
    ...DEFAULT_PPF_INPUTS,
    ...inputs,
  }

  const rate = Math.max(0, merged.annualInterestRate ?? DEFAULT_PPF_INTEREST_RATE)
  const isExisting = merged.startMode === 'existing'
  const yearsAlready = isExisting ? Math.max(0, Math.min(29, merged.yearsAlreadyInvested || 0)) : 0
  const existingCorpus = isExisting ? Math.max(0, merged.existingCorpus || 0) : 0

  // Total tenure from account opening: min 15 years, max 50 years
  const totalTenure = Math.max(15, Math.min(50, merged.tenureYears || 15))
  // Remaining future projection years for existing accounts
  const projectionYears = isExisting ? Math.max(1, totalTenure - yearsAlready) : totalTenure

  const extensionMode = merged.extensionMode || 'with_contributions'
  // How many total years user makes contributions (from start of account)
  let maxContributionYears = merged.contributionYears ?? 15
  if (extensionMode === 'without_contributions') {
    maxContributionYears = Math.min(maxContributionYears, 15)
  } else {
    maxContributionYears = Math.min(maxContributionYears, totalTenure)
  }

  const depositFreq = merged.depositFrequency || 'yearly'
  let rawAnnualDeposit =
    depositFreq === 'yearly'
      ? Math.max(0, merged.annualDeposit ?? 150000)
      : Math.max(0, (merged.monthlyDeposit ?? 12500) * 12)

  // Cap at official statutory maximum of ₹1.5 Lakh per financial year
  const annualDeposit = Math.min(MAX_PPF_ANNUAL_DEPOSIT, rawAnnualDeposit)
  const monthlyDeposit = Math.min(12500, Math.round(annualDeposit / 12))

  const taxSlabRate = Math.max(0, merged.taxSlabRatePercent ?? 20.0)
  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)

  let currentBalance = existingCorpus
  let cumulativeDeposit = existingCorpus
  let cumulativeInterest = 0
  let totalTaxSaved = 0

  const yearlySchedule: PpfYearlyBreakdown[] = []

  for (let y = 1; y <= projectionYears; y++) {
    const accountYear = yearsAlready + y
    const isExtended = accountYear > 15
    const isContributionActive = accountYear <= maxContributionYears && annualDeposit > 0
    const yearDeposit = isContributionActive ? annualDeposit : 0

    const openingBalance = currentBalance

    // Interest calculation:
    // When deposited annually (before April 5th): (openingBalance + deposit) * (rate / 100)
    // When deposited monthly before 5th of each month:
    // (openingBalance + 6.5 * monthlyDeposit) * (rate / 100)
    let interestEarned = 0
    if (rate > 0) {
      if (!isContributionActive || yearDeposit === 0) {
        interestEarned = Math.round(openingBalance * (rate / 100))
      } else if (depositFreq === 'yearly') {
        interestEarned = Math.round((openingBalance + yearDeposit) * (rate / 100))
      } else {
        interestEarned = Math.round((openingBalance + 6.5 * monthlyDeposit) * (rate / 100))
      }
    }

    const closingBalance = openingBalance + yearDeposit + interestEarned
    cumulativeDeposit += yearDeposit
    cumulativeInterest += interestEarned

    // 80C Tax Savings: Eligible up to ₹1.5L per financial year
    const taxSaved80C = Math.round(
      Math.min(MAX_PPF_ANNUAL_DEPOSIT, yearDeposit) * (taxSlabRate / 100)
    )
    totalTaxSaved += taxSaved80C

    yearlySchedule.push({
      year: y,
      openingBalance,
      deposit: yearDeposit,
      interestEarned,
      closingBalance,
      cumulativeDeposit,
      cumulativeInterest,
      isExtended,
      isContributionActive,
      taxSaved80C,
    })

    currentBalance = closingBalance
  }

  const maturityAmount = currentBalance
  const totalPrincipalDeposited = cumulativeDeposit
  const totalInterestEarned = cumulativeInterest

  // EEE regime: Net post-tax maturity is 100% tax-free under Section 10(11)
  const netPostTaxMaturity = maturityAmount

  const realPurchasingPower = Math.round(
    maturityAmount / Math.pow(1 + inflationRate / 100, projectionYears)
  )

  const extensionYears = Math.max(0, totalTenure - 15)

  return {
    totalPrincipalDeposited,
    totalInterestEarned,
    maturityAmount,
    netPostTaxMaturity,
    totalTaxSaved80C: totalTaxSaved,
    realPurchasingPower,
    effectiveAnnualRate: rate,
    tenureYears: projectionYears,
    contributionYears: maxContributionYears,
    extensionYears,
    yearlySchedule,
  }
}
