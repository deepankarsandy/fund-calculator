export interface AppSettings {
  currentStep: number
  expandedCategories: string[]
  lastFilledId?: string
  lastFilledStep?: number
}

export const SETTINGS_STORAGE_KEY = 'corpus-calc-settings'

const DEFAULT_SETTINGS: AppSettings = {
  currentStep: 1,
  expandedCategories: ['housing', 'food', 'healthcare'],
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        currentStep:
          typeof parsed.currentStep === 'number' &&
          parsed.currentStep >= 1 &&
          parsed.currentStep <= 6
            ? parsed.currentStep
            : 1,
        expandedCategories: Array.isArray(parsed.expandedCategories)
          ? parsed.expandedCategories
          : ['housing', 'food', 'healthcare'],
        lastFilledId: typeof parsed.lastFilledId === 'string' ? parsed.lastFilledId : undefined,
        lastFilledStep:
          typeof parsed.lastFilledStep === 'number' ? parsed.lastFilledStep : undefined,
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_SETTINGS
}

export function updateStoredSettings(patch: Partial<AppSettings>): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const current = getStoredSettings()
    const updated: AppSettings = { ...current, ...patch }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return getStoredSettings()
  }
}

export function setLastFilled(id: string, step?: number): void {
  updateStoredSettings({ lastFilledId: id, lastFilledStep: step })
}

export function clearStoredSettings(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
  } catch {
    // Ignore
  }
}
