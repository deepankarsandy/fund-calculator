import {
  SipCalculationInputs,
  SipCalculationResult,
  SwpCalculationInputs,
  SwpCalculationResult,
  SipToSwpInputs,
  SipToSwpCalculationResult,
  DEFAULT_SIP_INPUTS,
  DEFAULT_SWP_INPUTS,
  DEFAULT_SIP_TO_SWP_INPUTS,
} from '@/domain/calculations/sip'

export type SipMode = 'sip' | 'swp' | 'combo'

export interface StoredSipData {
  mode: SipMode
  sip: SipCalculationInputs
  swp: SwpCalculationInputs
  combo: SipToSwpInputs
}

export interface StoredSipResultsData {
  mode: SipMode
  sip: SipCalculationResult | null
  swp: SwpCalculationResult | null
  combo: SipToSwpCalculationResult | null
}

export const SIP_INPUTS_STORAGE_KEY = 'fundcalc_sip_inputs_v1'
export const SIP_RESULTS_STORAGE_KEY = 'fundcalc_sip_results_v1'

export const DEFAULT_STORED_SIP_DATA: StoredSipData = {
  mode: 'sip',
  sip: DEFAULT_SIP_INPUTS,
  swp: DEFAULT_SWP_INPUTS,
  combo: DEFAULT_SIP_TO_SWP_INPUTS,
}

export function getStoredSipInputs(): StoredSipData {
  if (typeof window === 'undefined') return DEFAULT_STORED_SIP_DATA
  try {
    const raw = localStorage.getItem(SIP_INPUTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Backward compatibility if previous stored data was plain SipCalculationInputs
      if ('monthlyInvestment' in parsed) {
        return {
          mode: 'sip',
          sip: { ...DEFAULT_SIP_INPUTS, ...parsed },
          swp: DEFAULT_SWP_INPUTS,
          combo: DEFAULT_SIP_TO_SWP_INPUTS,
        }
      }
      const validMode: SipMode = parsed.mode === 'swp' ? 'swp' : parsed.mode === 'combo' ? 'combo' : 'sip'
      return {
        mode: validMode,
        sip: { ...DEFAULT_SIP_INPUTS, ...(parsed.sip || {}) },
        swp: { ...DEFAULT_SWP_INPUTS, ...(parsed.swp || {}) },
        combo: { ...DEFAULT_SIP_TO_SWP_INPUTS, ...(parsed.combo || {}) },
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_STORED_SIP_DATA
}

export function saveStoredSipInputs(data: StoredSipData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SIP_INPUTS_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

export function getStoredSipResults(): StoredSipResultsData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SIP_RESULTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as StoredSipResultsData
    }
  } catch {
    // Ignore
  }
  return null
}

export function saveStoredSipResults(results: StoredSipResultsData): void {
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
