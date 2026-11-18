export type LifestyleScenario = 'bare_minimum' | 'comfortable' | 'custom'
export type WithdrawalTiming = 'beginning_of_year' | 'end_of_year'
export type InflationMode = 'simple' | 'category' | 'item'
export type ReturnBasis = 'gross' | 'net'

export interface Profile {
  country: string
  region: string
  city: string
  currency: string
  currentAge: number
  targetAge: number
  householdSize: number
  lifestyleScenario: LifestyleScenario
}

export const DEFAULT_PROFILE: Profile = {
  country: 'India',
  region: '',
  city: '',
  currency: 'INR',
  currentAge: 30,
  targetAge: 85,
  householdSize: 1,
  lifestyleScenario: 'comfortable',
}
