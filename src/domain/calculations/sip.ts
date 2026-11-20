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

  const monthlyRate = annualReturnRate > 0 ? annualReturnRate / 100 / 12 : 0

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
    const interestEarnedYear = endBalance - prevYearEndBalance - yearlyInvestmentSum

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

  const monthlyRate = annualReturnRate > 0 ? annualReturnRate / 100 / 12 : 0
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

// ==========================================
// SIP to SWP Lifecycle (Accumulation to Decumulation) Domain
// ==========================================

export interface SipToSwpInputs {
  currentAge: number
  retirementAge: number
  targetAge: number
  monthlySip: number
  sipReturnRate: number
  enableSipStepUp?: boolean
  sipStepUpPercent?: number
  monthlySwp: number
  swpReturnRate: number
  enableSwpStepUp?: boolean
  swpStepUpPercent?: number
  enableTax?: boolean
  taxRatePercent?: number
  taxExemptionAmount?: number
  inflationRatePercent?: number
}

export interface SipToSwpYearlyBreakdown {
  year: number
  age: number
  phase: 'sip' | 'swp'
  monthlyAmount: number
  yearlyCashflow: number
  cumulativeInvested: number
  cumulativeWithdrawn: number
  interestEarnedYear: number
  cumulativeInterest: number
  endBalance: number
  isDepleted: boolean
}

export interface SipToSwpCalculationResult {
  currentAge: number
  retirementAge: number
  targetAge: number
  sipYears: number
  swpYears: number
  totalYears: number

  // SIP Phase
  totalSipInvested: number
  sipAccumulatedCorpus: number
  sipWealthGain: number
  sipEstimatedTax: number
  sipNetCorpus: number

  // SWP Phase
  totalSwpWithdrawn: number
  finalRemainingBalance: number
  realRemainingBalance: number
  totalGrowthDuringSwp: number
  isDepleted: boolean
  depletionAge: number | null
  depletionYearOfSwp: number | null
  depletionMonth: number | null
  unfundedYears: number

  // Sustainability & Recommendations
  isEnough: boolean
  requiredMonthlySip: number
  sustainableMonthlySwp: number
  netSurplusOrShortfall: number

  // Yearly Schedule
  yearlySchedule: SipToSwpYearlyBreakdown[]
}

export const DEFAULT_SIP_TO_SWP_INPUTS: SipToSwpInputs = {
  currentAge: 30,
  retirementAge: 60,
  targetAge: 90,
  monthlySip: 15000,
  sipReturnRate: 12.0,
  enableSipStepUp: false,
  sipStepUpPercent: 10.0,
  monthlySwp: 60000,
  swpReturnRate: 8.0,
  enableSwpStepUp: false,
  swpStepUpPercent: 5.0,
  enableTax: true,
  taxRatePercent: 12.5,
  taxExemptionAmount: 125000,
  inflationRatePercent: 6.0,
}

function simulateSwpInternal(
  initialCorpus: number,
  monthlyWithdrawal: number,
  annualReturnRate: number,
  years: number,
  enableStepUp: boolean,
  stepUpPercent: number
): { finalBalance: number; isDepleted: boolean; depletionMonth: number | null } {
  const monthlyRate = annualReturnRate > 0 ? annualReturnRate / 100 / 12 : 0
  const totalMonths = years * 12
  let balance = Math.max(0, initialCorpus)
  let isDepleted = false
  let depletionMonth: number | null = null

  if (balance <= 0 && monthlyWithdrawal > 0) {
    return { finalBalance: 0, isDepleted: true, depletionMonth: 1 }
  }

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12)
    const target = enableStepUp
      ? monthlyWithdrawal * Math.pow(1 + stepUpPercent / 100, yearIndex)
      : monthlyWithdrawal

    if (balance <= 0) {
      if (!isDepleted) {
        isDepleted = true
        depletionMonth = m
      }
      break
    }

    if (balance < target) {
      balance = 0
      if (!isDepleted) {
        isDepleted = true
        depletionMonth = m
      }
      break
    }

    balance -= target
    balance += balance * monthlyRate
  }

  return {
    finalBalance: Math.max(0, balance),
    isDepleted,
    depletionMonth,
  }
}

function simulateSipInternal(
  monthlyInvestment: number,
  annualReturnRate: number,
  years: number,
  enableStepUp: boolean,
  stepUpPercent: number
): { grossCorpus: number; totalInvested: number } {
  const monthlyRate = annualReturnRate > 0 ? annualReturnRate / 100 / 12 : 0
  let balance = 0
  let totalInvested = 0

  for (let year = 1; year <= years; year++) {
    const yearIndex = year - 1
    const currentMonthly = enableStepUp
      ? monthlyInvestment * Math.pow(1 + stepUpPercent / 100, yearIndex)
      : monthlyInvestment

    for (let month = 1; month <= 12; month++) {
      balance = (balance + currentMonthly) * (1 + monthlyRate)
      totalInvested += currentMonthly
    }
  }

  return { grossCorpus: balance, totalInvested }
}

export function calculateSipToSwp(inputs: Partial<SipToSwpInputs> = {}): SipToSwpCalculationResult {
  const merged: SipToSwpInputs = {
    ...DEFAULT_SIP_TO_SWP_INPUTS,
    ...inputs,
  }

  const currentAge = Math.max(18, Math.min(80, Math.round(merged.currentAge || 30)))
  const retirementAge = Math.max(
    currentAge + 1,
    Math.min(85, Math.round(merged.retirementAge || 60))
  )
  const targetAge = Math.max(retirementAge + 1, Math.min(100, Math.round(merged.targetAge || 90)))

  const sipYears = retirementAge - currentAge
  const swpYears = targetAge - retirementAge
  const totalYears = sipYears + swpYears

  const monthlySip = Math.max(0, merged.monthlySip || 0)
  const sipReturnRate = Math.max(0, merged.sipReturnRate || 0)
  const enableSipStepUp = Boolean(merged.enableSipStepUp)
  const sipStepUpPercent = Math.max(0, merged.sipStepUpPercent || 0)

  const monthlySwp = Math.max(0, merged.monthlySwp || 0)
  const swpReturnRate = Math.max(0, merged.swpReturnRate || 0)
  const enableSwpStepUp = Boolean(merged.enableSwpStepUp)
  const swpStepUpPercent = Math.max(0, merged.swpStepUpPercent || 0)

  const enableTax = merged.enableTax !== false
  const taxRate = Math.max(0, merged.taxRatePercent ?? 12.5)
  const taxExemption = Math.max(0, merged.taxExemptionAmount ?? 125000)
  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)

  const sipMonthlyRate = sipReturnRate > 0 ? sipReturnRate / 100 / 12 : 0
  const swpMonthlyRate = swpReturnRate > 0 ? swpReturnRate / 100 / 12 : 0

  const yearlySchedule: SipToSwpYearlyBreakdown[] = []

  // ----------------------------------------------------
  // Phase 1: SIP Accumulation (Current Age -> Retirement Age)
  // ----------------------------------------------------
  let balance = 0
  let cumulativeInvested = 0
  let prevYearEndBalance = 0

  for (let year = 1; year <= sipYears; year++) {
    const yearIndex = year - 1
    const age = currentAge + yearIndex
    const currentMonthly = enableSipStepUp
      ? monthlySip * Math.pow(1 + sipStepUpPercent / 100, yearIndex)
      : monthlySip

    let yearlyInvestmentSum = 0

    for (let month = 1; month <= 12; month++) {
      balance = (balance + currentMonthly) * (1 + sipMonthlyRate)
      yearlyInvestmentSum += currentMonthly
    }

    cumulativeInvested += yearlyInvestmentSum
    const endBalance = balance
    const cumulativeInterest = endBalance - cumulativeInvested
    const interestEarnedYear = endBalance - prevYearEndBalance - yearlyInvestmentSum

    yearlySchedule.push({
      year,
      age,
      phase: 'sip',
      monthlyAmount: Math.round(currentMonthly),
      yearlyCashflow: Math.round(yearlyInvestmentSum),
      cumulativeInvested: Math.round(cumulativeInvested),
      cumulativeWithdrawn: 0,
      interestEarnedYear: Math.max(0, Math.round(interestEarnedYear)),
      cumulativeInterest: Math.max(0, Math.round(cumulativeInterest)),
      endBalance: Math.round(endBalance),
      isDepleted: false,
    })

    prevYearEndBalance = endBalance
  }

  const totalSipInvested = Math.round(cumulativeInvested)
  const sipAccumulatedCorpus = Math.round(balance)
  const sipWealthGain = Math.max(0, sipAccumulatedCorpus - totalSipInvested)

  let sipEstimatedTax = 0
  if (enableTax) {
    const taxableGains = Math.max(0, sipWealthGain - taxExemption)
    sipEstimatedTax = Math.round(taxableGains * (taxRate / 100))
  }
  const sipNetCorpus = Math.max(0, sipAccumulatedCorpus - sipEstimatedTax)

  // ----------------------------------------------------
  // Phase 2: SWP Decumulation (Retirement Age -> Target Age)
  // Starting corpus = sipAccumulatedCorpus
  // ----------------------------------------------------
  const totalSwpMonths = swpYears * 12
  let totalWithdrawn = 0
  let totalGrowthDuringSwp = 0
  let isDepleted = false
  let depletionYearOfSwp: number | null = null
  let depletionMonth: number | null = null

  let currentYearWithdrawn = 0
  let currentYearInterest = 0
  let latestMonthlyWithdrawal = monthlySwp

  for (let m = 1; m <= totalSwpMonths; m++) {
    const swpYearIndex = Math.floor((m - 1) / 12)
    const swpCurrentYearNum = swpYearIndex + 1

    const monthlyTarget = enableSwpStepUp
      ? monthlySwp * Math.pow(1 + swpStepUpPercent / 100, swpYearIndex)
      : monthlySwp
    latestMonthlyWithdrawal = monthlyTarget

    if (balance <= 0) {
      if (!isDepleted && monthlyTarget > 0) {
        isDepleted = true
        depletionYearOfSwp = swpCurrentYearNum
        depletionMonth = m
      }
    } else {
      let actualWithdrawal = monthlyTarget
      if (balance < monthlyTarget) {
        actualWithdrawal = balance
        balance = 0
        if (!isDepleted) {
          isDepleted = true
          depletionYearOfSwp = swpCurrentYearNum
          depletionMonth = m
        }
      } else {
        balance -= monthlyTarget
      }

      totalWithdrawn += actualWithdrawal
      currentYearWithdrawn += actualWithdrawal

      const monthInterest = balance * swpMonthlyRate
      balance += monthInterest
      totalGrowthDuringSwp += monthInterest
      currentYearInterest += monthInterest
    }

    if (m % 12 === 0 || m === totalSwpMonths) {
      const overallYear = sipYears + swpCurrentYearNum
      const age = retirementAge + swpYearIndex

      yearlySchedule.push({
        year: overallYear,
        age,
        phase: 'swp',
        monthlyAmount: Math.round(latestMonthlyWithdrawal),
        yearlyCashflow: Math.round(currentYearWithdrawn),
        cumulativeInvested: totalSipInvested,
        cumulativeWithdrawn: Math.round(totalWithdrawn),
        interestEarnedYear: Math.round(currentYearInterest),
        cumulativeInterest: Math.round(totalGrowthDuringSwp),
        endBalance: Math.round(balance),
        isDepleted: balance <= 0,
      })

      currentYearWithdrawn = 0
      currentYearInterest = 0
    }
  }

  const finalRemainingBalance = Math.round(balance)
  const isEnough = !isDepleted && finalRemainingBalance >= 0
  const depletionAge = depletionYearOfSwp !== null ? retirementAge + depletionYearOfSwp - 1 : null
  const unfundedYears =
    isDepleted && depletionAge !== null ? Math.max(0, targetAge - depletionAge) : 0

  // Real purchasing power remaining at targetAge
  const inflationDiscount = Math.pow(1 + inflationRate / 100, totalYears)
  const realRemainingBalance = Math.round(finalRemainingBalance / inflationDiscount)

  // ----------------------------------------------------
  // Calculate Sustainable Monthly SWP (Max SWP current SIP can support)
  // ----------------------------------------------------
  let sustainableMonthlySwp = 0
  if (sipAccumulatedCorpus > 0) {
    let low = 0
    let high = Math.max(100000, sipAccumulatedCorpus)
    while (
      !simulateSwpInternal(
        sipAccumulatedCorpus,
        high,
        swpReturnRate,
        swpYears,
        enableSwpStepUp,
        swpStepUpPercent
      ).isDepleted &&
      high < 1e9
    ) {
      high *= 2
    }
    for (let i = 0; i < 35; i++) {
      const mid = (low + high) / 2
      const sim = simulateSwpInternal(
        sipAccumulatedCorpus,
        mid,
        swpReturnRate,
        swpYears,
        enableSwpStepUp,
        swpStepUpPercent
      )
      if (sim.isDepleted) {
        high = mid
      } else {
        low = mid
      }
    }
    sustainableMonthlySwp = Math.round(low)
  }

  // ----------------------------------------------------
  // Calculate Required Monthly SIP (Min SIP to sustain desired monthlySwp)
  // ----------------------------------------------------
  let requiredMonthlySip = 0
  if (monthlySwp > 0) {
    let cLow = 0
    let cHigh = Math.max(1000000, monthlySwp * swpYears * 12 * 2)
    while (
      simulateSwpInternal(
        cHigh,
        monthlySwp,
        swpReturnRate,
        swpYears,
        enableSwpStepUp,
        swpStepUpPercent
      ).isDepleted &&
      cHigh < 1e11
    ) {
      cHigh *= 2
    }
    for (let i = 0; i < 35; i++) {
      const mid = (cLow + cHigh) / 2
      const sim = simulateSwpInternal(
        mid,
        monthlySwp,
        swpReturnRate,
        swpYears,
        enableSwpStepUp,
        swpStepUpPercent
      )
      if (sim.isDepleted) {
        cLow = mid
      } else {
        cHigh = mid
      }
    }
    const requiredRetirementCorpus = cHigh

    let sLow = 0
    let sHigh = Math.max(10000, requiredRetirementCorpus / (sipYears * 12))
    while (
      simulateSipInternal(sHigh, sipReturnRate, sipYears, enableSipStepUp, sipStepUpPercent)
        .grossCorpus < requiredRetirementCorpus &&
      sHigh < 1e9
    ) {
      sHigh *= 2
    }
    for (let i = 0; i < 35; i++) {
      const mid = (sLow + sHigh) / 2
      const sim = simulateSipInternal(
        mid,
        sipReturnRate,
        sipYears,
        enableSipStepUp,
        sipStepUpPercent
      )
      if (sim.grossCorpus < requiredRetirementCorpus) {
        sLow = mid
      } else {
        sHigh = mid
      }
    }
    requiredMonthlySip = Math.round(sHigh)
  }

  return {
    currentAge,
    retirementAge,
    targetAge,
    sipYears,
    swpYears,
    totalYears,

    totalSipInvested,
    sipAccumulatedCorpus,
    sipWealthGain,
    sipEstimatedTax,
    sipNetCorpus,

    totalSwpWithdrawn: Math.round(totalWithdrawn),
    finalRemainingBalance,
    realRemainingBalance,
    totalGrowthDuringSwp: Math.round(totalGrowthDuringSwp),
    isDepleted,
    depletionAge,
    depletionYearOfSwp,
    depletionMonth,
    unfundedYears,

    isEnough,
    requiredMonthlySip,
    sustainableMonthlySwp,
    netSurplusOrShortfall: finalRemainingBalance,

    yearlySchedule,
  }
}
