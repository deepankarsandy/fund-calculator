import type { WithdrawalTiming, InflationMode, ReturnBasis } from './profile'

export interface Assumptions {
  globalInflationRate: number
  inflationMode: InflationMode
  annualInvestmentReturn: number
  returnBasis: ReturnBasis
  investmentFeeRate: number
  taxDragRate: number
  compoundingFrequency: 'annual' | 'monthly'
  withdrawalTiming: WithdrawalTiming
  safetyMarginPercent: number
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  globalInflationRate: 0.05,
  inflationMode: 'simple',
  annualInvestmentReturn: 0.07,
  returnBasis: 'net',
  investmentFeeRate: 0,
  taxDragRate: 0,
  compoundingFrequency: 'annual',
  withdrawalTiming: 'end_of_year',
  safetyMarginPercent: 0.15,
}

export const SCENARIO_PRESETS = {
  optimistic: { globalInflationRate: 0.04, annualInvestmentReturn: 0.07 },
  base: { globalInflationRate: 0.05, annualInvestmentReturn: 0.07 },
  conservative: { globalInflationRate: 0.06, annualInvestmentReturn: 0.07 },
} as const
