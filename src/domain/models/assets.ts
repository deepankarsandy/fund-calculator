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
  existingInvestableCorpus: number
  futureContributions: FutureLumpSum[]
  otherIncome: OtherIncome[]
}

export const DEFAULT_ASSETS: Assets = {
  existingInvestableCorpus: 0,
  futureContributions: [],
  otherIncome: [],
}
