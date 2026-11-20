export interface AssetAllocationItem {
  id: 'equity' | 'debt' | 'gold' | 'cash'
  name: string
  allocationPercent: number // e.g. 50
  expectedReturnRate: number // e.g. 12
  taxRatePercent: number // e.g. 12.5
  taxExemptionAmount?: number // e.g. 125000 for equity
}

export interface InvestmentCalculationInputs {
  initialInvestment: number
  timeHorizonYears: number
  mode: 'simple' | 'multi_asset'
  simpleReturnRate: number // e.g. 11.0
  simpleTaxRate: number // e.g. 12.5
  enableTax: boolean
  inflationRatePercent: number // e.g. 6.0
  allocations: AssetAllocationItem[]
}

export interface AssetYearlyValue {
  assetId: string
  name: string
  value: number
  invested: number
  gains: number
  tax: number
  netValue: number
}

export interface InvestmentYearlyBreakdown {
  year: number
  invested: number
  grossBalance: number
  interestEarnedYear: number
  cumulativeInterest: number
  assetBreakdown?: {
    equity: number
    debt: number
    gold: number
    cash: number
  }
}

export interface InvestmentCalculationResult {
  totalInvested: number
  estimatedReturns: number
  grossCorpus: number
  blendedReturnRate: number
  estimatedTax: number
  netCorpus: number
  realPurchasingPower: number
  assetResults: AssetYearlyValue[]
  yearlySchedule: InvestmentYearlyBreakdown[]
}

export const DEFAULT_ASSET_ALLOCATIONS: AssetAllocationItem[] = [
  {
    id: 'equity',
    name: 'Domestic Equity (Nifty / MFs)',
    allocationPercent: 50,
    expectedReturnRate: 12.0,
    taxRatePercent: 12.5,
    taxExemptionAmount: 125000,
  },
  {
    id: 'debt',
    name: 'Debt & Fixed Income',
    allocationPercent: 30,
    expectedReturnRate: 7.0,
    taxRatePercent: 20.0,
    taxExemptionAmount: 0,
  },
  {
    id: 'gold',
    name: 'Gold (ETF / SGB / Physical)',
    allocationPercent: 10,
    expectedReturnRate: 9.0,
    taxRatePercent: 12.5,
    taxExemptionAmount: 0,
  },
  {
    id: 'cash',
    name: 'Cash / Liquid & Bank FD',
    allocationPercent: 10,
    expectedReturnRate: 6.5,
    taxRatePercent: 20.0,
    taxExemptionAmount: 0,
  },
]

export const DEFAULT_INVESTMENT_INPUTS: InvestmentCalculationInputs = {
  initialInvestment: 500000,
  timeHorizonYears: 10,
  mode: 'multi_asset',
  simpleReturnRate: 10.5,
  simpleTaxRate: 12.5,
  enableTax: true,
  inflationRatePercent: 6.0,
  allocations: DEFAULT_ASSET_ALLOCATIONS,
}

export function calculateInvestment(
  inputs: Partial<InvestmentCalculationInputs> = {}
): InvestmentCalculationResult {
  const merged: InvestmentCalculationInputs = {
    ...DEFAULT_INVESTMENT_INPUTS,
    ...inputs,
    allocations: inputs.allocations || DEFAULT_ASSET_ALLOCATIONS,
  }

  const P = Math.max(0, merged.initialInvestment || 0)
  const years = Math.max(1, Math.min(60, Math.round(merged.timeHorizonYears || 1)))
  const enableTax = merged.enableTax !== false
  const inflationRate = Math.max(0, merged.inflationRatePercent ?? 6.0)

  if (P === 0) {
    return {
      totalInvested: 0,
      estimatedReturns: 0,
      grossCorpus: 0,
      blendedReturnRate: 0,
      estimatedTax: 0,
      netCorpus: 0,
      realPurchasingPower: 0,
      assetResults: [],
      yearlySchedule: Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        invested: 0,
        grossBalance: 0,
        interestEarnedYear: 0,
        cumulativeInterest: 0,
      })),
    }
  }

  if (merged.mode === 'simple') {
    const rate = Math.max(0, merged.simpleReturnRate || 0) / 100
    const grossCorpus = Math.round(P * Math.pow(1 + rate, years))
    const estimatedReturns = Math.max(0, grossCorpus - P)

    let estimatedTax = 0
    if (enableTax) {
      const taxableGains = Math.max(0, estimatedReturns - 125000)
      estimatedTax = Math.round(taxableGains * ((merged.simpleTaxRate || 12.5) / 100))
    }
    const netCorpus = Math.max(0, grossCorpus - estimatedTax)
    const realPurchasingPower = Math.round(grossCorpus / Math.pow(1 + inflationRate / 100, years))

    const yearlySchedule: InvestmentYearlyBreakdown[] = []
    let prevYearEnd = P
    for (let y = 1; y <= years; y++) {
      const balance = Math.round(P * Math.pow(1 + rate, y))
      const interestEarnedYear = balance - prevYearEnd
      const cumulativeInterest = balance - P
      yearlySchedule.push({
        year: y,
        invested: P,
        grossBalance: balance,
        interestEarnedYear,
        cumulativeInterest,
      })
      prevYearEnd = balance
    }

    return {
      totalInvested: P,
      estimatedReturns,
      grossCorpus,
      blendedReturnRate: Number((rate * 100).toFixed(2)),
      estimatedTax,
      netCorpus,
      realPurchasingPower,
      assetResults: [
        {
          assetId: 'portfolio',
          name: 'Blended Investment Portfolio',
          value: grossCorpus,
          invested: P,
          gains: estimatedReturns,
          tax: estimatedTax,
          netValue: netCorpus,
        },
      ],
      yearlySchedule,
    }
  }

  // Multi-asset allocation mode
  const rawSum = merged.allocations.reduce((acc, a) => acc + (a.allocationPercent || 0), 0)
  const normFactor = rawSum > 0 ? 100 / rawSum : 1

  const assetResults: AssetYearlyValue[] = []
  let totalGrossCorpus = 0
  let totalTax = 0

  merged.allocations.forEach((item) => {
    const normalizedWeight = (item.allocationPercent || 0) * normFactor
    const assetP = (P * normalizedWeight) / 100
    const assetRate = Math.max(0, item.expectedReturnRate || 0) / 100
    const assetEndValue = Math.round(assetP * Math.pow(1 + assetRate, years))
    const gains = Math.max(0, assetEndValue - Math.round(assetP))

    let tax = 0
    if (enableTax) {
      const exemption = Math.max(0, item.taxExemptionAmount || 0)
      const taxableGains = Math.max(0, gains - exemption)
      tax = Math.round(taxableGains * ((item.taxRatePercent || 0) / 100))
    }

    const netValue = Math.max(0, assetEndValue - tax)

    totalGrossCorpus += assetEndValue
    totalTax += tax

    assetResults.push({
      assetId: item.id,
      name: item.name,
      value: assetEndValue,
      invested: Math.round(assetP),
      gains,
      tax,
      netValue,
    })
  })

  const grossCorpus = Math.round(totalGrossCorpus)
  const estimatedReturns = Math.max(0, grossCorpus - P)
  const estimatedTax = Math.round(totalTax)
  const netCorpus = Math.max(0, grossCorpus - estimatedTax)

  // Blended compound annual growth rate (CAGR)
  const blendedReturnRate =
    years > 0 && P > 0
      ? Number(((Math.pow(grossCorpus / P, 1 / years) - 1) * 100).toFixed(2))
      : 0

  const realPurchasingPower = Math.round(
    grossCorpus / Math.pow(1 + inflationRate / 100, years)
  )

  // Generate Year-by-Year schedule
  const yearlySchedule: InvestmentYearlyBreakdown[] = []
  let prevYearEnd = P

  for (let y = 1; y <= years; y++) {
    let yearGross = 0
    const assetBreakdown = {
      equity: 0,
      debt: 0,
      gold: 0,
      cash: 0,
    }

    merged.allocations.forEach((item) => {
      const normalizedWeight = (item.allocationPercent || 0) * normFactor
      const assetP = (P * normalizedWeight) / 100
      const assetRate = Math.max(0, item.expectedReturnRate || 0) / 100
      const val = Math.round(assetP * Math.pow(1 + assetRate, y))
      yearGross += val

      if (item.id === 'equity') assetBreakdown.equity = val
      else if (item.id === 'debt') assetBreakdown.debt = val
      else if (item.id === 'gold') assetBreakdown.gold = val
      else if (item.id === 'cash') assetBreakdown.cash = val
    })

    const interestEarnedYear = yearGross - prevYearEnd
    const cumulativeInterest = yearGross - P

    yearlySchedule.push({
      year: y,
      invested: P,
      grossBalance: yearGross,
      interestEarnedYear: Math.max(0, interestEarnedYear),
      cumulativeInterest: Math.max(0, cumulativeInterest),
      assetBreakdown,
    })

    prevYearEnd = yearGross
  }

  return {
    totalInvested: P,
    estimatedReturns,
    grossCorpus,
    blendedReturnRate,
    estimatedTax,
    netCorpus,
    realPurchasingPower,
    assetResults,
    yearlySchedule,
  }
}
