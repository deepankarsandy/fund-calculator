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
import { DEFAULT_CATEGORIES } from '@/domain/data/defaultCategories'

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
  financiallyDependent: false,
  hasHealthInsurance: false,
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      members: [initialSelf],
      categories: DEFAULT_CATEGORIES,
      assumptions: DEFAULT_ASSUMPTIONS,
      assets: DEFAULT_ASSETS,
      results: null,
      currentStep: 1,
      totalSteps: 6,

      setProfile: p =>
        set(s => ({ profile: { ...s.profile, ...p } })),

      addMember: m =>
        set(s => ({ members: [...s.members, m] })),
      updateMember: (id, patch) =>
        set(s => ({
          members: s.members.map(m => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMember: id =>
        set(s => ({ members: s.members.filter(m => m.id !== id) })),

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

      goToStep: step => {
        const { totalSteps } = get()
        if (step >= 1 && step <= totalSteps) set({ currentStep: step })
      },
      nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps) set({ currentStep: currentStep + 1 })
      },
      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) set({ currentStep: currentStep - 1 })
      },

      reset: () =>
        set({
          profile: DEFAULT_PROFILE,
          members: [initialSelf],
          categories: DEFAULT_CATEGORIES,
          assumptions: DEFAULT_ASSUMPTIONS,
          assets: DEFAULT_ASSETS,
          results: null,
          currentStep: 1,
        }),
    }),
    { name: 'corpus-calc-v1' },
  ),
)
