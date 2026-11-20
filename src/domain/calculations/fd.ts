export type FdCompoundingFrequency =
  | 'quarterly'
  | 'monthly'
  | 'half_yearly'
  | 'annually'
  | 'simple'

export type FdPayoutType = 'cumulative' | 'monthly' | 'quarterly'

export interface FdCalculationInputs {
  principalAmount: number
  annualInterestRate: number
  isSeniorCitizen: boolean
  tenureYears: number
  tenureMonths: number
  compoundingFrequency: FdCompoundingFrequency
  payoutType: FdPayoutType
  enableTax: boolean
  taxSlabRatePercent: number
  hasSubmittedForm15G: boolean
  inflationRatePercent: number
}

export interface FdYearlyBreakdown {
  year: number
  invested: number
  interestEarnedYear: number
  cumulativeInterest: number
  endBalance: number
}

export interface FdCalculationResult {
  principalAmount: number
  effectiveAnnualRate: number
  effectiveYieldPercent: number
  maturityAmount: number
  totalInterestEarned: number
  periodicPayoutAmount: number
  estimatedTds: number
  estimatedTaxLiability: number
  netPostTaxMaturity: number
  realPurchasingPower: number
  yearlySchedule: FdYearlyBreakdown[]
}

export const DEFAULT_FD_INPUTS: FdCalculationInputs = {
  principalAmount: 200000,
  annualInterestRate: 7.0,
  isSeniorCitizen: false,
  tenureYears: 5,
  tenureMonths: 0,
  compoundingFrequency: 'quarterly',
  payoutType: 'cumulative',
  enableTax: true,
  taxSlabRatePercent: 20.0,
  hasSubmittedForm15G: false,
  inflationRatePercent: 6.0,
}

export function calculateFd(inputs: Partial<FdCalculationInputs> = {}): FdCalculationResult {
  const merged: FdCalculationInputs = {
    ...DEFAULT_FD_INPUTS,
    ...inputs,
  }

  const principal = Math.max(0, merged.principalAmount || 0)
  const baseRate = Math.max(0, merged.annualInterestRate || 0)
  const seniorBonus = merged.isSeniorCitizen ? 0.5 : 0
  const effectiveRate = baseRate + seniorBonus

  const years = Math.max(0, merged.tenureYears || 0)
  const months = Math.max(0, merged.tenureMonths || 0)
  const totalYears = Math.max(1 / 12, years + months / 12)

  const compoundingFreq = merged.compoundingFrequency || 'quarterly'
  const payoutType = merged.payoutType || 'cumulative'
  const enableTax = merged.enableTax !== false
  const slabRate = Math.max(0, merged.taxSlabRatePercent ?? 20.0)
  const hasForm15G = Boolean(merged.hasSubmittedForm15G)
  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)

  let n = 4 // default quarterly
  if (compoundingFreq === 'monthly') n = 12
  else if (compoundingFreq === 'half_yearly') n = 2
  else if (compoundingFreq === 'annually') n = 1

  let maturityAmount = principal
  let totalInterestEarned = 0
  let periodicPayoutAmount = 0
  let effectiveYieldPercent = effectiveRate

  if (payoutType === 'cumulative') {
    if (compoundingFreq === 'simple') {
      maturityAmount = Math.round(principal * (1 + (effectiveRate / 100) * totalYears))
      effectiveYieldPercent = effectiveRate
    } else {
      const ratePerPeriod = (effectiveRate / 100) / n
      const totalPeriods = n * totalYears
      maturityAmount = Math.round(principal * Math.pow(1 + ratePerPeriod, totalPeriods))
      effectiveYieldPercent = Number(
        ((Math.pow(1 + ratePerPeriod, n) - 1) * 100).toFixed(2)
      )
    }
    totalInterestEarned = Math.max(0, maturityAmount - principal)
  } else {
    // Non-cumulative periodic payouts
    const periodsPerYear = payoutType === 'monthly' ? 12 : 4
    periodicPayoutAmount = Math.round(
      (principal * (effectiveRate / 100)) / periodsPerYear
    )
    totalInterestEarned = Math.round(
      principal * (effectiveRate / 100) * totalYears
    )
    maturityAmount = principal
    effectiveYieldPercent = effectiveRate
  }

  // TDS and Income Tax computation
  const annualInterest = totalInterestEarned / totalYears
  const tdsThreshold = merged.isSeniorCitizen ? 50000 : 40000
  let estimatedTds = 0
  if (enableTax && !hasForm15G && annualInterest > tdsThreshold) {
    estimatedTds = Math.round(totalInterestEarned * 0.10)
  }

  const estimatedTaxLiability = enableTax
    ? Math.round(totalInterestEarned * (slabRate / 100))
    : 0

  const netPostTaxMaturity =
    payoutType === 'cumulative'
      ? Math.max(0, maturityAmount - estimatedTaxLiability)
      : Math.max(0, principal + totalInterestEarned - estimatedTaxLiability)

  const realPurchasingPower = Math.round(
    maturityAmount / Math.pow(1 + inflationRate / 100, totalYears)
  )

  // Yearly Schedule
  const yearlySchedule: FdYearlyBreakdown[] = []
  const fullYears = Math.max(1, Math.ceil(totalYears))
  let prevBalance = principal

  for (let y = 1; y <= fullYears; y++) {
    const elapsed = Math.min(y, totalYears)
    let yearBalance = principal

    if (payoutType === 'cumulative') {
      if (compoundingFreq === 'simple') {
        yearBalance = Math.round(principal * (1 + (effectiveRate / 100) * elapsed))
      } else {
        const ratePerPeriod = (effectiveRate / 100) / n
        const periods = n * elapsed
        yearBalance = Math.round(principal * Math.pow(1 + ratePerPeriod, periods))
      }
    } else {
      yearBalance = principal + Math.round(principal * (effectiveRate / 100) * elapsed)
    }

    const interestEarnedYear = yearBalance - prevBalance
    const cumulativeInterest = yearBalance - principal

    yearlySchedule.push({
      year: y,
      invested: principal,
      interestEarnedYear: Math.max(0, interestEarnedYear),
      cumulativeInterest: Math.max(0, cumulativeInterest),
      endBalance: yearBalance,
    })

    prevBalance = yearBalance
  }

  return {
    principalAmount: principal,
    effectiveAnnualRate: Number(effectiveRate.toFixed(2)),
    effectiveYieldPercent,
    maturityAmount,
    totalInterestEarned,
    periodicPayoutAmount,
    estimatedTds,
    estimatedTaxLiability,
    netPostTaxMaturity,
    realPurchasingPower,
    yearlySchedule,
  }
}
