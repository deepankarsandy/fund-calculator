# Task 05 — Wizard Shell & Zustand Store

**Phase:** 2 — Wizard UI  
**Depends on:** Tasks 02, 03, 04  
**Blocks:** Tasks 06–10

---

## Goal
Build the top-level wizard container with a progress bar, step navigation, and all Zustand store slices. The wizard renders one step at a time and allows forward/back navigation.

---

## Zustand Store

### `src/store/useScenarioStore.ts`
Single unified store with all slices:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/domain/models/profile'
import type { HouseholdMember } from '@/domain/models/household'
import type { ExpenseCategory } from '@/domain/models/expense'
import type { Assumptions } from '@/domain/models/assumptions'
import type { Assets } from '@/domain/models/assets'
import type { CalculationResults } from '@/domain/models/results'
import { DEFAULT_PROFILE } from '@/domain/models/profile'
import { DEFAULT_ASSUMPTIONS } from '@/domain/models/assumptions'
import { DEFAULT_ASSETS } from '@/domain/models/assets'
import { DEFAULT_CATEGORIES } from '@/domain/data/defaultCategories'  // Task 08

interface ScenarioState {
  // Data
  profile: Profile
  members: HouseholdMember[]
  categories: ExpenseCategory[]
  assumptions: Assumptions
  assets: Assets
  results: CalculationResults | null

  // Wizard navigation
  currentStep: number
  totalSteps: number

  // Actions
  setProfile: (p: Partial<Profile>) => void
  addMember: (m: HouseholdMember) => void
  updateMember: (id: string, m: Partial<HouseholdMember>) => void
  removeMember: (id: string) => void
  updateCategory: (id: string, patch: Partial<ExpenseCategory>) => void
  updateExpenseItem: (categoryId: string, itemId: string, patch: object) => void
  setAssumptions: (a: Partial<Assumptions>) => void
  setAssets: (a: Partial<Assets>) => void
  setResults: (r: CalculationResults) => void
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}
```

Persist to `localStorage` with key `'corpus-calc-v1'`.

---

## Wizard Shell Component

### `src/components/wizard/WizardShell.tsx`
- Renders a sticky top progress bar: `Step X of 6 — [Step Name]`
- Progress bar fills proportionally to `currentStep / totalSteps`
- Shows back/next buttons at the bottom; "Back" hidden on step 1
- "Next" on last step (Assumptions / Assets) becomes "Calculate" and triggers `runScenarios()`
- Renders one step component based on `currentStep`

```tsx
const STEPS = [
  { id: 1, label: 'Profile',      icon: User },
  { id: 2, label: 'Household',    icon: Users },
  { id: 3, label: 'Expenses',     icon: Receipt },
  { id: 4, label: 'Assumptions',  icon: Settings2 },
  { id: 5, label: 'Assets',       icon: Landmark },
  { id: 6, label: 'Results',      icon: BarChart2 },
]
```

### `src/components/wizard/StepHeader.tsx`
Renders a title + subtitle + optional "Skip this step" link for the current step.

### `src/components/wizard/WizardProgress.tsx`
Step indicator with circles + connecting lines. Active step highlighted. Completed steps show a tick. Clicking a past step navigates back.

---

## Layout

### `src/pages/WizardPage.tsx`
Full-page layout:
```
┌─────────────────────────────────┐
│  Progress Bar (sticky top)      │
├─────────────────────────────────┤
│                                 │
│  Step Content (scrollable)      │
│                                 │
├─────────────────────────────────┤
│  Back · · · · · · · · · Next   │
└─────────────────────────────────┘
```

On mobile: progress bar collapses to `Step X of 6`. Bottom nav stacks vertically.

---

## Routing

### `src/App.tsx`
```tsx
// Simple hash-based routing — no react-router needed for MVP
// WizardPage handles all 6 steps internally via store
```

---

## Acceptance Criteria
- [ ] Wizard renders step 1 on load
- [ ] "Next" button advances to step 2
- [ ] "Back" button goes back to step 1; hidden on step 1
- [ ] Progress bar accurately reflects current step
- [ ] Clicking a completed step circle navigates to it
- [ ] Store persists to localStorage (refresh doesn't lose data)
- [ ] "Reset" clears localStorage and returns to step 1
