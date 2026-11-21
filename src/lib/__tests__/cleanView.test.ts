import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  CLEAN_VIEW_STORAGE_KEY,
  getSavedCleanView,
  saveCleanView,
  applyCleanViewClass,
} from '../cleanView'
import { getUserProfile, saveUserProfile, resetUserProfile } from '../userProfileStorage'

const memoryStore = new Map<string, string>()

const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => memoryStore.set(key, value),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('cleanView logic', () => {
  beforeEach(() => {
    memoryStore.clear()
    document.documentElement.classList.remove('clean-view')
    resetUserProfile()
  })

  afterEach(() => {
    memoryStore.clear()
    document.documentElement.classList.remove('clean-view')
    resetUserProfile()
  })

  it('defaults to false when no setting or profile is stored', () => {
    expect(getSavedCleanView()).toBe(false)
    expect(document.documentElement.classList.contains('clean-view')).toBe(false)
  })

  it('applies clean-view class to documentElement correctly', () => {
    applyCleanViewClass(true)
    expect(document.documentElement.classList.contains('clean-view')).toBe(true)

    applyCleanViewClass(false)
    expect(document.documentElement.classList.contains('clean-view')).toBe(false)
  })

  it('saves clean view state to localStorage and updates documentElement class', () => {
    saveCleanView(true)
    expect(mockLocalStorage.getItem(CLEAN_VIEW_STORAGE_KEY)).toBe('true')
    expect(getSavedCleanView()).toBe(true)
    expect(document.documentElement.classList.contains('clean-view')).toBe(true)

    saveCleanView(false)
    expect(mockLocalStorage.getItem(CLEAN_VIEW_STORAGE_KEY)).toBe('false')
    expect(getSavedCleanView()).toBe(false)
    expect(document.documentElement.classList.contains('clean-view')).toBe(false)
  })

  it('synchronizes clean view state with user profile', () => {
    saveCleanView(true, true)
    const profile = getUserProfile()
    expect(profile.cleanView).toBe(true)

    // Save profile with cleanView false
    saveUserProfile({ ...profile, cleanView: false })
    expect(mockLocalStorage.getItem(CLEAN_VIEW_STORAGE_KEY)).toBe('false')
    expect(document.documentElement.classList.contains('clean-view')).toBe(false)
  })
})
