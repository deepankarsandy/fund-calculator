export type LifestyleScenario = 'bare_minimum' | 'comfortable' | 'luxury' | 'custom'
export type WithdrawalTiming = 'beginning_of_year' | 'end_of_year'
export type InflationMode = 'simple' | 'category' | 'item'
export type ReturnBasis = 'gross' | 'net'
export type AreaType = 'village' | 'small_town' | 'city' | 'tier1_metro'

export interface Profile {
  country: string
  region: string
  city: string
  currency: string
  currentAge: number
  targetAge: number
  areaType: AreaType
  lifestyleScenario: LifestyleScenario
}

export const DEFAULT_PROFILE: Profile = {
  country: 'India',
  region: 'Odisha',
  city: '',
  currency: 'INR',
  currentAge: 30,
  targetAge: 85,
  areaType: 'small_town',
  lifestyleScenario: 'comfortable',
}
