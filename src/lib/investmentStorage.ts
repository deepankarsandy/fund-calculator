import {
  InvestmentCalculationInputs,
  InvestmentCalculationResult,
  DEFAULT_INVESTMENT_INPUTS,
} from '@/domain/calculations/investment'

export const INVESTMENT_INPUTS_STORAGE_KEY = 'fundcalc_investment_inputs_v1'
export const INVESTMENT_RESULTS_STORAGE_KEY = 'fundcalc_investment_results_v1'

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

export function clearStoredInvestmentData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(INVESTMENT_INPUTS_STORAGE_KEY)
    localStorage.removeItem(INVESTMENT_RESULTS_STORAGE_KEY)
  } catch {
    // Ignore
  }
}
