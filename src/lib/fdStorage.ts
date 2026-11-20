import {
  FdCalculationInputs,
  FdCalculationResult,
  DEFAULT_FD_INPUTS,
} from '@/domain/calculations/fd'

export const FD_INPUTS_STORAGE_KEY = 'fundcalc_fd_inputs_v1'
export const FD_RESULTS_STORAGE_KEY = 'fundcalc_fd_results_v1'

export function getStoredFdInputs(): FdCalculationInputs {
  if (typeof window === 'undefined') return DEFAULT_FD_INPUTS
  try {
    const raw = localStorage.getItem(FD_INPUTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_FD_INPUTS,
        ...parsed,
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_FD_INPUTS
}

export function saveStoredFdInputs(inputs: FdCalculationInputs): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FD_INPUTS_STORAGE_KEY, JSON.stringify(inputs))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredFdResults(): FdCalculationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(FD_RESULTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as FdCalculationResult
    }
  } catch {
    // Ignore
  }
  return null
}

export function saveStoredFdResults(results: FdCalculationResult): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FD_RESULTS_STORAGE_KEY, JSON.stringify(results))
  } catch {
    // Ignore storage errors
  }
}

export function clearStoredFdData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(FD_INPUTS_STORAGE_KEY)
    localStorage.removeItem(FD_RESULTS_STORAGE_KEY)
  } catch {
    // Ignore
  }
}
