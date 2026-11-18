export interface OtherIncome {
  id: string
  label: string
  annualAmount: number
  startYear: number
  endYear?: number
  inflationLinked: boolean
}

export interface FutureLumpSum {
  id: string
  label: string
  amount: number
  year: number
}

export interface Assets {
  monthlyIncome: number          // monthly earned income today (₹)
  incomeEndAge: number           // age until which earned income continues (e.g. 60)
  incomeGrowthRate: number       // annual increment rate (e.g. 0.07 for 7%)
  existingInvestableCorpus: number
  futureContributions: FutureLumpSum[]
  otherIncome: OtherIncome[]
}

export const DEFAULT_ASSETS: Assets = {
  monthlyIncome: 0,
  incomeEndAge: 60,
  incomeGrowthRate: 0.07,
  existingInvestableCorpus: 0,
  futureContributions: [],
  otherIncome: [],
}
