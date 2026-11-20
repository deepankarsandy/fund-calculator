import {
  SipCalculationInputs,
  SipCalculationResult,
  DEFAULT_SIP_INPUTS,
} from '@/domain/calculations/sip'

export const SIP_INPUTS_STORAGE_KEY = 'fundcalc_sip_inputs_v1'
export const SIP_RESULTS_STORAGE_KEY = 'fundcalc_sip_results_v1'

export function getStoredSipInputs(): SipCalculationInputs {
  if (typeof window === 'undefined') return DEFAULT_SIP_INPUTS
  try {
    const raw = localStorage.getItem(SIP_INPUTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_SIP_INPUTS,
        ...parsed,
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_SIP_INPUTS
}

export function saveStoredSipInputs(inputs: SipCalculationInputs): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SIP_INPUTS_STORAGE_KEY, JSON.stringify(inputs))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredSipResults(): SipCalculationResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SIP_RESULTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as SipCalculationResult
    }
  } catch {
    // Ignore
  }
  return null
}

export function saveStoredSipResults(results: SipCalculationResult): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SIP_RESULTS_STORAGE_KEY, JSON.stringify(results))
  } catch {
    // Ignore storage errors
  }
}

export function clearStoredSipData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SIP_INPUTS_STORAGE_KEY)
    localStorage.removeItem(SIP_RESULTS_STORAGE_KEY)
  } catch {
    // Ignore
  }
}
