export type { Profile, LifestyleScenario, WithdrawalTiming, InflationMode as ProfileInflationMode, ReturnBasis } from './profile'
export { DEFAULT_PROFILE } from './profile'

export type { UserProfile, SectorInflationRates, InflationMode, TaxRegime } from './userProfile'
export { DEFAULT_USER_PROFILE, DEFAULT_SECTOR_INFLATION, calculateAgeFromDob, calculateDobFromAge } from './userProfile'

export type { HouseholdMember, Relationship } from './household'

export type { ExpenseItem, ExpenseCategory, Frequency, ExpenseType, CategoryId } from './expense'
export { FREQUENCY_MULTIPLIERS, FREQUENCY_LABELS } from './expense'

export type { Assumptions } from './assumptions'
export { DEFAULT_ASSUMPTIONS, SCENARIO_PRESETS } from './assumptions'

export type { Assets, OtherIncome, FutureLumpSum } from './assets'
export { DEFAULT_ASSETS } from './assets'

export type { YearProjection, ScenarioResult, CalculationResults } from './results'
