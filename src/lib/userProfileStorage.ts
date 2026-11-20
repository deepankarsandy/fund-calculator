import { useState, useEffect, useCallback } from 'react'
import {
  UserProfile,
  DEFAULT_USER_PROFILE,
  DEFAULT_SECTOR_INFLATION,
  calculateAgeFromDob,
} from '@/domain/models/userProfile'
import { StoredSipData, getStoredSipInputs, saveStoredSipInputs } from '@/lib/sipStorage'
import { getStoredInvestmentInputs, saveStoredInvestmentInputs } from '@/lib/investmentStorage'
import { getStoredFdInputs, saveStoredFdInputs } from '@/lib/fdStorage'
import { getStoredLoanEmiInputs, saveStoredLoanEmiInputs } from '@/lib/loanEmiStorage'

export const USER_PROFILE_STORAGE_KEY = 'fundcalc_user_profile_v1'

type ProfileChangeListener = (profile: UserProfile) => void
const profileListeners = new Set<ProfileChangeListener>()

/**
 * Loads the current stored user profile, falling back safely to default profile.
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const dob = typeof parsed.dob === 'string' ? parsed.dob : ''
      const currentAge = dob
        ? calculateAgeFromDob(dob)
        : typeof parsed.currentAge === 'number'
          ? parsed.currentAge
          : 30

      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        dob,
        currentAge,
        sectorInflationRates: {
          ...DEFAULT_SECTOR_INFLATION,
          ...(parsed.sectorInflationRates || {}),
        },
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_USER_PROFILE
}

/**
 * Saves the user profile to localStorage and notifies all active subscribers.
 */
export function saveUserProfile(profile: UserProfile, syncToCalculators: boolean = false): void {
  if (typeof window === 'undefined') return
  try {
    const prepared: UserProfile = {
      ...profile,
      currentAge: profile.dob ? calculateAgeFromDob(profile.dob) : profile.currentAge,
      isConfigured: true,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(prepared))

    if (syncToCalculators) {
      syncProfileToCalculators(prepared)
    }

    profileListeners.forEach((fn) => {
      try {
        fn(prepared)
      } catch (err) {
        console.error('Error notifying profile listener:', err)
      }
    })

    // Dispatch window custom event for cross-tab or decoupled sync
    window.dispatchEvent(new CustomEvent('fundcalc_user_profile_updated', { detail: prepared }))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Partially updates the stored user profile.
 */
export function updateUserProfile(
  patch: Partial<UserProfile>,
  syncToCalculators: boolean = false
): UserProfile {
  const current = getUserProfile()
  const updated: UserProfile = {
    ...current,
    ...patch,
    currentAge: patch.dob
      ? calculateAgeFromDob(patch.dob)
      : (patch.currentAge ?? current.currentAge),
  }
  saveUserProfile(updated, syncToCalculators)
  return updated
}

/**
 * Resets user profile back to system defaults.
 */
export function resetUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE
  try {
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY)
    const defaults = { ...DEFAULT_USER_PROFILE }
    profileListeners.forEach((fn) => fn(defaults))
    window.dispatchEvent(new CustomEvent('fundcalc_user_profile_updated', { detail: defaults }))
    return defaults
  } catch {
    return DEFAULT_USER_PROFILE
  }
}

/**
 * Subscribes to user profile changes. Returns an unsubscribe cleanup function.
 */
export function onUserProfileChange(callback: ProfileChangeListener): () => void {
  profileListeners.add(callback)
  return () => {
    profileListeners.delete(callback)
  }
}

/**
 * React hook for consuming and updating the global user profile.
 */
export function useUserProfile() {
  const [profile, setProfileState] = useState<UserProfile>(getUserProfile)

  useEffect(() => {
    // Initial fetch in case of hydration
    setProfileState(getUserProfile())

    const unsubscribe = onUserProfileChange((updated) => {
      setProfileState(updated)
    })

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === USER_PROFILE_STORAGE_KEY && e.newValue) {
        try {
          setProfileState(JSON.parse(e.newValue))
        } catch {
          // Ignore
        }
      }
    }

    window.addEventListener('storage', handleStorageEvent)
    return () => {
      unsubscribe()
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [])

  const update = useCallback((patch: Partial<UserProfile>, syncToCalculators: boolean = false) => {
    return updateUserProfile(patch, syncToCalculators)
  }, [])

  const reset = useCallback(() => {
    return resetUserProfile()
  }, [])

  return {
    profile,
    updateProfile: update,
    resetProfile: reset,
    isConfigured: profile.isConfigured,
  }
}

// ==========================================
// Calculator Defaults Derivation & Sync
// ==========================================

/**
 * Derives SIP calculator inputs from the user profile.
 */
export function deriveSipInputsFromProfile(
  profile: UserProfile,
  currentData?: StoredSipData
): StoredSipData {
  const existing = currentData || getStoredSipInputs()
  const workYears = Math.max(1, Math.min(50, profile.retirementAge - profile.currentAge))
  const retirementYears = Math.max(1, Math.min(50, profile.targetAge - profile.retirementAge))

  return {
    ...existing,
    sip: {
      ...existing.sip,
      monthlyInvestment:
        profile.monthlySipInvestment > 0
          ? profile.monthlySipInvestment
          : existing.sip.monthlyInvestment,
      annualReturnRate:
        profile.expectedEquityReturn > 0
          ? profile.expectedEquityReturn
          : existing.sip.annualReturnRate,
      timeHorizonYears: workYears > 0 ? workYears : existing.sip.timeHorizonYears,
      taxRatePercent: profile.ltcgTaxRate,
      inflationRatePercent: profile.overallInflationRate,
    },
    swp: {
      ...existing.swp,
      initialInvestment:
        profile.existingInvestableCorpus > 0
          ? profile.existingInvestableCorpus
          : existing.swp.initialInvestment,
      annualReturnRate:
        profile.expectedDebtReturn > 0 ? profile.expectedDebtReturn : existing.swp.annualReturnRate,
      timeHorizonYears: retirementYears > 0 ? retirementYears : existing.swp.timeHorizonYears,
      inflationRatePercent: profile.overallInflationRate,
    },
    combo: {
      ...existing.combo,
      currentAge: profile.currentAge,
      retirementAge: profile.retirementAge,
      targetAge: profile.targetAge,
      monthlySip:
        profile.monthlySipInvestment > 0 ? profile.monthlySipInvestment : existing.combo.monthlySip,
      monthlySwp:
        profile.monthlyIncome > 0
          ? Math.round(profile.monthlyIncome * 0.5)
          : existing.combo.monthlySwp,
      sipReturnRate:
        profile.expectedEquityReturn > 0
          ? profile.expectedEquityReturn
          : existing.combo.sipReturnRate,
      swpReturnRate:
        profile.expectedDebtReturn > 0 ? profile.expectedDebtReturn : existing.combo.swpReturnRate,
      inflationRatePercent: profile.overallInflationRate,
      taxRatePercent: profile.ltcgTaxRate,
    },
  }
}

/**
 * Derives Investment calculator inputs from the user profile.
 */
export function deriveInvestmentInputsFromProfile(profile: UserProfile) {
  const existing = getStoredInvestmentInputs()
  const horizon = Math.max(1, Math.min(50, profile.retirementAge - profile.currentAge))

  return {
    ...existing,
    initialInvestment:
      profile.existingInvestableCorpus > 0
        ? profile.existingInvestableCorpus
        : existing.initialInvestment,
    timeHorizonYears: horizon > 0 ? horizon : existing.timeHorizonYears,
    simpleReturnRate:
      profile.expectedEquityReturn > 0 ? profile.expectedEquityReturn : existing.simpleReturnRate,
    simpleTaxRate: profile.ltcgTaxRate,
    inflationRatePercent: profile.overallInflationRate,
    allocations: existing.allocations.map((a) => {
      if (a.id === 'equity') {
        return {
          ...a,
          expectedReturnRate: profile.expectedEquityReturn,
          taxRatePercent: profile.ltcgTaxRate,
        }
      }
      if (a.id === 'debt') {
        return {
          ...a,
          expectedReturnRate: profile.expectedDebtReturn,
        }
      }
      return a
    }),
  }
}

/**
 * Derives FD calculator inputs from the user profile.
 */
export function deriveFdInputsFromProfile(profile: UserProfile) {
  const existing = getStoredFdInputs()
  const isSeniorCitizen = profile.currentAge >= 60

  return {
    ...existing,
    annualInterestRate:
      profile.fdInterestRate > 0 ? profile.fdInterestRate : existing.annualInterestRate,
    isSeniorCitizen,
    taxSlabRatePercent: profile.incomeTaxBracket,
    inflationRatePercent: profile.overallInflationRate,
  }
}

/**
 * Derives Loan EMI calculator inputs from the user profile.
 */
export function deriveLoanEmiInputsFromProfile(profile: UserProfile) {
  const existing = getStoredLoanEmiInputs()

  return {
    ...existing,
    annualInterestRate:
      profile.loanInterestRate > 0 ? profile.loanInterestRate : existing.annualInterestRate,
    taxRegime: profile.taxRegime,
    taxSlabPercent: profile.incomeTaxBracket,
    inflationRatePercent: profile.overallInflationRate,
  }
}

/**
 * Synchronizes the saved profile defaults to all 4 helper calculator storages.
 */
export function syncProfileToCalculators(profile: UserProfile): void {
  try {
    saveStoredSipInputs(deriveSipInputsFromProfile(profile))
    saveStoredInvestmentInputs(deriveInvestmentInputsFromProfile(profile))
    saveStoredFdInputs(deriveFdInputsFromProfile(profile))
    saveStoredLoanEmiInputs(deriveLoanEmiInputsFromProfile(profile))
  } catch (err) {
    console.error('Error synchronizing profile defaults to calculators:', err)
  }
}
