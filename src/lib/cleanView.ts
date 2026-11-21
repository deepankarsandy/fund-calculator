import { useState, useEffect, useCallback } from 'react'
import { getUserProfile, updateUserProfile } from './userProfileStorage'

export const CLEAN_VIEW_STORAGE_KEY = 'corpus_clean_view'

export function getSavedCleanView(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const saved = localStorage.getItem(CLEAN_VIEW_STORAGE_KEY)
    if (saved !== null) {
      return saved === 'true'
    }
    // Check user profile fallback if stored
    const profile = getUserProfile()
    if (typeof profile.cleanView === 'boolean') {
      return profile.cleanView
    }
  } catch {
    // Ignore storage errors
  }
  return false
}

export function applyCleanViewClass(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) {
    document.documentElement.classList.add('clean-view')
  } else {
    document.documentElement.classList.remove('clean-view')
  }
}

export function saveCleanView(enabled: boolean, syncToProfile: boolean = true): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLEAN_VIEW_STORAGE_KEY, String(enabled))
    applyCleanViewClass(enabled)
    window.dispatchEvent(
      new CustomEvent('corpus_clean_view_updated', { detail: { cleanView: enabled } })
    )

    if (syncToProfile) {
      const profile = getUserProfile()
      if (profile.cleanView !== enabled) {
        updateUserProfile({ cleanView: enabled }, false)
      }
    }
  } catch {
    // Ignore storage errors
  }
}

export function useCleanView() {
  const [isCleanView, setIsCleanViewState] = useState<boolean>(() => getSavedCleanView())

  useEffect(() => {
    // Ensure the document element class matches initial state
    applyCleanViewClass(isCleanView)

    const handleCleanViewEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ cleanView: boolean }>
      if (customEvent.detail && typeof customEvent.detail.cleanView === 'boolean') {
        setIsCleanViewState(customEvent.detail.cleanView)
        applyCleanViewClass(customEvent.detail.cleanView)
      }
    }

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      if (customEvent.detail && typeof customEvent.detail.cleanView === 'boolean') {
        setIsCleanViewState(customEvent.detail.cleanView)
        applyCleanViewClass(customEvent.detail.cleanView)
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CLEAN_VIEW_STORAGE_KEY && e.newValue !== null) {
        const val = e.newValue === 'true'
        setIsCleanViewState(val)
        applyCleanViewClass(val)
      }
    }

    window.addEventListener('corpus_clean_view_updated', handleCleanViewEvent)
    window.addEventListener('fundcalc_user_profile_updated', handleProfileUpdate)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('corpus_clean_view_updated', handleCleanViewEvent)
      window.removeEventListener('fundcalc_user_profile_updated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [isCleanView])

  const setCleanView = useCallback((val: boolean) => {
    setIsCleanViewState(val)
    saveCleanView(val, true)
  }, [])

  const toggleCleanView = useCallback(() => {
    setIsCleanViewState((prev) => {
      const next = !prev
      saveCleanView(next, true)
      return next
    })
  }, [])

  return { isCleanView, setCleanView, toggleCleanView }
}
