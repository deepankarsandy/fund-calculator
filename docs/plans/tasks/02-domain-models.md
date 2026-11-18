# Task 02 — Domain Models & TypeScript Types

**Phase:** 1 — Domain layer  
**Depends on:** Task 01  
**Blocks:** Tasks 03, 04, 05

---

## Goal
Define all TypeScript interfaces and types used across the app. These are **pure data shapes** — no logic, no React imports.

---

## Files to Create

### `src/domain/models/profile.ts`
```ts
export type LifestyleScenario = 'bare_minimum' | 'comfortable' | 'custom'
export type WithdrawalTiming = 'beginning_of_year' | 'end_of_year'
export type InflationMode = 'simple' | 'category' | 'item'
export type ReturnBasis = 'gross' | 'net'

export interface Profile {
  country: string            // default 'India'
  region: string             // e.g. 'Odisha'
  city: string
  currency: string           // default 'INR'
  currentAge: number
  targetAge: number
  householdSize: number
  lifestyleScenario: LifestyleScenario
}

export const DEFAULT_PROFILE: Profile = {
  country: 'India',
  region: '',
  city: '',
  currency: 'INR',
  currentAge: 30,
  targetAge: 85,
  householdSize: 1,
  lifestyleScenario: 'comfortable',
}
```

### `src/domain/models/household.ts`
```ts
export type Relationship = 'self' | 'spouse' | 'parent' | 'child' | 'sibling' | 'other'

export interface HouseholdMember {
  id: string
  label: string
  relationship: Relationship
  age: number
  financiallyDependent: boolean
  supportUntilAge?: number
  hasHealthInsurance: boolean
}
```

### `src/domain/models/expense.ts`
```ts
export type Frequency =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly'
  | 'every_n_years'
  | 'one_time'

export type ExpenseType = 'recurring' | 'one_time' | 'periodic'

export type CategoryId =
  | 'housing'
  | 'food'
  | 'utilities'
  | 'transport'
  | 'healthcare'
  | 'personal'
  | 'technology'
  | 'family'
  | 'financial'
  | 'emergency'
  | 'custom'

export interface ExpenseItem {
  id: string
  categoryId: CategoryId
  parentId?: string          // set when this is a sub-item
  name: string
  amount: number
  frequency: Frequency
  everyNYears?: number       // only for 'every_n_years'
  essential: boolean
  appliesTo: 'household' | string[]  // 'household' or array of member IDs
  inflationRate?: number     // overrides category default if set
  startYear: number          // 1 = first planning year
  endYear?: number
  type: ExpenseType
  notes: string
  skipped: boolean
}

export interface ExpenseCategory {
  id: CategoryId
  label: string              // display name e.g. 'A. Housing & Property'
  description: string        // help text shown in UI
  defaultInflationRate: number
  items: ExpenseItem[]
  // Parent-level shortcut: if set, sub-items are ignored
  parentAmount?: number
  parentFrequency?: Frequency
  skipped: boolean
}

export const FREQUENCY_MULTIPLIERS: Record<Frequency, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  half_yearly: 2,
  yearly: 1,
  every_n_years: 0,  // handled separately
  one_time: 0,       // handled separately
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half-Yearly',
  yearly: 'Yearly',
  every_n_years: 'Every N Years',
  one_time: 'One-Time',
}
```

### `src/domain/models/assumptions.ts`
```ts
import type { WithdrawalTiming, InflationMode, ReturnBasis } from './profile'

export interface Assumptions {
  globalInflationRate: number          // decimal e.g. 0.05
  inflationMode: InflationMode
  annualInvestmentReturn: number       // decimal e.g. 0.07
  returnBasis: ReturnBasis
  investmentFeeRate: number            // decimal; used only if gross
  taxDragRate: number                  // decimal
  compoundingFrequency: 'annual' | 'monthly'
  withdrawalTiming: WithdrawalTiming
  safetyMarginPercent: number          // decimal e.g. 0.15
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  globalInflationRate: 0.05,
  inflationMode: 'simple',
  annualInvestmentReturn: 0.07,
  returnBasis: 'net',
  investmentFeeRate: 0,
  taxDragRate: 0,
  compoundingFrequency: 'annual',
  withdrawalTiming: 'end_of_year',
  safetyMarginPercent: 0.15,
}

// Preset scenario overrides
export const SCENARIO_PRESETS = {
  optimistic:   { globalInflationRate: 0.04, annualInvestmentReturn: 0.07 },
  base:         { globalInflationRate: 0.05, annualInvestmentReturn: 0.07 },
  conservative: { globalInflationRate: 0.06, annualInvestmentReturn: 0.07 },
} as const
```

### `src/domain/models/assets.ts`
```ts
export interface OtherIncome {
  id: string
  label: string              // e.g. 'Pension', 'Rental income'
  annualAmount: number
  startYear: number          // 1-based planning year
  endYear?: number
  inflationLinked: boolean
}

export interface FutureLumpSum {
  id: string
  label: string
  amount: number
  year: number               // 1-based planning year
}

export interface Assets {
  existingInvestableCorpus: number
  futureContributions: FutureLumpSum[]
  otherIncome: OtherIncome[]
}

export const DEFAULT_ASSETS: Assets = {
  existingInvestableCorpus: 0,
  futureContributions: [],
  otherIncome: [],
}
```

### `src/domain/models/results.ts`
```ts
export interface YearProjection {
  year: number               // planning year (1-based)
  age: number
  expenses: number
  otherIncome: number
  netWithdrawal: number
  investmentGrowth: number
  openingCorpus: number
  closingCorpus: number
}

export interface ScenarioResult {
  label: string              // 'Optimistic' | 'Base' | 'Conservative'
  inflationRate: number
  returnRate: number
  currentAnnualExpense: number
  currentMonthlyEquivalent: number
  essentialAnnualExpense: number
  discretionaryAnnualExpense: number
  requiredCorpus: number
  existingCorpus: number
  fundingGap: number
  safetyMarginAmount: number
  corpusWithSafetyMargin: number
  yearProjections: YearProjection[]
}

export interface CalculationResults {
  scenarios: ScenarioResult[]
  warnings: string[]
  calculatedAt: string       // ISO timestamp
}
```

### `src/domain/models/index.ts`
Re-export everything from one barrel file.

---

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No circular imports between model files
- [ ] `DEFAULT_PROFILE`, `DEFAULT_ASSUMPTIONS`, `DEFAULT_ASSETS` exported
- [ ] `FREQUENCY_MULTIPLIERS` and `FREQUENCY_LABELS` exported from `expense.ts`
