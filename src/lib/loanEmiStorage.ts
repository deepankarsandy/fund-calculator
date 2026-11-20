import {
  LoanEmiCalculationInputs,
  LoanEmiCalculationResult,
  DEFAULT_LOAN_EMI_INPUTS,
} from '@/domain/calculations/loanEmi'

export const LOAN_EMI_INPUTS_STORAGE_KEY = 'fundcalc_loan_emi_inputs_v1'
export const LOAN_EMI_RESULTS_STORAGE_KEY = 'fundcalc_loan_emi_results_v1'

export function getStoredLoanEmiInputs(): LoanEmiCalculationInputs {
  if (typeof window === 'undefined') return DEFAULT_LOAN_EMI_INPUTS
  try {
    const raw = localStorage.getItem(LOAN_EMI_INPUTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_LOAN_EMI_INPUTS,
        ...parsed,
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_LOAN_EMI_INPUTS
}

export function saveStoredLoanEmiInputs(inputs: LoanEmiCalculationInputs): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOAN_EMI_INPUTS_STORAGE_KEY, JSON.stringify(inputs))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredLoanEmiResults(): LoanEmiCalculationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOAN_EMI_RESULTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as LoanEmiCalculationResult
    }
  } catch {
    // Ignore
  }
  return null
}

export function saveStoredLoanEmiResults(results: LoanEmiCalculationResult): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOAN_EMI_RESULTS_STORAGE_KEY, JSON.stringify(results))
  } catch {
    // Ignore storage errors
  }
}

export function clearStoredLoanEmiData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LOAN_EMI_INPUTS_STORAGE_KEY)
    localStorage.removeItem(LOAN_EMI_RESULTS_STORAGE_KEY)
  } catch {
    // Ignore
  }
}
