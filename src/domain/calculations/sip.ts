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

// ==========================================
// SWP (Systematic Withdrawal Plan) Domain
// ==========================================

export interface SwpCalculationInputs {
  initialInvestment: number
  monthlyWithdrawal: number
  annualReturnRate: number
  timeHorizonYears: number
  enableStepUpWithdrawal?: boolean
  stepUpWithdrawalPercent?: number
  enableTax?: boolean
  taxRatePercent?: number
  taxExemptionAmount?: number
  inflationRatePercent?: number
}

export interface SwpYearlyBreakdown {
  year: number
  startingBalance: number
  monthlyWithdrawal: number
  yearlyWithdrawn: number
  cumulativeWithdrawn: number
  interestEarnedYear: number
  cumulativeInterest: number
  endingBalance: number
  isDepleted: boolean
}

export interface SwpCalculationResult {
  initialInvestment: number
  totalWithdrawn: number
  finalBalance: number
  totalGrowthEarned: number
  isDepleted: boolean
  depletionYear: number | null
  depletionMonth: number | null
  estimatedTax: number
  netWithdrawn: number
  realPurchasingPowerRemaining: number
  yearlySchedule: SwpYearlyBreakdown[]
}

export const DEFAULT_SWP_INPUTS: SwpCalculationInputs = {
  initialInvestment: 5000000, // ₹50 Lakhs
  monthlyWithdrawal: 35000, // ₹35,000 / month
  annualReturnRate: 8.5, // 8.5% conservative hybrid / equity MF return
  timeHorizonYears: 20,
  enableStepUpWithdrawal: false,
  stepUpWithdrawalPercent: 5.0,
  enableTax: true,
  taxRatePercent: 12.5,
  taxExemptionAmount: 125000,
  inflationRatePercent: 6.0,
}

export function calculateSwp(inputs: Partial<SwpCalculationInputs> = {}): SwpCalculationResult {
  const merged: SwpCalculationInputs = {
    ...DEFAULT_SWP_INPUTS,
    ...inputs,
  }

  const P = Math.max(0, merged.initialInvestment || 0)
  const baseWithdrawal = Math.max(0, merged.monthlyWithdrawal || 0)
  const annualReturnRate = Math.max(0, merged.annualReturnRate || 0)
  const years = Math.max(1, Math.min(60, Math.round(merged.timeHorizonYears || 1)))
  const enableStepUp = Boolean(merged.enableStepUpWithdrawal)
  const stepUpPercent = Math.max(0, merged.stepUpWithdrawalPercent || 0)
  const enableTax = merged.enableTax !== false
  const taxRate = Math.max(0, merged.taxRatePercent ?? 12.5)
  const taxExemption = Math.max(0, merged.taxExemptionAmount ?? 125000)
  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)

  const monthlyRate = annualReturnRate > 0 ? (annualReturnRate / 100) / 12 : 0
  const totalMonths = years * 12

  let balance = P
  let totalWithdrawn = 0
  let totalGrowthEarned = 0
  let isDepleted = false
  let depletionYear: number | null = null
  let depletionMonth: number | null = null

  const yearlySchedule: SwpYearlyBreakdown[] = []

  let yearStartBalance = P
  let currentYearWithdrawn = 0
  let currentYearInterest = 0
  let latestMonthlyWithdrawal = baseWithdrawal

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12)
    const currentYearNum = yearIndex + 1

    const monthlyTarget = enableStepUp
      ? baseWithdrawal * Math.pow(1 + stepUpPercent / 100, yearIndex)
      : baseWithdrawal
    latestMonthlyWithdrawal = monthlyTarget

    if (balance <= 0) {
      if (!isDepleted) {
        isDepleted = true
        depletionYear = currentYearNum
        depletionMonth = m
      }
    } else {
      // Withdrawal taken at beginning of month
      let actualWithdrawal = monthlyTarget
      if (balance < monthlyTarget) {
        actualWithdrawal = balance
        balance = 0
        if (!isDepleted) {
          isDepleted = true
          depletionYear = currentYearNum
          depletionMonth = m
        }
      } else {
        balance -= monthlyTarget
      }

      totalWithdrawn += actualWithdrawal
      currentYearWithdrawn += actualWithdrawal

      // Remaining balance generates monthly interest
      const monthInterest = balance * monthlyRate
      balance += monthInterest
      totalGrowthEarned += monthInterest
      currentYearInterest += monthInterest
    }

    // End of year or last month
    if (m % 12 === 0 || m === totalMonths) {
      yearlySchedule.push({
        year: currentYearNum,
        startingBalance: Math.round(yearStartBalance),
        monthlyWithdrawal: Math.round(latestMonthlyWithdrawal),
        yearlyWithdrawn: Math.round(currentYearWithdrawn),
        cumulativeWithdrawn: Math.round(totalWithdrawn),
        interestEarnedYear: Math.round(currentYearInterest),
        cumulativeInterest: Math.round(totalGrowthEarned),
        endingBalance: Math.round(balance),
        isDepleted: balance <= 0,
      })

      yearStartBalance = balance
      currentYearWithdrawn = 0
      currentYearInterest = 0
    }
  }

  // Capital gains tax estimation on SWP redemptions
  // Capital gain across the tenure = max(0, (totalWithdrawn + finalBalance) - initialPrincipal)
  const totalValueGenerated = totalWithdrawn + balance
  const cumulativeGains = Math.max(0, totalValueGenerated - P)
  let estimatedTax = 0
  if (enableTax && cumulativeGains > 0) {
    const effectiveExemption = taxExemption * years
    const taxableGains = Math.max(0, cumulativeGains - effectiveExemption)
    estimatedTax = Math.round(taxableGains * (taxRate / 100))
  }

  const netWithdrawn = Math.max(0, Math.round(totalWithdrawn - estimatedTax))
  const inflationDiscount = Math.pow(1 + inflationRate / 100, years)
  const realPurchasingPowerRemaining = Math.round(balance / inflationDiscount)

  return {
    initialInvestment: P,
    totalWithdrawn: Math.round(totalWithdrawn),
    finalBalance: Math.round(balance),
    totalGrowthEarned: Math.round(totalGrowthEarned),
    isDepleted,
    depletionYear,
    depletionMonth,
    estimatedTax,
    netWithdrawn,
    realPurchasingPowerRemaining,
    yearlySchedule,
  }
}
