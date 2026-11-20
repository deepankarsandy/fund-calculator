/**
 * Custom Plan & Policy XIRR Calculator
 *
 * Evaluates complex financial policies (guaranteed income plans, endowment policies,
 * deferred annuities, pension plans, and custom multi-year cash flows).
 *
 * Calculates:
 * 1. Exact Annualized Internal Rate of Return (IRR / XIRR)
 * 2. Inflation-Adjusted Real Return & Present Purchasing Power
 * 3. Total Outflows (Invested) vs Total Inflows (Received) & Money Multiplier
 * 4. Opportunity Cost Benchmarking against PPF (7.1%), Debt (7%), and Equity Index (12%)
 * 5. Full Year-by-Year Cash Flow Schedule
 */

export type InvestmentInputType = 'per_year' | 'total'
export type PayoutType = 'regular_and_lumpsum' | 'regular_only' | 'lumpsum_only'

export interface CustomYearCashFlow {
  year: number // 1, 2, 3 ...
  invested: number // outflow in this year (₹)
  received: number // inflow in this year (₹)
  note?: string // optional label (e.g. "Premium 1", "Guaranteed Payout", "Maturity")
}

export interface CustomPlanInputs {
  planName: string
  startAge: number // e.g. 30

  // Investment Phase
  investmentInputType: InvestmentInputType // 'per_year' | 'total'
  annualInvestment: number // e.g. 100,000
  totalInvestment: number // e.g. 1,000,000
  investmentStartYear: number // e.g. 1
  investmentDurationYears: number // e.g. 10
  investmentTiming: 'start_of_year' | 'end_of_year' // default 'start_of_year'

  // Payout / Return Phase
  payoutType: PayoutType // 'regular_and_lumpsum' | 'regular_only' | 'lumpsum_only'
  payoutStartYear: number // e.g. 15
  payoutDurationYears: number // e.g. 26 (from year 15 to 40)
  annualPayout: number // e.g. 120,000
  maturityLumpSum: number // e.g. 1,000,000
  payoutTiming: 'start_of_year' | 'end_of_year' // default 'start_of_year'

  // Economic Assumptions & Benchmarks
  inflationRatePercent: number // e.g. 6.0
  benchmarkReturnRatePercent: number // e.g. 12.0 (Mutual fund / Nifty)

  // Custom Overrides / Schedule
  useCustomSchedule: boolean // if true, uses customSchedule array directly
  customSchedule: CustomYearCashFlow[]
}

export interface CustomPlanYearBreakdown {
  year: number
  age: number
  invested: number // outflow
  received: number // inflow
  netCashFlow: number // received - invested
  inflationDiscountFactor: number // (1 + inflation)^(-t)
  realPurchasingPower: number // present value of received cashflow in today's money
  cumulativeInvested: number
  cumulativeReceived: number
  benchmarkBalance: number // alternative growth in benchmark asset
}

export interface CustomPlanResult {
  xirrPercent: number // e.g. 5.64%
  realXirrPercent: number // inflation adjusted real return %
  totalInvested: number // sum of all investments (outflows)
  totalReceived: number // sum of all payouts + maturity (inflows)
  netProfit: number // totalReceived - totalInvested
  gainMultiplier: number // totalReceived / totalInvested (e.g. 3.25x)
  totalRealPurchasingPower: number // sum of present value of all received cash flows
  purchasingPowerLossPercent: number // % drop in real purchasing power vs nominal received
  breakEvenYear?: number // year where cumulative received >= cumulative invested

  // Benchmark comparisons
  benchmarkPpfCorpus: number // What same investment would yield at 7.1% (PPF)
  benchmarkEquityCorpus: number // What same investment would yield at 12.0% (Nifty Index)
  benchmarkCustomCorpus: number // What same investment would yield at user benchmark rate

  // Evaluation & Verdict
  verdict: {
    rating: 'negative' | 'poor' | 'fair' | 'good' | 'stellar'
    tag: string
    summary: string
    explanation: string
  }

  schedule: CustomPlanYearBreakdown[]
}

export const DEFAULT_CUSTOM_PLAN_INPUTS: CustomPlanInputs = {
  planName: 'Guaranteed Income Life Plan',
  startAge: 30,

  investmentInputType: 'per_year',
  annualInvestment: 100000,
  totalInvestment: 1000000,
  investmentStartYear: 1,
  investmentDurationYears: 10,
  investmentTiming: 'start_of_year',

  payoutType: 'regular_and_lumpsum',
  payoutStartYear: 15,
  payoutDurationYears: 26,
  annualPayout: 120000,
  maturityLumpSum: 1000000,
  payoutTiming: 'start_of_year',

  inflationRatePercent: 6.0,
  benchmarkReturnRatePercent: 12.0,

  useCustomSchedule: false,
  customSchedule: [],
}

export interface PlanPreset {
  id: string
  name: string
  description: string
  badge: string
  inputs: Partial<CustomPlanInputs>
}

export const PLAN_PRESETS: PlanPreset[] = [
  {
    id: 'guaranteed_income',
    name: 'Guaranteed Income Plan (10-Pay, 26-Yr Income)',
    description: 'Pay ₹1L/yr for 10 years, wait till Yr 15, receive ₹1.2L/yr till Yr 40 + ₹10L Return of Premium.',
    badge: 'Popular Insurance Policy',
    inputs: {
      planName: 'Guaranteed Income Life Plan',
      investmentInputType: 'per_year',
      annualInvestment: 100000,
      totalInvestment: 1000000,
      investmentStartYear: 1,
      investmentDurationYears: 10,
      investmentTiming: 'start_of_year',
      payoutType: 'regular_and_lumpsum',
      payoutStartYear: 15,
      payoutDurationYears: 26,
      annualPayout: 120000,
      maturityLumpSum: 1000000,
      payoutTiming: 'start_of_year',
      useCustomSchedule: false,
    },
  },
  {
    id: 'endowment_lumpsum',
    name: 'Endowment Policy (10-Pay, Maturity at Yr 20)',
    description: 'Pay ₹1.5L/yr for 10 years, wait 10 years, receive a single maturity lump sum of ₹36 Lakhs.',
    badge: 'Traditional Endowment',
    inputs: {
      planName: 'Endowment Maturity Plan',
      investmentInputType: 'per_year',
      annualInvestment: 150000,
      totalInvestment: 1500000,
      investmentStartYear: 1,
      investmentDurationYears: 10,
      investmentTiming: 'start_of_year',
      payoutType: 'lumpsum_only',
      payoutStartYear: 20,
      payoutDurationYears: 1,
      annualPayout: 0,
      maturityLumpSum: 3600000,
      payoutTiming: 'end_of_year',
      useCustomSchedule: false,
    },
  },
  {
    id: 'deferred_annuity',
    name: 'Deferred Pension Annuity (15-Pay, 20-Yr Pension)',
    description: 'Pay ₹2L/yr during working years (Yrs 1–15), receive ₹4.2L/yr retirement annuity for 20 years.',
    badge: 'Retirement Annuity',
    inputs: {
      planName: 'Deferred Retirement Annuity',
      investmentInputType: 'per_year',
      annualInvestment: 200000,
      totalInvestment: 3000000,
      investmentStartYear: 1,
      investmentDurationYears: 15,
      investmentTiming: 'start_of_year',
      payoutType: 'regular_only',
      payoutStartYear: 16,
      payoutDurationYears: 20,
      annualPayout: 420000,
      maturityLumpSum: 0,
      payoutTiming: 'start_of_year',
      useCustomSchedule: false,
    },
  },
  {
    id: 'money_back',
    name: 'Money-Back Insurance (Every 5 Years + Maturity)',
    description: 'Pay ₹1L/yr for 15 years with survival payouts at Yr 5, 10, 15 and maturity at Yr 20.',
    badge: 'Money-Back Policy',
    inputs: {
      planName: 'Money-Back 20-Year Plan',
      investmentInputType: 'per_year',
      annualInvestment: 100000,
      totalInvestment: 1500000,
      investmentStartYear: 1,
      investmentDurationYears: 15,
      investmentTiming: 'start_of_year',
      payoutType: 'regular_and_lumpsum',
      payoutStartYear: 20,
      payoutDurationYears: 1,
      annualPayout: 0,
      maturityLumpSum: 1500000,
      payoutTiming: 'end_of_year',
      useCustomSchedule: true,
      customSchedule: Array.from({ length: 20 }, (_, idx) => {
        const y = idx + 1
        const invested = y <= 15 ? 100000 : 0
        let received = 0
        let note = ''
        if (y === 5 || y === 10 || y === 15) {
          received = 200000
          note = `Survival Benefit Yr ${y}`
        } else if (y === 20) {
          received = 1500000
          note = 'Final Maturity Bonus + Sum Assured'
        } else if (y <= 15) {
          note = `Premium ${y}`
        }
        return {
          year: y,
          invested,
          received,
          note,
        }
      }),
    },
  },
]

/**
 * Builds the default schedule array from structured plan parameters
 */
export function buildScheduleFromInputs(inputs: CustomPlanInputs): CustomYearCashFlow[] {
  const investStart = Math.max(1, inputs.investmentStartYear || 1)
  const investDur = Math.max(1, inputs.investmentDurationYears || 1)
  const investEnd = investStart + investDur - 1

  const yearlyInvestAmount =
    inputs.investmentInputType === 'total'
      ? Math.round((inputs.totalInvestment || 0) / investDur)
      : Math.max(0, inputs.annualInvestment || 0)

  let payoutEnd = 0
  if (inputs.payoutType === 'lumpsum_only') {
    payoutEnd = Math.max(inputs.payoutStartYear || 1, investEnd)
  } else {
    const payoutStart = Math.max(1, inputs.payoutStartYear || 1)
    const payoutDur = Math.max(1, inputs.payoutDurationYears || 1)
    payoutEnd = payoutStart + payoutDur - 1
  }

  const maxYear = Math.max(investEnd, payoutEnd, 1)
  const schedule: CustomYearCashFlow[] = []

  for (let y = 1; y <= maxYear; y++) {
    let invested = 0
    let received = 0
    const notes: string[] = []

    // Investment check
    if (y >= investStart && y <= investEnd) {
      invested = yearlyInvestAmount
      notes.push(`Premium (Yr ${y})`)
    }

    // Payout check
    if (inputs.payoutType === 'regular_only' || inputs.payoutType === 'regular_and_lumpsum') {
      const pStart = inputs.payoutStartYear
      const pDur = inputs.payoutDurationYears
      const pEnd = pStart + pDur - 1
      if (y >= pStart && y <= pEnd) {
        received += Math.max(0, inputs.annualPayout || 0)
        notes.push('Annual Payout')
      }
    }

    // Maturity Lump Sum check
    if (inputs.payoutType === 'lumpsum_only') {
      if (y === inputs.payoutStartYear) {
        received += Math.max(0, inputs.maturityLumpSum || 0)
        notes.push('Maturity Lump Sum')
      }
    } else if (inputs.payoutType === 'regular_and_lumpsum') {
      const pStart = inputs.payoutStartYear
      const pDur = inputs.payoutDurationYears
      const pEnd = pStart + pDur - 1
      if (y === pEnd && (inputs.maturityLumpSum || 0) > 0) {
        received += inputs.maturityLumpSum
        notes.push('Maturity Return of Premium / Lump Sum')
      }
    }

    schedule.push({
      year: y,
      invested,
      received,
      note: notes.join(' + ') || undefined,
    })
  }

  return schedule
}

/**
 * High-precision IRR / XIRR calculation with Newton-Raphson & robust Bisection fallback.
 * Solves: sum( cashFlow[t] / (1 + r)^t ) = 0
 */
export function calculateAnnualIRR(
  cashFlows: { t: number; amount: number }[]
): number | null {
  const valid = cashFlows.filter((cf) => cf.amount !== 0)
  if (valid.length < 2) return null

  const hasNegative = valid.some((cf) => cf.amount < 0)
  const hasPositive = valid.some((cf) => cf.amount > 0)
  if (!hasNegative || !hasPositive) return null

  // Objective function: NPV at rate r
  const npv = (r: number): number => {
    let sum = 0
    for (let i = 0; i < valid.length; i++) {
      const { t, amount } = valid[i]
      sum += amount / Math.pow(1 + r, t)
    }
    return sum
  }

  // Derivative dNPV/dr
  const dNpv = (r: number): number => {
    let sum = 0
    for (let i = 0; i < valid.length; i++) {
      const { t, amount } = valid[i]
      if (t !== 0) {
        sum += -t * amount * Math.pow(1 + r, -t - 1)
      }
    }
    return sum
  }

  // 1. Try Newton-Raphson with multiple starting points
  const startingGuesses = [0.06, 0.1, 0.03, 0.15, -0.05, 0.25]
  for (const guess of startingGuesses) {
    let r = guess
    let converged = false

    for (let iter = 0; iter < 60; iter++) {
      if (r <= -0.99) break
      const f = npv(r)
      const df = dNpv(r)

      if (Math.abs(f) < 1e-6) {
        converged = true
        break
      }
      if (Math.abs(df) < 1e-12) break

      const nextR = r - f / df
      if (Math.abs(nextR - r) < 1e-7) {
        r = nextR
        converged = true
        break
      }

      if (nextR <= -0.95 || nextR > 10.0 || isNaN(nextR)) break
      r = nextR
    }

    if (converged && !isNaN(r) && r > -0.99 && r < 10.0) {
      return r
    }
  }

  // 2. Fallback to Bisection method on bracket [-0.90, 3.0]
  let a = -0.9
  let b = 3.0
  let fa = npv(a)
  let fb = npv(b)

  // Expand bracket if both have same sign
  if (fa * fb > 0) {
    const candidateBounds = [-0.5, 0.0, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0]
    let found = false
    for (let i = 0; i < candidateBounds.length - 1; i++) {
      const left = candidateBounds[i]
      const right = candidateBounds[i + 1]
      const fLeft = npv(left)
      const fRight = npv(right)
      if (fLeft * fRight <= 0) {
        a = left
        b = right
        fa = fLeft
        fb = fRight
        found = true
        break
      }
    }
    if (!found) return null
  }

  // Run bisection
  for (let iter = 0; iter < 100; iter++) {
    const mid = (a + b) / 2
    const fMid = npv(mid)

    if (Math.abs(fMid) < 1e-6 || Math.abs(b - a) < 1e-7) {
      return mid
    }

    if (fa * fMid <= 0) {
      b = mid
      fb = fMid
    } else {
      a = mid
      fa = fMid
    }
  }

  return (a + b) / 2
}

/**
 * Calculates Opportunity Benchmark:
 * Simulates investing the exact same annual outflows into a benchmark vehicle (e.g. 7.1% PPF or 12% Nifty)
 * with the same payouts withdrawn when received.
 */
function calculateBenchmarkGrowth(
  schedule: CustomYearCashFlow[],
  annualRatePercent: number,
  timing: 'start_of_year' | 'end_of_year'
): { balances: number[]; finalCorpus: number } {
  const r = annualRatePercent / 100
  let corpus = 0
  const balances: number[] = []

  for (let i = 0; i < schedule.length; i++) {
    const { invested, received } = schedule[i]

    if (timing === 'start_of_year') {
      // Invest at start of year, compounding for the full year
      corpus = (corpus + invested) * (1 + r)
      // Payout received/withdrawn
      corpus = Math.max(0, corpus - received)
    } else {
      // Compounding first, then add investment and deduct payout
      corpus = corpus * (1 + r) + invested - received
      corpus = Math.max(0, corpus)
    }

    balances.push(Math.round(corpus))
  }

  return {
    balances,
    finalCorpus: Math.round(corpus),
  }
}

/**
 * Evaluates the policy and produces the final comprehensive report
 */
export function calculateCustomPlan(
  inputs: Partial<CustomPlanInputs> = {}
): CustomPlanResult {
  const merged: CustomPlanInputs = {
    ...DEFAULT_CUSTOM_PLAN_INPUTS,
    ...inputs,
  }

  // 1. Determine active cash flows
  const rawSchedule =
    merged.useCustomSchedule && merged.customSchedule && merged.customSchedule.length > 0
      ? merged.customSchedule
      : buildScheduleFromInputs(merged)

  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)
  const inflDecimal = inflationRate / 100
  const startAge = Math.max(0, merged.startAge ?? 30)

  // 2. Build cash flows for IRR solver
  // Timing: if 'start_of_year', year 1 payment is at t = 0
  // if 'end_of_year', year 1 payment is at t = 1
  const cashFlowsForIrr: { t: number; amount: number }[] = []

  rawSchedule.forEach((row) => {
    const y = row.year
    const invested = Math.max(0, row.invested || 0)
    const received = Math.max(0, row.received || 0)

    if (invested > 0) {
      const t = merged.investmentTiming === 'start_of_year' ? y - 1 : y
      cashFlowsForIrr.push({ t, amount: -invested })
    }

    if (received > 0) {
      const t = merged.payoutTiming === 'start_of_year' ? y - 1 : y
      cashFlowsForIrr.push({ t, amount: received })
    }
  })

  // Solve for Annualized XIRR
  const rawIrr = calculateAnnualIRR(cashFlowsForIrr)
  const xirrPercent = rawIrr !== null ? Number((rawIrr * 100).toFixed(2)) : 0

  // Real Return (Fisher Equation: (1 + r) / (1 + i) - 1)
  const realReturnRate =
    rawIrr !== null
      ? ((1 + rawIrr) / (1 + inflDecimal) - 1) * 100
      : -inflationRate
  const realXirrPercent = Number(realReturnRate.toFixed(2))

  // 3. Compute Totals, Inflation Discounting, and Schedule
  let totalInvested = 0
  let totalReceived = 0
  let totalRealPurchasingPower = 0
  let cumulativeInvested = 0
  let cumulativeReceived = 0
  let breakEvenYear: number | undefined

  // Benchmark computations
  const customBenchmarkRate = Math.max(0, merged.benchmarkReturnRatePercent ?? 12.0)
  const ppfBenchmark = calculateBenchmarkGrowth(rawSchedule, 7.1, merged.investmentTiming)
  const equityBenchmark = calculateBenchmarkGrowth(rawSchedule, 12.0, merged.investmentTiming)
  const customBenchmark = calculateBenchmarkGrowth(rawSchedule, customBenchmarkRate, merged.investmentTiming)

  const schedule: CustomPlanYearBreakdown[] = []

  for (let i = 0; i < rawSchedule.length; i++) {
    const row = rawSchedule[i]
    const y = row.year
    const age = startAge + (y - 1)
    const invested = Math.max(0, row.invested || 0)
    const received = Math.max(0, row.received || 0)
    const netCashFlow = received - invested

    cumulativeInvested += invested
    cumulativeReceived += received
    totalInvested += invested
    totalReceived += received

    if (breakEvenYear === undefined && cumulativeReceived >= cumulativeInvested && cumulativeInvested > 0) {
      breakEvenYear = y
    }

    // Time t for inflation discounting to Present Value (today's money)
    const tDiscount = merged.payoutTiming === 'start_of_year' ? y - 1 : y
    const discountFactor = 1 / Math.pow(1 + inflDecimal, tDiscount)
    const realPurchasingPower = Math.round(received * discountFactor)

    totalRealPurchasingPower += realPurchasingPower

    schedule.push({
      year: y,
      age,
      invested,
      received,
      netCashFlow,
      inflationDiscountFactor: Number(discountFactor.toFixed(4)),
      realPurchasingPower,
      cumulativeInvested,
      cumulativeReceived,
      benchmarkBalance: customBenchmark.balances[i] || 0,
    })
  }

  const netProfit = totalReceived - totalInvested
  const gainMultiplier =
    totalInvested > 0 ? Number((totalReceived / totalInvested).toFixed(2)) : 0

  const purchasingPowerLossPercent =
    totalReceived > 0
      ? Number((((totalReceived - totalRealPurchasingPower) / totalReceived) * 100).toFixed(1))
      : 0

  // 4. Formulate Financial Verdict
  let rating: 'negative' | 'poor' | 'fair' | 'good' | 'stellar' = 'poor'
  let tag = ''
  let summary = ''
  let explanation = ''

  if (xirrPercent <= 0) {
    rating = 'negative'
    tag = 'Loss Making (Negative IRR)'
    summary = `This plan returns less nominal cash than you paid in.`
    explanation = `The total sum received (₹${totalReceived.toLocaleString('en-IN')}) fails to recover your capital (₹${totalInvested.toLocaleString('en-IN')}).`
  } else if (xirrPercent < inflationRate) {
    rating = 'poor'
    tag = `Negative Real Return (${xirrPercent}% XIRR < ${inflationRate}% Inflation)`
    summary = `Your money loses purchasing power over time.`
    explanation = `While sales brochures highlight receiving ${gainMultiplier}x nominal returns, the annualized return is only ${xirrPercent}%, which is lower than long-term inflation (${inflationRate}%). In real purchasing power, ₹${totalReceived.toLocaleString('en-IN')} received in the future is only worth ₹${totalRealPurchasingPower.toLocaleString('en-IN')} in today's money.`
  } else if (xirrPercent <= 7.5) {
    rating = 'fair'
    tag = `FD / Debt Equivalent (${xirrPercent}% XIRR)`
    summary = `Comparable to Fixed Deposits or Post Office Schemes, but with a multi-decade lock-in.`
    explanation = `The annualized return beats inflation slightly by ${realXirrPercent}%, but is comparable to risk-free sovereign debt or PPF (~7.1%) without offering liquidity or flexibility.`
  } else if (xirrPercent <= 11.0) {
    rating = 'good'
    tag = `Solid Fixed Income Return (${xirrPercent}% XIRR)`
    summary = `Generates a dependable real return above inflation and standard FDs.`
    explanation = `Delivers an above-average yield with steady income predictability.`
  } else {
    rating = 'stellar'
    tag = `High Market-Beating Return (${xirrPercent}% XIRR)`
    summary = `Significantly outperforms traditional fixed income instruments.`
    explanation = `At ${xirrPercent}% annualized return, this plan provides aggressive wealth compounding.`
  }

  return {
    xirrPercent,
    realXirrPercent,
    totalInvested,
    totalReceived,
    netProfit,
    gainMultiplier,
    totalRealPurchasingPower: Math.round(totalRealPurchasingPower),
    purchasingPowerLossPercent,
    breakEvenYear,
    benchmarkPpfCorpus: ppfBenchmark.finalCorpus,
    benchmarkEquityCorpus: equityBenchmark.finalCorpus,
    benchmarkCustomCorpus: customBenchmark.finalCorpus,
    verdict: {
      rating,
      tag,
      summary,
      explanation,
    },
    schedule,
  }
}
