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

  // Display Preferences
  cleanView?: boolean

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
  cleanView: false,
  isConfigured: false,
}

/**
 * Normalizes any DOB string (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or DDMMYYYY) to standard DD/MM/YYYY.
 * Returns the raw or empty string safely if not recognizable, without crashing.
 */
export function normalizeDobToDdMmYyyy(dob: string): string {
  if (!dob || typeof dob !== 'string') return ''
  const trimmed = dob.trim()
  if (!trimmed) return ''

  // Already DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/')
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
  }

  // Old stored format YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(trimmed)) {
    const parts = trimmed.split(/[-/]/)
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`
  }

  // DD-MM-YYYY or MM-DD-YYYY or DD.MM.YYYY
  if (/^\d{1,2}[-.]\d{1,2}[-.]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[-.]/)
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    if (p0 <= 12 && p1 > 12) {
      // MM-DD-YYYY -> DD/MM/YYYY
      return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${parts[2]}`
    }
    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`
  }

  // 8 digits consecutive: DDMMYYYY
  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.slice(0, 2)}/${trimmed.slice(2, 4)}/${trimmed.slice(4, 8)}`
  }

  return trimmed
}

/**
 * Validates whether a DOB string corresponds to a valid calendar date in either DD/MM/YYYY or YYYY-MM-DD format.
 */
export function isValidDob(dobString: string): boolean {
  if (!dobString || typeof dobString !== 'string') return false
  const trimmed = dobString.trim()
  if (!trimmed) return false

  const parts = trimmed.split(/[-/.]/)
  if (parts.length !== 3) return false

  let year: number
  let month: number
  let day: number

  if (parts[0].length === 4) {
    // YYYY-MM-DD
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10) - 1
    day = parseInt(parts[2], 10)
  } else if (parts[2].length === 4) {
    // DD/MM/YYYY or MM-DD-YYYY
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    const p2 = parseInt(parts[2], 10)
    if (p0 <= 12 && p1 > 12) {
      // MM-DD-YYYY or MM/DD/YYYY
      month = p0 - 1
      day = p1
      year = p2
    } else {
      // DD/MM/YYYY or DD-MM-YYYY
      day = p0
      month = p1 - 1
      year = p2
    }
  } else {
    return false
  }

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
    return false
  }

  const birthDate = new Date(year, month, day)
  return (
    !isNaN(birthDate.getTime()) &&
    birthDate.getFullYear() === year &&
    birthDate.getMonth() === month &&
    birthDate.getDate() === day
  )
}

/**
 * Calculates accurate age from a Date of Birth string in DD/MM/YYYY or YYYY-MM-DD format.
 * Falls back safely to fallbackAge (default 30) without throwing or crashing on malformed/partial values.
 */
export function calculateAgeFromDob(
  dobString: string,
  referenceDate: Date = new Date(),
  fallbackAge: number = 30
): number {
  if (!dobString || typeof dobString !== 'string') return fallbackAge
  const trimmed = dobString.trim()
  if (!trimmed) return fallbackAge

  const parts = trimmed.split(/[-/.]/)
  if (parts.length !== 3) return fallbackAge

  let year: number
  let month: number
  let day: number

  if (parts[0].length === 4) {
    // YYYY-MM-DD or YYYY/MM/DD
    year = parseInt(parts[0], 10)
    month = parseInt(parts[1], 10) - 1
    day = parseInt(parts[2], 10)
  } else if (parts[2].length === 4) {
    // DD/MM/YYYY or MM-DD-YYYY
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    const p2 = parseInt(parts[2], 10)
    if (p0 <= 12 && p1 > 12) {
      // MM-DD-YYYY or MM/DD/YYYY
      month = p0 - 1
      day = p1
      year = p2
    } else {
      // DD/MM/YYYY or DD-MM-YYYY
      day = p0
      month = p1 - 1
      year = p2
    }
  } else {
    const p0 = parseInt(parts[0], 10)
    const p2 = parseInt(parts[2], 10)
    if (p0 > 31) {
      year = p0
      month = parseInt(parts[1], 10) - 1
      day = p2
    } else {
      day = p0
      month = parseInt(parts[1], 10) - 1
      year = p2 > 100 ? p2 : p2 > 50 ? 1900 + p2 : 2000 + p2
    }
  }

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
    return fallbackAge
  }

  const birthDate = new Date(year, month, day)
  if (
    isNaN(birthDate.getTime()) ||
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month ||
    birthDate.getDate() !== day
  ) {
    return fallbackAge
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const m = referenceDate.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--
  }
  return Math.max(1, Math.min(120, age))
}

/**
 * Derives an approximate DOB string in DD/MM/YYYY format given an age in years.
 */
export function calculateDobFromAge(age: number, referenceDate: Date = new Date()): string {
  const safeAge = Math.max(1, Math.min(120, Math.round(age || 30)))
  const targetYear = referenceDate.getFullYear() - safeAge
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0')
  const day = String(referenceDate.getDate()).padStart(2, '0')
  return `${day}/${month}/${targetYear}`
}

/**
 * Parses any valid DOB string (DD/MM/YYYY, YYYY-MM-DD, MM-DD-YYYY) to standard ISO YYYY-MM-DD for native HTML date pickers.
 */
export function parseDobToIso(dob: string): string {
  if (!dob || typeof dob !== 'string') return ''
  const trimmed = dob.trim()
  if (!trimmed) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const parts = trimmed.split(/[-/.]/)
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const y = parts[0]
      const m = parts[1].padStart(2, '0')
      const d = parts[2].padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    if (parts[2].length === 4) {
      const y = parts[2]
      const p0 = parseInt(parts[0], 10)
      const p1 = parseInt(parts[1], 10)
      let m: string
      let d: string
      if (p0 <= 12 && p1 > 12) {
        // MM-DD-YYYY or MM/DD/YYYY
        m = parts[0].padStart(2, '0')
        d = parts[1].padStart(2, '0')
      } else {
        // DD/MM/YYYY or DD-MM-YYYY
        d = parts[0].padStart(2, '0')
        m = parts[1].padStart(2, '0')
      }
      return `${y}-${m}-${d}`
    }
  }

  return ''
}

/**
 * Formats any valid DOB string into MM-DD-YYYY display format.
 */
export function formatDobToMmDdYyyy(dob: string): string {
  const iso = parseDobToIso(dob)
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${m}-${d}-${y}`
}
