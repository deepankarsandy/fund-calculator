import type { AreaType, LifestyleScenario } from './profile'
import type { HouseholdMember } from './household'

export interface SectorInflationRates {
  housing: number
  food: number
  utilities: number
  transport: number
  healthcare: number
  personal: number
  technology: number
  family: number
  financial: number
  emergency: number
  custom: number
}

export type InflationMode = 'overall' | 'sector'
export type TaxRegime = 'new' | 'old'

export interface UserProfile {
  // Identity & Demographics
  name: string
  dob: string // 'YYYY-MM-DD'
  currentAge: number // auto-calculated from dob or entered manually
  retirementAge: number // e.g. 60
  targetAge: number // e.g. 85
  country: string // 'India', 'United States', etc.
  currency: string // 'INR', 'USD', 'EUR', 'GBP'
  locationType: AreaType // 'village' | 'small_town' | 'city' | 'tier1_metro'
  lifestyleBaseline: LifestyleScenario // 'bare_minimum' | 'comfortable' | 'luxury' | 'custom'

  // Income, Savings & Assets
  monthlyIncome: number // e.g. 100000
  annualIncomeGrowthRate: number // in percentage, e.g. 7.0
  existingInvestableCorpus: number // e.g. 500000
  monthlyPfInvestment: number // e.g. 10000
  monthlyNpsInvestment: number // e.g. 5000
  monthlySipInvestment: number // e.g. 15000

  // Taxes
  incomeTaxBracket: number // in percentage, e.g. 20 (0, 5, 10, 15, 20, 30)
  taxRegime: TaxRegime // 'new' | 'old'
  ltcgTaxRate: number // in percentage, default 12.5 (Budget 2024)

  // Inflation Defaults
  inflationMode: InflationMode // 'overall' | 'sector'
  overallInflationRate: number // in percentage, default 6.0
  sectorInflationRates: SectorInflationRates

  // Baseline Return / Interest Expectations
  expectedEquityReturn: number // in percentage, e.g. 12.0
  expectedDebtReturn: number // in percentage, e.g. 7.0
  fdInterestRate: number // in percentage, e.g. 7.0
  loanInterestRate: number // in percentage, e.g. 8.5

  // Dependents & Household Defaults
  dependents: HouseholdMember[]

  // Metadata
  isConfigured: boolean
  updatedAt?: string
}

export const DEFAULT_SECTOR_INFLATION: SectorInflationRates = {
  housing: 5.0,
  food: 5.0,
  utilities: 5.0,
  transport: 5.0,
  healthcare: 7.0, // Healthcare historically inflates higher in India (~7-10%)
  personal: 5.0,
  technology: 3.0, // Gadgets/electronics inflate at lower rates (~2-4%)
  family: 7.0, // Education & dependent care inflate higher (~7-9%)
  financial: 5.0,
  emergency: 5.0,
  custom: 5.0,
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  dob: '',
  currentAge: 30,
  retirementAge: 60,
  targetAge: 85,
  country: 'India',
  currency: 'INR',
  locationType: 'small_town',
  lifestyleBaseline: 'comfortable',
  monthlyIncome: 100000,
  annualIncomeGrowthRate: 7.0,
  existingInvestableCorpus: 500000,
  monthlyPfInvestment: 10000,
  monthlyNpsInvestment: 5000,
  monthlySipInvestment: 15000,
  incomeTaxBracket: 20.0,
  taxRegime: 'new',
  ltcgTaxRate: 12.5,
  inflationMode: 'sector',
  overallInflationRate: 6.0,
  sectorInflationRates: { ...DEFAULT_SECTOR_INFLATION },
  expectedEquityReturn: 12.0,
  expectedDebtReturn: 7.0,
  fdInterestRate: 7.0,
  loanInterestRate: 8.5,
  dependents: [],
  isConfigured: false,
}

/**
 * Calculates accurate age from a Date of Birth string (YYYY-MM-DD).
 */
export function calculateAgeFromDob(dobString: string, referenceDate: Date = new Date()): number {
  if (!dobString || typeof dobString !== 'string') return 30
  const parts = dobString.split('-')
  if (parts.length !== 3) return 30
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return 30

  const birthDate = new Date(year, month, day)
  if (isNaN(birthDate.getTime())) return 30

  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const m = referenceDate.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--
  }
  return Math.max(1, Math.min(120, age))
}

/**
 * Derives an approximate DOB string (YYYY-MM-DD) given an age in years.
 */
export function calculateDobFromAge(age: number, referenceDate: Date = new Date()): string {
  const safeAge = Math.max(1, Math.min(120, Math.round(age || 30)))
  const targetYear = referenceDate.getFullYear() - safeAge
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0')
  const day = String(referenceDate.getDate()).padStart(2, '0')
  return `${targetYear}-${month}-${day}`
}
