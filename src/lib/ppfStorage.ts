import {
  PpfCalculationInputs,
  PpfCalculationResult,
  DEFAULT_PPF_INPUTS,
} from '@/domain/calculations/ppf'

export const PPF_INPUTS_STORAGE_KEY = 'fundcalc_ppf_inputs_v1'
export const PPF_RESULTS_STORAGE_KEY = 'fundcalc_ppf_results_v1'
export const FD_PAGE_TAB_STORAGE_KEY = 'fundcalc_fd_tab_v1'

export type FdPageTab = 'fd' | 'ppf'

export function getStoredPpfInputs(): PpfCalculationInputs {
  if (typeof window === 'undefined') return DEFAULT_PPF_INPUTS
  try {
    const raw = localStorage.getItem(PPF_INPUTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_PPF_INPUTS,
        ...parsed,
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_PPF_INPUTS
}

export function saveStoredPpfInputs(inputs: PpfCalculationInputs): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PPF_INPUTS_STORAGE_KEY, JSON.stringify(inputs))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredPpfResults(): PpfCalculationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PPF_RESULTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as PpfCalculationResult
    }
  } catch {
    // Ignore
  }
  return null
}

export function saveStoredPpfResults(results: PpfCalculationResult): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PPF_RESULTS_STORAGE_KEY, JSON.stringify(results))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredFdPageTab(): FdPageTab {
  if (typeof window === 'undefined') return 'fd'
  try {
    const raw = localStorage.getItem(FD_PAGE_TAB_STORAGE_KEY)
    if (raw === 'fd' || raw === 'ppf') {
      return raw
    }
  } catch {
    // Ignore
  }
  return 'fd'
}

export function saveStoredFdPageTab(tab: FdPageTab): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FD_PAGE_TAB_STORAGE_KEY, tab)
  } catch {
    // Ignore storage errors
  }
}

export function clearStoredPpfData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(PPF_INPUTS_STORAGE_KEY)
    localStorage.removeItem(PPF_RESULTS_STORAGE_KEY)
    localStorage.removeItem(FD_PAGE_TAB_STORAGE_KEY)
  } catch {
    // Ignore
  }
}
