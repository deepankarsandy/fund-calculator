export interface SipCalculationInputs {
  monthlyInvestment: number
  annualReturnRate: number // in percentage, e.g. 12
  timeHorizonYears: number
  enableStepUp?: boolean
  stepUpPercentage?: number // in percentage, e.g. 10
  enableTax?: boolean
  taxRatePercent?: number // in percentage, default 12.5 (Budget 2024 LTCG)
  taxExemptionAmount?: number // default 125000 (₹1.25 Lakh exemption)
  inflationRatePercent?: number // default 6.0
}

export interface SipYearlyBreakdown {
  year: number
  monthlyContribution: number
  yearlyInvested: number
  cumulativeInvested: number
  interestEarnedYear: number
  cumulativeInterest: number
  endBalance: number
}

export interface SipCalculationResult {
  totalInvested: number
  estimatedReturns: number
  grossCorpus: number
  taxableGains: number
  estimatedTax: number
  netCorpus: number
  realPurchasingPower: number
  yearlySchedule: SipYearlyBreakdown[]
}

export const DEFAULT_SIP_INPUTS: SipCalculationInputs = {
  monthlyInvestment: 10000,
  annualReturnRate: 12.0,
  timeHorizonYears: 10,
  enableStepUp: false,
  stepUpPercentage: 10.0,
  enableTax: true,
  taxRatePercent: 12.5,
  taxExemptionAmount: 125000,
  inflationRatePercent: 6.0,
}

export function calculateSip(inputs: Partial<SipCalculationInputs> = {}): SipCalculationResult {
  const merged: SipCalculationInputs = {
    ...DEFAULT_SIP_INPUTS,
    ...inputs,
  }

  const monthlyInvestment = Math.max(0, merged.monthlyInvestment || 0)
  const annualReturnRate = Math.max(0, merged.annualReturnRate || 0)
  const years = Math.max(1, Math.min(60, Math.round(merged.timeHorizonYears || 1)))
  const enableStepUp = Boolean(merged.enableStepUp)
  const stepUpPercent = Math.max(0, merged.stepUpPercentage || 0)
  const enableTax = merged.enableTax !== false
  const taxRate = Math.max(0, merged.taxRatePercent ?? 12.5)
  const taxExemption = Math.max(0, merged.taxExemptionAmount ?? 125000)
  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)

  const monthlyRate = annualReturnRate > 0 ? (annualReturnRate / 100) / 12 : 0

  const yearlySchedule: SipYearlyBreakdown[] = []
  let balance = 0
  let cumulativeInvested = 0
  let prevYearEndBalance = 0

  for (let year = 1; year <= years; year++) {
    const yearIndex = year - 1
    const currentMonthly = enableStepUp
      ? monthlyInvestment * Math.pow(1 + stepUpPercent / 100, yearIndex)
      : monthlyInvestment

    let yearlyInvestmentSum = 0

    for (let month = 1; month <= 12; month++) {
      balance = (balance + currentMonthly) * (1 + monthlyRate)
      yearlyInvestmentSum += currentMonthly
    }

    cumulativeInvested += yearlyInvestmentSum
    const endBalance = balance
    const cumulativeInterest = endBalance - cumulativeInvested
    const interestEarnedYear = (endBalance - prevYearEndBalance) - yearlyInvestmentSum

    yearlySchedule.push({
      year,
      monthlyContribution: Math.round(currentMonthly),
      yearlyInvested: Math.round(yearlyInvestmentSum),
      cumulativeInvested: Math.round(cumulativeInvested),
      interestEarnedYear: Math.max(0, Math.round(interestEarnedYear)),
      cumulativeInterest: Math.max(0, Math.round(cumulativeInterest)),
      endBalance: Math.round(endBalance),
    })

    prevYearEndBalance = endBalance
  }

  const totalInvested = Math.round(cumulativeInvested)
  const grossCorpus = Math.round(balance)
  const estimatedReturns = Math.max(0, grossCorpus - totalInvested)

  // Tax calculation
  let taxableGains = 0
  let estimatedTax = 0
  if (enableTax) {
    taxableGains = Math.max(0, estimatedReturns - taxExemption)
    estimatedTax = Math.round(taxableGains * (taxRate / 100))
  }
  const netCorpus = Math.max(0, grossCorpus - estimatedTax)

  // Real purchasing power adjusted for inflation
  const inflationDiscount = Math.pow(1 + inflationRate / 100, years)
  const realPurchasingPower = Math.round(grossCorpus / inflationDiscount)

  return {
    totalInvested,
    estimatedReturns,
    grossCorpus,
    taxableGains,
    estimatedTax,
    netCorpus,
    realPurchasingPower,
    yearlySchedule,
  }
}
