import { USER_PROFILE_STORAGE_KEY, notifyProfileUpdated } from '@/lib/userProfileStorage'
import { SETTINGS_STORAGE_KEY } from '@/lib/settingsStorage'
import { SIP_INPUTS_STORAGE_KEY, SIP_RESULTS_STORAGE_KEY } from '@/lib/sipStorage'
import {
  INVESTMENT_INPUTS_STORAGE_KEY,
  INVESTMENT_RESULTS_STORAGE_KEY,
  INVESTMENT_TAB_STORAGE_KEY,
  CUSTOM_PLAN_INPUTS_STORAGE_KEY,
  CUSTOM_PLAN_RESULTS_STORAGE_KEY,
} from '@/lib/investmentStorage'
import { FD_INPUTS_STORAGE_KEY, FD_RESULTS_STORAGE_KEY } from '@/lib/fdStorage'
import { LOAN_EMI_INPUTS_STORAGE_KEY, LOAN_EMI_RESULTS_STORAGE_KEY } from '@/lib/loanEmiStorage'
import { LINKED_CALCULATORS_STORAGE_KEY } from '@/lib/linkedCalculatorsStorage'
import { applyTheme, getSavedTheme } from '@/lib/theme'
import { useScenarioStore } from '@/store/useScenarioStore'

export const BACKUP_STORAGE_KEY = 'fundcalc_backup_v1'
export const THEME_STORAGE_KEY = 'corpus_theme'
export const RETIREMENT_CALC_STORAGE_KEY = 'corpus-calc-v2'

export interface StorageSectionConfig {
  id: string
  name: string
  shortTitle: string
  description: string
  keys: string[]
  icon: string
}

export const STORAGE_SECTIONS: StorageSectionConfig[] = [
  {
    id: 'profile',
    name: 'User Profile & Defaults',
    shortTitle: 'User Profile',
    description:
      'Personal details, DOB, retirement ages, expected increment, benchmark returns, and sector inflation rates.',
    keys: [USER_PROFILE_STORAGE_KEY],
    icon: 'user',
  },
  {
    id: 'retirement',
    name: 'Retirement Fund Calculator',
    shortTitle: 'Retirement Fund',
    description:
      'Wizard input parameters, household dependents, customized expense categories, and career accumulation.',
    keys: [RETIREMENT_CALC_STORAGE_KEY, 'corpus-calc-v1', LINKED_CALCULATORS_STORAGE_KEY],
    icon: 'calculator',
  },
  {
    id: 'sip',
    name: 'SIP & SWP Calculator',
    shortTitle: 'SIP & SWP',
    description:
      'Monthly SIP contributions, SWP withdrawal plans, and combo accumulation inputs & cached results.',
    keys: [SIP_INPUTS_STORAGE_KEY, SIP_RESULTS_STORAGE_KEY],
    icon: 'trending-up',
  },
  {
    id: 'investment',
    name: 'Investment & Returns Calculator',
    shortTitle: 'Investment Plans',
    description:
      'Multi-asset allocation, custom year-by-year cashflow plans, and investment performance records.',
    keys: [
      INVESTMENT_INPUTS_STORAGE_KEY,
      INVESTMENT_RESULTS_STORAGE_KEY,
      INVESTMENT_TAB_STORAGE_KEY,
      CUSTOM_PLAN_INPUTS_STORAGE_KEY,
      CUSTOM_PLAN_RESULTS_STORAGE_KEY,
    ],
    icon: 'piggy-bank',
  },
  {
    id: 'fd',
    name: 'Fixed Deposit (FD) Calculator',
    shortTitle: 'Fixed Deposit',
    description:
      'Deposit amounts, interest rates, compounding frequencies, and maturity projections.',
    keys: [FD_INPUTS_STORAGE_KEY, FD_RESULTS_STORAGE_KEY],
    icon: 'landmark',
  },
  {
    id: 'loanEmi',
    name: 'Loan EMI Calculator',
    shortTitle: 'Loan EMI',
    description: 'Loan principal, tenure, benchmark interest rates, and amortisation schedules.',
    keys: [LOAN_EMI_INPUTS_STORAGE_KEY, LOAN_EMI_RESULTS_STORAGE_KEY],
    icon: 'percent',
  },
  {
    id: 'settings',
    name: 'Application Settings',
    shortTitle: 'App Settings',
    description: 'Current wizard step, expanded expense categories, and last active input markers.',
    keys: [SETTINGS_STORAGE_KEY],
    icon: 'settings',
  },
  {
    id: 'theme',
    name: 'Theme Preference',
    shortTitle: 'Theme Mode',
    description: 'Light, dark, or system appearance mode preference.',
    keys: [THEME_STORAGE_KEY],
    icon: 'palette',
  },
]

export interface AppExportData {
  version: 1
  appName: string
  exportedAt: string
  sections: {
    profile?: any
    retirement?: any
    sip?: any
    investment?: any
    fd?: any
    loanEmi?: any
    settings?: any
    theme?: any
    [key: string]: any
  }
  rawStorage: Record<string, string>
}

export interface AppBackup {
  createdAt: string
  reason: string
  rawStorage: Record<string, string>
  sectionsPresent: string[]
  itemsSummary: Record<string, string>
}

export interface ParsedSectionInfo {
  id: string
  name: string
  shortTitle: string
  description: string
  icon: string
  storageKeys: string[]
  summary: string
  data: any
  isValid: boolean
  error?: string
}

export interface ParsedImportResult {
  version?: number
  appName?: string
  exportedAt?: string
  sectionsFound: ParsedSectionInfo[]
  rawStorageMap: Record<string, string>
  compatibleCount: number
  incompatibleCount: number
}

/**
 * Generates summary description for each section's data.
 */
export function getSectionDataSummary(sectionId: string, data: any): string {
  if (!data) return 'No data'
  try {
    switch (sectionId) {
      case 'profile': {
        const name = data.name ? `${data.name}, ` : ''
        const age = typeof data.currentAge === 'number' ? `Age ${data.currentAge}` : ''
        const retAge =
          typeof data.targetRetirementAge === 'number'
            ? `, Retires at ${data.targetRetirementAge}`
            : ''
        const deps =
          Array.isArray(data.dependents) && data.dependents.length > 0
            ? `, ${data.dependents.length} dependent${data.dependents.length > 1 ? 's' : ''}`
            : ''
        const rates = data.sectorInflationRates
          ? `, ${Object.keys(data.sectorInflationRates).length} sector rates`
          : ''
        return `${name}${age}${retAge}${deps}${rates}` || 'Profile configuration'
      }
      case 'retirement': {
        const state = data.state || data
        const cats = Array.isArray(state.categories) ? `${state.categories.length} categories` : ''
        const mems = Array.isArray(state.members) ? `${state.members.length} members` : ''
        const parts = [cats, mems].filter(Boolean)
        return parts.length ? parts.join(', ') : 'Retirement wizard state'
      }
      case 'sip': {
        const sipData = data.sip || (data.inputs && data.inputs.sip) || data
        const mode = data.mode || (data.inputs && data.inputs.mode) || 'SIP'
        const monthly =
          typeof sipData.monthlyInvestment === 'number'
            ? `₹${sipData.monthlyInvestment.toLocaleString('en-IN')}/mo`
            : ''
        return `Mode: ${String(mode).toUpperCase()}${monthly ? ` · ${monthly}` : ''}`
      }
      case 'investment': {
        const inv = data.inputs || data
        const lump =
          typeof inv.initialLumpSum === 'number'
            ? `₹${inv.initialLumpSum.toLocaleString('en-IN')}`
            : ''
        const allocs = Array.isArray(inv.allocations) ? `${inv.allocations.length} assets` : ''
        return [lump, allocs].filter(Boolean).join(' · ') || 'Investment allocations & plans'
      }
      case 'fd': {
        const fdData = data.inputs || data
        const amt =
          typeof fdData.principal === 'number' ? `₹${fdData.principal.toLocaleString('en-IN')}` : ''
        const rate =
          typeof fdData.annualInterestRate === 'number' ? `${fdData.annualInterestRate}%` : ''
        return [amt, rate].filter(Boolean).join(' @ ') || 'Fixed deposit inputs'
      }
      case 'loanEmi': {
        const emi = data.inputs || data
        const amt =
          typeof emi.principal === 'number' ? `₹${emi.principal.toLocaleString('en-IN')}` : ''
        const rate = typeof emi.annualInterestRate === 'number' ? `${emi.annualInterestRate}%` : ''
        return [amt, rate].filter(Boolean).join(' @ ') || 'Loan & EMI inputs'
      }
      case 'settings': {
        const step = typeof data.currentStep === 'number' ? `Step ${data.currentStep}` : ''
        const exp = Array.isArray(data.expandedCategories)
          ? `${data.expandedCategories.length} open categories`
          : ''
        return [step, exp].filter(Boolean).join(', ') || 'UI settings'
      }
      case 'theme': {
        const theme = typeof data === 'string' ? data : data.theme || 'system'
        return `Mode: ${theme}`
      }
      default:
        return 'Data present'
    }
  } catch {
    return 'Data present'
  }
}

/**
 * Validates whether a parsed section's data structure is compatible with the app's domain models.
 * Catches malformed data, schema mismatches, type errors, and negative/out-of-bound numerical inputs.
 */
export function validateSectionCompatibility(
  sectionId: string,
  data: any
): { isValid: boolean; error?: string } {
  if (data === null || data === undefined) {
    return { isValid: false, error: 'Section contains no data (null or undefined).' }
  }

  switch (sectionId) {
    case 'profile': {
      if (typeof data !== 'object' || Array.isArray(data)) {
        return {
          isValid: false,
          error: 'Incompatible profile schema: profile data must be an object.',
        }
      }
      const hasRecognizedField =
        'name' in data ||
        'dob' in data ||
        'currentAge' in data ||
        'retirementAge' in data ||
        'targetRetirementAge' in data ||
        'targetAge' in data ||
        'lifestyleBaseline' in data ||
        'lifestyleScenario' in data ||
        'monthlyIncome' in data ||
        'sectorInflationRates' in data ||
        'country' in data

      if (!hasRecognizedField) {
        return {
          isValid: false,
          error: 'Incompatible profile schema: missing required identity or demographic fields.',
        }
      }

      if (data.currentAge !== undefined) {
        if (
          typeof data.currentAge !== 'number' ||
          isNaN(data.currentAge) ||
          data.currentAge < 0 ||
          data.currentAge > 130
        ) {
          return {
            isValid: false,
            error: 'Invalid currentAge: must be a number between 0 and 130.',
          }
        }
      }

      if (data.retirementAge !== undefined) {
        if (
          typeof data.retirementAge !== 'number' ||
          isNaN(data.retirementAge) ||
          data.retirementAge < 0 ||
          data.retirementAge > 130
        ) {
          return {
            isValid: false,
            error: 'Invalid retirementAge: must be a number between 0 and 130.',
          }
        }
      }

      if (data.monthlyIncome !== undefined) {
        if (
          typeof data.monthlyIncome !== 'number' ||
          isNaN(data.monthlyIncome) ||
          data.monthlyIncome < 0
        ) {
          return { isValid: false, error: 'Invalid monthlyIncome: must be a non-negative number.' }
        }
      }

      if (data.sectorInflationRates !== undefined) {
        if (
          typeof data.sectorInflationRates !== 'object' ||
          Array.isArray(data.sectorInflationRates) ||
          data.sectorInflationRates === null
        ) {
          return {
            isValid: false,
            error: 'Invalid sectorInflationRates: must be an object of sector rates.',
          }
        }
      }

      if (data.dependents !== undefined) {
        if (!Array.isArray(data.dependents)) {
          return {
            isValid: false,
            error: 'Invalid dependents: must be an array of household members.',
          }
        }
      }

      return { isValid: true }
    }

    case 'retirement': {
      const state = data && typeof data === 'object' && data.state ? data.state : data
      if (typeof state !== 'object' || state === null || Array.isArray(state)) {
        return {
          isValid: false,
          error: 'Incompatible retirement state: root state must be an object.',
        }
      }

      const hasRecognized =
        'categories' in state ||
        'members' in state ||
        'assumptions' in state ||
        'assets' in state ||
        'profile' in state

      if (!hasRecognized) {
        return {
          isValid: false,
          error: 'Incompatible retirement schema: missing expense categories or household members.',
        }
      }

      if (state.categories !== undefined) {
        if (!Array.isArray(state.categories)) {
          return {
            isValid: false,
            error: 'Incompatible categories structure: "categories" must be an array.',
          }
        }
        for (const cat of state.categories) {
          if (!cat || typeof cat !== 'object' || !cat.id) {
            return {
              isValid: false,
              error: 'Incompatible category item: categories must have a valid id.',
            }
          }
          if (cat.items !== undefined && !Array.isArray(cat.items)) {
            return {
              isValid: false,
              error: `Incompatible items in category "${cat.id}": items must be an array.`,
            }
          }
        }
      }

      if (state.members !== undefined) {
        if (!Array.isArray(state.members)) {
          return {
            isValid: false,
            error: 'Incompatible household members: "members" must be an array.',
          }
        }
      }

      return { isValid: true }
    }

    case 'sip': {
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { isValid: false, error: 'Incompatible SIP data: must be an object.' }
      }
      const sipPayload = data.sip || (data.inputs && data.inputs.sip) || data
      const hasAnyField =
        'monthlyInvestment' in sipPayload ||
        'sip' in data ||
        'swp' in data ||
        'combo' in data ||
        'mode' in data ||
        'expectedReturnRate' in sipPayload ||
        'timeHorizonYears' in sipPayload

      if (!hasAnyField) {
        return {
          isValid: false,
          error: 'Incompatible SIP schema: missing monthly contribution or mode parameters.',
        }
      }

      if (sipPayload.monthlyInvestment !== undefined) {
        if (
          typeof sipPayload.monthlyInvestment !== 'number' ||
          isNaN(sipPayload.monthlyInvestment) ||
          sipPayload.monthlyInvestment < 0
        ) {
          return { isValid: false, error: 'Invalid monthlyInvestment: must be a positive number.' }
        }
      }

      return { isValid: true }
    }

    case 'investment': {
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { isValid: false, error: 'Incompatible investment data: must be an object.' }
      }
      const invPayload = data.inputs || data
      const hasField =
        'initialLumpSum' in invPayload ||
        'allocations' in invPayload ||
        'customPlanInputs' in data ||
        'tab' in data ||
        'allocations' in data

      if (!hasField) {
        return {
          isValid: false,
          error: 'Incompatible investment schema: missing allocation or lump sum parameters.',
        }
      }

      if (invPayload.initialLumpSum !== undefined) {
        if (
          typeof invPayload.initialLumpSum !== 'number' ||
          isNaN(invPayload.initialLumpSum) ||
          invPayload.initialLumpSum < 0
        ) {
          return { isValid: false, error: 'Invalid initialLumpSum: must be a positive number.' }
        }
      }

      if (invPayload.allocations !== undefined) {
        if (!Array.isArray(invPayload.allocations)) {
          return {
            isValid: false,
            error: 'Invalid allocations: must be an array of asset allocations.',
          }
        }
      }

      return { isValid: true }
    }

    case 'fd': {
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { isValid: false, error: 'Incompatible FD data: must be an object.' }
      }
      const fdPayload = data.inputs || data
      const hasField =
        'principal' in fdPayload || 'annualInterestRate' in fdPayload || 'tenureYears' in fdPayload
      if (!hasField) {
        return {
          isValid: false,
          error: 'Incompatible FD schema: missing principal or annual interest rate.',
        }
      }

      if (fdPayload.principal !== undefined) {
        if (
          typeof fdPayload.principal !== 'number' ||
          isNaN(fdPayload.principal) ||
          fdPayload.principal < 0
        ) {
          return { isValid: false, error: 'Invalid principal: must be a positive number.' }
        }
      }

      if (fdPayload.annualInterestRate !== undefined) {
        if (
          typeof fdPayload.annualInterestRate !== 'number' ||
          isNaN(fdPayload.annualInterestRate) ||
          fdPayload.annualInterestRate < 0 ||
          fdPayload.annualInterestRate > 100
        ) {
          return {
            isValid: false,
            error: 'Invalid annualInterestRate: must be a number between 0% and 100%.',
          }
        }
      }

      return { isValid: true }
    }

    case 'loanEmi': {
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { isValid: false, error: 'Incompatible Loan EMI data: must be an object.' }
      }
      const emiPayload = data.inputs || data
      const hasField =
        'principal' in emiPayload ||
        'annualInterestRate' in emiPayload ||
        'tenureYears' in emiPayload
      if (!hasField) {
        return {
          isValid: false,
          error: 'Incompatible Loan EMI schema: missing loan principal or interest rate.',
        }
      }

      if (emiPayload.principal !== undefined) {
        if (
          typeof emiPayload.principal !== 'number' ||
          isNaN(emiPayload.principal) ||
          emiPayload.principal < 0
        ) {
          return { isValid: false, error: 'Invalid principal: must be a positive number.' }
        }
      }

      if (emiPayload.annualInterestRate !== undefined) {
        if (
          typeof emiPayload.annualInterestRate !== 'number' ||
          isNaN(emiPayload.annualInterestRate) ||
          emiPayload.annualInterestRate < 0 ||
          emiPayload.annualInterestRate > 100
        ) {
          return {
            isValid: false,
            error: 'Invalid annualInterestRate: must be a number between 0% and 100%.',
          }
        }
      }

      return { isValid: true }
    }

    case 'settings': {
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { isValid: false, error: 'Incompatible settings data: must be an object.' }
      }
      if (data.currentStep !== undefined) {
        if (
          typeof data.currentStep !== 'number' ||
          isNaN(data.currentStep) ||
          data.currentStep < 1 ||
          data.currentStep > 6
        ) {
          return {
            isValid: false,
            error: 'Invalid currentStep: must be an integer between 1 and 6.',
          }
        }
      }
      if (data.expandedCategories !== undefined && !Array.isArray(data.expandedCategories)) {
        return {
          isValid: false,
          error: 'Invalid expandedCategories: must be an array of category IDs.',
        }
      }
      return { isValid: true }
    }

    case 'theme': {
      const mode =
        typeof data === 'string' ? data : data && typeof data === 'object' ? data.theme : null
      if (mode !== 'light' && mode !== 'dark' && mode !== 'system') {
        return {
          isValid: false,
          error: `Incompatible theme mode: "${mode}". Must be "light", "dark", or "system".`,
        }
      }
      return { isValid: true }
    }

    default:
      return { isValid: true }
  }
}

/**
 * Extracts and packages all application data from localStorage into a single export JSON object.
 */
export function generateExportData(): AppExportData {
  const sections: Record<string, any> = {}
  const rawStorage: Record<string, string> = {}

  if (typeof window !== 'undefined') {
    for (const section of STORAGE_SECTIONS) {
      for (const key of section.keys) {
        const val = localStorage.getItem(key)
        if (val !== null) {
          rawStorage[key] = val
          try {
            const parsed = JSON.parse(val)
            if (!sections[section.id]) {
              sections[section.id] = parsed
            } else {
              // Combine multi-key sections (like inputs + results)
              if (typeof sections[section.id] === 'object' && typeof parsed === 'object') {
                sections[section.id] = { ...sections[section.id], [key]: parsed }
              }
            }
          } catch {
            sections[section.id] = val
          }
        }
      }
    }
  }

  return {
    version: 1,
    appName: 'Fund Calculator',
    exportedAt: new Date().toISOString(),
    sections,
    rawStorage,
  }
}

/**
 * Downloads the current application data as a single JSON file.
 */
export function downloadExportAsJson(): void {
  if (typeof window === 'undefined') return
  const data = generateExportData()
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `fund-calculator-export-${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Safely parses and validates an uploaded JSON file text.
 */
export function parseAndValidateImportJson(jsonText: string): {
  success: boolean
  data?: ParsedImportResult
  error?: string
} {
  if (!jsonText || !jsonText.trim()) {
    return { success: false, error: 'The uploaded file is empty.' }
  }

  let parsed: any
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return {
      success: false,
      error: 'Invalid JSON format. Please upload a valid JSON file exported from Fund Calculator.',
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { success: false, error: 'JSON root must be an object.' }
  }

  const rawStorageMap: Record<string, string> = {}
  const sectionsFound: ParsedSectionInfo[] = []

  // Check if file has a rawStorage block
  if (parsed.rawStorage && typeof parsed.rawStorage === 'object') {
    for (const [k, v] of Object.entries(parsed.rawStorage)) {
      if (typeof v === 'string') {
        rawStorageMap[k] = v
      } else if (v !== null && v !== undefined) {
        rawStorageMap[k] = JSON.stringify(v)
      }
    }
  }

  // Also harvest any storage keys present at the top level
  for (const section of STORAGE_SECTIONS) {
    for (const key of section.keys) {
      if (parsed[key] !== undefined && rawStorageMap[key] === undefined) {
        rawStorageMap[key] =
          typeof parsed[key] === 'string' ? parsed[key] : JSON.stringify(parsed[key])
      }
    }
  }

  // Detect and resolve sections
  const sectionsContainer =
    parsed.sections && typeof parsed.sections === 'object'
      ? parsed.sections
      : parsed.data && typeof parsed.data === 'object'
        ? parsed.data
        : null

  for (const section of STORAGE_SECTIONS) {
    let sectionData: any = null

    // 1. Check sectionsContainer
    if (sectionsContainer && sectionsContainer[section.id] !== undefined) {
      sectionData = sectionsContainer[section.id]
    }

    // 2. Fall back to rawStorageMap or top level keys
    if (sectionData === null) {
      for (const key of section.keys) {
        if (rawStorageMap[key] !== undefined) {
          try {
            sectionData = JSON.parse(rawStorageMap[key])
          } catch {
            sectionData = rawStorageMap[key]
          }
          break
        }
      }
    }

    if (sectionData !== null && sectionData !== undefined) {
      const compatibility = validateSectionCompatibility(section.id, sectionData)
      sectionsFound.push({
        id: section.id,
        name: section.name,
        shortTitle: section.shortTitle,
        description: section.description,
        icon: section.icon,
        storageKeys: section.keys,
        summary: getSectionDataSummary(section.id, sectionData),
        data: sectionData,
        isValid: compatibility.isValid,
        error: compatibility.error,
      })
    }
  }

  if (sectionsFound.length === 0 && Object.keys(rawStorageMap).length === 0) {
    return {
      success: false,
      error:
        'No recognizable Fund Calculator data was found in this file. Please verify the backup file.',
    }
  }

  const compatibleCount = sectionsFound.filter((s) => s.isValid).length
  const incompatibleCount = sectionsFound.filter((s) => !s.isValid).length

  return {
    success: true,
    data: {
      version: parsed.version || 1,
      appName: parsed.appName || 'Fund Calculator',
      exportedAt: parsed.exportedAt || undefined,
      sectionsFound,
      rawStorageMap,
      compatibleCount,
      incompatibleCount,
    },
  }
}

/**
 * Creates a single snapshot backup of all current application state in localStorage.
 * Overwrites any previous backup so only ONE current backup is stored.
 */
export function createBackup(reason: string): AppBackup | null {
  if (typeof window === 'undefined') return null
  try {
    const rawStorage: Record<string, string> = {}
    const sectionsPresent: string[] = []
    const itemsSummary: Record<string, string> = {}

    for (const section of STORAGE_SECTIONS) {
      let hasData = false
      let combinedData: any = null

      for (const key of section.keys) {
        const val = localStorage.getItem(key)
        if (val !== null) {
          rawStorage[key] = val
          hasData = true
          try {
            combinedData = JSON.parse(val)
          } catch {
            combinedData = val
          }
        }
      }

      if (hasData) {
        sectionsPresent.push(section.id)
        itemsSummary[section.id] = getSectionDataSummary(section.id, combinedData)
      }
    }

    const backup: AppBackup = {
      createdAt: new Date().toISOString(),
      reason,
      rawStorage,
      sectionsPresent,
      itemsSummary,
    }

    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup))
    return backup
  } catch (err) {
    console.error('Failed to create backup:', err)
    return null
  }
}

/**
 * Retrieves the currently stored backup from localStorage, or null if none exists.
 */
export function getStoredBackup(): AppBackup | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppBackup
  } catch {
    return null
  }
}

/**
 * Clears the stored backup from localStorage.
 */
export function clearStoredBackup(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(BACKUP_STORAGE_KEY)
  } catch {}
}

/**
 * Restores all state from the stored backup snapshot.
 */
export function restoreFromBackup(backup: AppBackup): boolean {
  if (typeof window === 'undefined' || !backup || !backup.rawStorage) return false
  try {
    for (const [key, val] of Object.entries(backup.rawStorage)) {
      if (key !== BACKUP_STORAGE_KEY) {
        localStorage.setItem(key, val)
      }
    }
    reSyncApplicationState()
    return true
  } catch (err) {
    console.error('Failed to restore from backup:', err)
    return false
  }
}

/**
 * Writes a specific section's parsed data into localStorage.
 */
export function writeSectionToStorage(sectionId: string, parsed: ParsedImportResult): void {
  const section = STORAGE_SECTIONS.find((s) => s.id === sectionId)
  if (!section) return

  // First check if rawStorageMap has exact keys
  let wroteRaw = false
  for (const key of section.keys) {
    if (parsed.rawStorageMap && parsed.rawStorageMap[key] !== undefined) {
      localStorage.setItem(key, parsed.rawStorageMap[key])
      wroteRaw = true
    }
  }

  // If not written via raw storage or there is section data, write normalized data
  const sectionInfo = parsed.sectionsFound.find((s) => s.id === sectionId)
  if (sectionInfo && sectionInfo.data !== undefined) {
    const data = sectionInfo.data
    switch (sectionId) {
      case 'profile': {
        const val = typeof data === 'string' ? data : JSON.stringify(data)
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, val)
        break
      }
      case 'retirement': {
        // Zustand persist expects { state: ..., version: ... }
        const wrapped = data && data.state ? data : { state: data, version: 0 }
        localStorage.setItem(RETIREMENT_CALC_STORAGE_KEY, JSON.stringify(wrapped))
        break
      }
      case 'sip': {
        if (!wroteRaw) {
          if (data.inputs || data.sip) {
            localStorage.setItem(SIP_INPUTS_STORAGE_KEY, JSON.stringify(data.inputs || data))
          }
          if (data.results) {
            localStorage.setItem(SIP_RESULTS_STORAGE_KEY, JSON.stringify(data.results))
          }
        }
        break
      }
      case 'investment': {
        if (!wroteRaw) {
          if (data.inputs) {
            localStorage.setItem(INVESTMENT_INPUTS_STORAGE_KEY, JSON.stringify(data.inputs))
          }
          if (data.results) {
            localStorage.setItem(INVESTMENT_RESULTS_STORAGE_KEY, JSON.stringify(data.results))
          }
          if (data.tab) {
            localStorage.setItem(INVESTMENT_TAB_STORAGE_KEY, data.tab)
          }
          if (data.customPlanInputs) {
            localStorage.setItem(
              CUSTOM_PLAN_INPUTS_STORAGE_KEY,
              JSON.stringify(data.customPlanInputs)
            )
          }
          if (data.customPlanResults) {
            localStorage.setItem(
              CUSTOM_PLAN_RESULTS_STORAGE_KEY,
              JSON.stringify(data.customPlanResults)
            )
          }
        }
        break
      }
      case 'fd': {
        if (!wroteRaw) {
          if (data.inputs || data.principal) {
            localStorage.setItem(FD_INPUTS_STORAGE_KEY, JSON.stringify(data.inputs || data))
          }
          if (data.results) {
            localStorage.setItem(FD_RESULTS_STORAGE_KEY, JSON.stringify(data.results))
          }
        }
        break
      }
      case 'loanEmi': {
        if (!wroteRaw) {
          if (data.inputs || data.principal) {
            localStorage.setItem(LOAN_EMI_INPUTS_STORAGE_KEY, JSON.stringify(data.inputs || data))
          }
          if (data.results) {
            localStorage.setItem(LOAN_EMI_RESULTS_STORAGE_KEY, JSON.stringify(data.results))
          }
        }
        break
      }
      case 'settings': {
        const val = typeof data === 'string' ? data : JSON.stringify(data)
        localStorage.setItem(SETTINGS_STORAGE_KEY, val)
        break
      }
      case 'theme': {
        const val = typeof data === 'string' ? data : data.theme || 'system'
        localStorage.setItem(THEME_STORAGE_KEY, val)
        break
      }
    }
  }
}

/**
 * Imports all compatible sections found in the parsed file after creating an automatic backup.
 * Skips incompatible sections to prevent application state corruption.
 */
export function importAllData(parsed: ParsedImportResult): {
  success: boolean
  importedCount: number
  skippedCount: number
} {
  if (typeof window === 'undefined') return { success: false, importedCount: 0, skippedCount: 0 }
  try {
    const compatibleSections = parsed.sectionsFound.filter((s) => s.isValid)
    const skippedCount = parsed.sectionsFound.length - compatibleSections.length

    if (compatibleSections.length === 0) {
      return { success: false, importedCount: 0, skippedCount }
    }

    // 1. ALWAYS create backup before import
    createBackup('Pre-import backup: All Compatible Data')

    // 2. Write ONLY compatible sections to storage
    for (const section of compatibleSections) {
      writeSectionToStorage(section.id, parsed)
    }

    // 3. Re-sync in-memory stores and subscribers
    reSyncApplicationState()
    return { success: true, importedCount: compatibleSections.length, skippedCount }
  } catch (err) {
    console.error('Failed to import all data:', err)
    return { success: false, importedCount: 0, skippedCount: parsed.sectionsFound.length }
  }
}

/**
 * Imports a single section after creating an automatic backup.
 * Refuses to overwrite if the section data structure is incompatible.
 */
export function importSingleSection(sectionId: string, parsed: ParsedImportResult): boolean {
  if (typeof window === 'undefined') return false
  try {
    const sectionInfo = parsed.sectionsFound.find((s) => s.id === sectionId)
    if (!sectionInfo || !sectionInfo.isValid) {
      console.warn(`Refusing to import incompatible section: ${sectionId}`)
      return false
    }

    const section = STORAGE_SECTIONS.find((s) => s.id === sectionId)
    const sectionName = section?.name || sectionId

    // 1. ALWAYS create backup before import
    createBackup(`Pre-import backup: ${sectionName}`)

    // 2. Write only this section's keys
    writeSectionToStorage(sectionId, parsed)

    // 3. Re-sync in-memory state
    reSyncApplicationState(sectionId)
    return true
  } catch (err) {
    console.error(`Failed to import section ${sectionId}:`, err)
    return false
  }
}

/**
 * Re-synchronizes in-memory stores, DOM classes, and event listeners after storage mutation.
 */
export function reSyncApplicationState(sectionId?: string): void {
  if (typeof window === 'undefined') return

  // Re-sync Retirement Fund store
  if (!sectionId || sectionId === 'retirement') {
    try {
      const raw = localStorage.getItem(RETIREMENT_CALC_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state) {
          useScenarioStore.setState(parsed.state)
        }
      }
      ;(useScenarioStore as any).persist?.rehydrate?.()
    } catch {}
  }

  // Re-sync User Profile subscribers
  if (!sectionId || sectionId === 'profile') {
    try {
      notifyProfileUpdated()
    } catch {}
  }

  // Re-sync Theme DOM classes
  if (!sectionId || sectionId === 'theme') {
    try {
      applyTheme(getSavedTheme())
    } catch {}
  }

  // Dispatch events for cross-component re-renders
  try {
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('fundcalc_data_imported', { detail: { sectionId } }))
  } catch {}
}
