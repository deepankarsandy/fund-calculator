import {
  InvestmentCalculationInputs,
  InvestmentCalculationResult,
  DEFAULT_INVESTMENT_INPUTS,
} from '@/domain/calculations/investment'
import {
  CustomPlanInputs,
  CustomPlanResult,
  DEFAULT_CUSTOM_PLAN_INPUTS,
} from '@/domain/calculations/customPlan'

export type InvestmentTab = 'multi_asset' | 'simple' | 'custom_plan'

export const INVESTMENT_INPUTS_STORAGE_KEY = 'fundcalc_investment_inputs_v1'
export const INVESTMENT_RESULTS_STORAGE_KEY = 'fundcalc_investment_results_v1'
export const INVESTMENT_TAB_STORAGE_KEY = 'fundcalc_investment_tab_v1'
export const CUSTOM_PLAN_INPUTS_STORAGE_KEY = 'fundcalc_custom_plan_inputs_v1'
export const CUSTOM_PLAN_RESULTS_STORAGE_KEY = 'fundcalc_custom_plan_results_v1'

export function getStoredInvestmentInputs(): InvestmentCalculationInputs {
  if (typeof window === 'undefined') return DEFAULT_INVESTMENT_INPUTS
  try {
    const raw = localStorage.getItem(INVESTMENT_INPUTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_INVESTMENT_INPUTS,
        ...parsed,
        allocations: parsed.allocations || DEFAULT_INVESTMENT_INPUTS.allocations,
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_INVESTMENT_INPUTS
}

export function saveStoredInvestmentInputs(inputs: InvestmentCalculationInputs): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INVESTMENT_INPUTS_STORAGE_KEY, JSON.stringify(inputs))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredInvestmentResults(): InvestmentCalculationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(INVESTMENT_RESULTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as InvestmentCalculationResult
    }
  } catch {
    // Ignore
  }
  return null
}

export function saveStoredInvestmentResults(results: InvestmentCalculationResult): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INVESTMENT_RESULTS_STORAGE_KEY, JSON.stringify(results))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredInvestmentTab(): InvestmentTab {
  if (typeof window === 'undefined') return 'multi_asset'
  try {
    const raw = localStorage.getItem(INVESTMENT_TAB_STORAGE_KEY)
    if (raw === 'multi_asset' || raw === 'simple' || raw === 'custom_plan') {
      return raw
    }
  } catch {
    // Ignore
  }
  return 'multi_asset'
}

export function saveStoredInvestmentTab(tab: InvestmentTab): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INVESTMENT_TAB_STORAGE_KEY, tab)
  } catch {
    // Ignore
  }
}

export function getStoredCustomPlanInputs(): CustomPlanInputs {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_PLAN_INPUTS
  try {
    const raw = localStorage.getItem(CUSTOM_PLAN_INPUTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_CUSTOM_PLAN_INPUTS,
        ...parsed,
        customSchedule: parsed.customSchedule || [],
      }
    }
  } catch {
    // Ignore
  }
  return DEFAULT_CUSTOM_PLAN_INPUTS
}

export function saveStoredCustomPlanInputs(inputs: CustomPlanInputs): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CUSTOM_PLAN_INPUTS_STORAGE_KEY, JSON.stringify(inputs))
  } catch {
    // Ignore
  }
}

export function getStoredCustomPlanResults(): CustomPlanResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CUSTOM_PLAN_RESULTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as CustomPlanResult
    }
  } catch {
    // Ignore
  }
  return null
}

export function saveStoredCustomPlanResults(results: CustomPlanResult): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CUSTOM_PLAN_RESULTS_STORAGE_KEY, JSON.stringify(results))
  } catch {
    // Ignore
  }
}

export function clearStoredInvestmentData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(INVESTMENT_INPUTS_STORAGE_KEY)
    localStorage.removeItem(INVESTMENT_RESULTS_STORAGE_KEY)
    localStorage.removeItem(INVESTMENT_TAB_STORAGE_KEY)
    localStorage.removeItem(CUSTOM_PLAN_INPUTS_STORAGE_KEY)
    localStorage.removeItem(CUSTOM_PLAN_RESULTS_STORAGE_KEY)
  } catch {
    // Ignore
  }
}
