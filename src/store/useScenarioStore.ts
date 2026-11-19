import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/domain/models/profile'
import type { HouseholdMember } from '@/domain/models/household'
import type { ExpenseCategory, ExpenseItem, CategoryId } from '@/domain/models/expense'
import type { Assumptions } from '@/domain/models/assumptions'
import type { Assets, OtherIncome, FutureLumpSum } from '@/domain/models/assets'
import type { CalculationResults } from '@/domain/models/results'
import { DEFAULT_PROFILE } from '@/domain/models/profile'
import { DEFAULT_ASSUMPTIONS } from '@/domain/models/assumptions'
import { DEFAULT_ASSETS } from '@/domain/models/assets'
import { buildCategoriesForProfile } from '@/domain/calculations/areaDefaults'
import { runScenarios } from '@/domain/calculations/runScenarios'
import { getStoredSettings, updateStoredSettings, clearStoredSettings } from '@/lib/settingsStorage'

interface ScenarioState {
  // Data
  profile: Profile
  members: HouseholdMember[]
  categories: ExpenseCategory[]
  assumptions: Assumptions
  assets: Assets
  results: CalculationResults | null

  // Wizard
  currentStep: number
  totalSteps: number

  // Universal field updater for config-driven inputs
  setStepFieldValue: (stepKey: string, fieldId: string, value: any) => void

  // Profile actions
  setProfile: (p: Partial<Profile>) => void

  // Member actions
  addMember: (m: HouseholdMember) => void
  updateMember: (id: string, patch: Partial<HouseholdMember>) => void
  removeMember: (id: string) => void

  // Category / expense actions
  updateCategory: (id: CategoryId, patch: Partial<ExpenseCategory>) => void
  addExpenseItem: (categoryId: CategoryId, item: ExpenseItem) => void
  updateExpenseItem: (categoryId: CategoryId, itemId: string, patch: Partial<ExpenseItem>) => void
  removeExpenseItem: (categoryId: CategoryId, itemId: string) => void
  recalibrateCategories: () => void

  // Assumption / asset actions
  setAssumptions: (a: Partial<Assumptions>) => void
  setAssets: (a: Partial<Assets>) => void
  addOtherIncome: (income: OtherIncome) => void
  updateOtherIncome: (id: string, patch: Partial<OtherIncome>) => void
  removeOtherIncome: (id: string) => void
  addLumpSum: (ls: FutureLumpSum) => void
  updateLumpSum: (id: string, patch: Partial<FutureLumpSum>) => void
  removeLumpSum: (id: string) => void

  // Results
  setResults: (r: CalculationResults) => void
  selectLifestylePlan: (lifestyle: 'bare_minimum' | 'comfortable' | 'luxury') => void

  // Navigation
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Reset
  reset: () => void
}

const initialSelf: HouseholdMember = {
  id: 'self',
  label: 'Self',
  relationship: 'self',
  age: DEFAULT_PROFILE.currentAge,
  financiallyDependent: true,
  hasHealthInsurance: false,
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      members: [initialSelf],
      categories: buildCategoriesForProfile(DEFAULT_PROFILE.areaType, DEFAULT_PROFILE.lifestyleScenario, [initialSelf]),
      assumptions: DEFAULT_ASSUMPTIONS,
      assets: DEFAULT_ASSETS,
      results: null,
      currentStep: getStoredSettings().currentStep || 1,
      totalSteps: 6,

      setStepFieldValue: (stepKey, fieldId, value) => {
        if (stepKey === 'profile') {
          set(s => {
            const updatedProfile = { ...s.profile, [fieldId]: value }
            // Auto update member age if currentAge changes
            let updatedMembers = s.members
            if (fieldId === 'currentAge') {
              updatedMembers = s.members.map(m =>
                m.id === 'self' ? { ...m, age: Number(value) } : m,
              )
            }

            // Auto calibrate categories if areaType or lifestyleScenario changes
            let updatedCategories = s.categories
            if (fieldId === 'areaType' || fieldId === 'lifestyleScenario') {
              updatedCategories = buildCategoriesForProfile(
                updatedProfile.areaType,
                updatedProfile.lifestyleScenario,
                updatedMembers,
              )
            }

            return {
              profile: updatedProfile,
              members: updatedMembers,
              categories: updatedCategories,
            }
          })
        } else if (stepKey === 'household') {
          if (fieldId === 'members') {
            const newMembers = value as HouseholdMember[]
            const { profile } = get()
            set({
              members: newMembers,
              categories: buildCategoriesForProfile(profile.areaType, profile.lifestyleScenario, newMembers),
            })
          }
        } else if (stepKey === 'assumptions') {
          set(s => ({ assumptions: { ...s.assumptions, [fieldId]: value } }))
        } else if (stepKey === 'assets') {
          set(s => ({ assets: { ...s.assets, [fieldId]: value } }))
        }
      },

      setProfile: p =>
        set(s => {
          const updatedProfile = { ...s.profile, ...p }
          let updatedCategories = s.categories
          if (p.areaType || p.lifestyleScenario) {
            updatedCategories = buildCategoriesForProfile(
              updatedProfile.areaType,
              updatedProfile.lifestyleScenario,
              s.members,
            )
          }
          return { profile: updatedProfile, categories: updatedCategories }
        }),

      recalibrateCategories: () => {
        const { profile, members } = get()
        set({
          categories: buildCategoriesForProfile(profile.areaType, profile.lifestyleScenario, members),
        })
      },

      addMember: m =>
        set(s => {
          const nextMembers = [...s.members, m]
          return {
            members: nextMembers,
            categories: buildCategoriesForProfile(s.profile.areaType, s.profile.lifestyleScenario, nextMembers),
          }
        }),

      updateMember: (id, patch) =>
        set(s => {
          const nextMembers = s.members.map(m => (m.id === id ? { ...m, ...patch } : m))
          return {
            members: nextMembers,
            categories: buildCategoriesForProfile(s.profile.areaType, s.profile.lifestyleScenario, nextMembers),
          }
        }),

      removeMember: id =>
        set(s => {
          const nextMembers = s.members.filter(m => m.id !== id)
          return {
            members: nextMembers,
            categories: buildCategoriesForProfile(s.profile.areaType, s.profile.lifestyleScenario, nextMembers),
          }
        }),

      updateCategory: (id, patch) =>
        set(s => ({
          categories: s.categories.map(c => (c.id === id ? { ...c, ...patch } : c)),
        })),
      addExpenseItem: (categoryId, item) =>
        set(s => ({
          categories: s.categories.map(c =>
            c.id === categoryId ? { ...c, items: [...c.items, item] } : c,
          ),
        })),
      updateExpenseItem: (categoryId, itemId, patch) =>
        set(s => ({
          categories: s.categories.map(c =>
            c.id === categoryId
              ? {
                  ...c,
                  items: c.items.map(i => (i.id === itemId ? { ...i, ...patch } : i)),
                }
              : c,
          ),
        })),
      removeExpenseItem: (categoryId, itemId) =>
        set(s => ({
          categories: s.categories.map(c =>
            c.id === categoryId
              ? { ...c, items: c.items.filter(i => i.id !== itemId) }
              : c,
          ),
        })),

      setAssumptions: a =>
        set(s => ({ assumptions: { ...s.assumptions, ...a } })),
      setAssets: a =>
        set(s => ({ assets: { ...s.assets, ...a } })),
      addOtherIncome: income =>
        set(s => ({ assets: { ...s.assets, otherIncome: [...s.assets.otherIncome, income] } })),
      updateOtherIncome: (id, patch) =>
        set(s => ({
          assets: {
            ...s.assets,
            otherIncome: s.assets.otherIncome.map(i => (i.id === id ? { ...i, ...patch } : i)),
          },
        })),
      removeOtherIncome: id =>
        set(s => ({
          assets: { ...s.assets, otherIncome: s.assets.otherIncome.filter(i => i.id !== id) },
        })),
      addLumpSum: ls =>
        set(s => ({
          assets: { ...s.assets, futureContributions: [...s.assets.futureContributions, ls] },
        })),
      updateLumpSum: (id, patch) =>
        set(s => ({
          assets: {
            ...s.assets,
            futureContributions: s.assets.futureContributions.map(l =>
              l.id === id ? { ...l, ...patch } : l,
            ),
          },
        })),
      removeLumpSum: id =>
        set(s => ({
          assets: {
            ...s.assets,
            futureContributions: s.assets.futureContributions.filter(l => l.id !== id),
          },
        })),

      setResults: r => set({ results: r }),

      selectLifestylePlan: (lifestyle) => {
        const { profile, members, categories, assumptions, assets } = get()
        const updatedProfile: Profile = { ...profile, lifestyleScenario: lifestyle }

        // Derive updated categories for this lifestyle
        let updatedCategories: ExpenseCategory[]
        const comfortableDefaults = buildCategoriesForProfile(profile.areaType, 'comfortable', members)

        if (lifestyle === 'bare_minimum') {
          // Keep essentials, reduce discretionary to 0 (skipped)
          updatedCategories = categories.map(cat => {
            if (cat.parentAmount != null && cat.parentFrequency) {
              return {
                ...cat,
                parentAmount: Math.round(cat.parentAmount * 0.65),
              }
            }
            return {
              ...cat,
              items: cat.items.map(it => (it.essential ? it : { ...it, amount: 0, skipped: true })),
            }
          })
        } else if (lifestyle === 'luxury') {
          // Derive from comfortable baseline
          let baseCategories = categories
          if (profile.lifestyleScenario === 'bare_minimum') {
            baseCategories = comfortableDefaults.map(cat => {
              const currentCat = categories.find(c => c.id === cat.id)
              if (!currentCat) return cat
              return {
                ...cat,
                items: cat.items.map(defItem => {
                  const currentItem = currentCat.items.find(ci => ci.name === defItem.name)
                  if (currentItem && currentItem.essential && currentItem.amount > 0) {
                    return { ...defItem, amount: currentItem.amount }
                  }
                  return defItem
                }),
              }
            })
          }

          updatedCategories = baseCategories.map(cat => {
            if (cat.parentAmount != null && cat.parentFrequency) {
              return {
                ...cat,
                parentAmount: Math.round(cat.parentAmount * 1.4),
              }
            }
            return {
              ...cat,
              items: cat.items.map(it => ({
                ...it,
                skipped: false,
                amount: it.essential ? Math.round(it.amount * 1.15) : Math.round(it.amount * 1.5),
              })),
            }
          })
        } else {
          // 'comfortable'
          if (profile.lifestyleScenario === 'bare_minimum') {
            // Restore comfortable defaults for non-essential items while preserving any user-entered essentials
            updatedCategories = comfortableDefaults.map(cat => {
              const currentCat = categories.find(c => c.id === cat.id)
              if (!currentCat) return cat
              if (currentCat.parentAmount != null && currentCat.parentFrequency) {
                return { ...cat, parentAmount: Math.round(currentCat.parentAmount / 0.65) }
              }
              return {
                ...cat,
                items: cat.items.map(defItem => {
                  const currentItem = currentCat.items.find(ci => ci.name === defItem.name)
                  if (currentItem && currentItem.essential && currentItem.amount > 0) {
                    return { ...defItem, amount: currentItem.amount }
                  }
                  return { ...defItem, skipped: false }
                }),
              }
            })
          } else if (profile.lifestyleScenario === 'luxury') {
            // Unscale back to comfortable
            updatedCategories = categories.map(cat => {
              if (cat.parentAmount != null && cat.parentFrequency) {
                return { ...cat, parentAmount: Math.round(cat.parentAmount / 1.4) }
              }
              return {
                ...cat,
                items: cat.items.map(it => ({
                  ...it,
                  amount: it.essential ? Math.round(it.amount / 1.15) : Math.round(it.amount / 1.5),
                })),
              }
            })
          } else {
            updatedCategories = categories
          }
        }

        // Recalculate full scenario results immediately
        const newResults = runScenarios({
          profile: updatedProfile,
          members,
          categories: updatedCategories,
          assumptions,
          assets,
        })

        set({
          profile: updatedProfile,
          categories: updatedCategories,
          results: newResults,
        })
      },

      goToStep: step => {
        const { totalSteps } = get()
        if (step >= 1 && step <= totalSteps) {
          updateStoredSettings({ currentStep: step })
          set({ currentStep: step })
        }
      },
      nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps) {
          const next = currentStep + 1
          updateStoredSettings({ currentStep: next })
          set({ currentStep: next })
        }
      },
      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          const prev = currentStep - 1
          updateStoredSettings({ currentStep: prev })
          set({ currentStep: prev })
        }
      },

      reset: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('corpus-calc-v1')
        }
        clearStoredSettings()
        set({
          profile: DEFAULT_PROFILE,
          members: [{ ...initialSelf, age: DEFAULT_PROFILE.currentAge }],
          categories: buildCategoriesForProfile(DEFAULT_PROFILE.areaType, DEFAULT_PROFILE.lifestyleScenario, [initialSelf]),
          assumptions: DEFAULT_ASSUMPTIONS,
          assets: DEFAULT_ASSETS,
          results: null,
          currentStep: 1,
        })
      },
    }),
    { name: 'corpus-calc-v1' },
  ),
)
