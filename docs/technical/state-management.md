# State Management Architecture (`useScenarioStore`)

State management in the application is managed via a centralized Zustand store (`src/store/useScenarioStore.ts`) equipped with `localStorage` persistence.

---

## State Schema (`ScenarioState`)

```ts
interface ScenarioState {
  // Financial State Slices
  profile: Profile
  members: HouseholdMember[]
  categories: ExpenseCategory[]
  assumptions: Assumptions
  assets: Assets
  results: CalculationResults | null

  // Wizard Navigation
  currentStep: number
  totalSteps: number

  // Universal Field Setter
  setStepFieldValue: (stepKey: string, fieldId: string, value: any) => void

  // Domain Actions
  setProfile: (p: Partial<Profile>) => void
  addMember: (m: HouseholdMember) => void
  updateMember: (id: string, patch: Partial<HouseholdMember>) => void
  removeMember: (id: string) => void
  updateCategory: (id: CategoryId, patch: Partial<ExpenseCategory>) => void
  addExpenseItem: (categoryId: CategoryId, item: ExpenseItem) => void
  updateExpenseItem: (categoryId: CategoryId, itemId: string, patch: Partial<ExpenseItem>) => void
  removeExpenseItem: (categoryId: CategoryId, itemId: string) => void
  recalibrateCategories: () => void
  setAssumptions: (a: Partial<Assumptions>) => void
  setAssets: (a: Partial<Assets>) => void
  addOtherIncome: (income: OtherIncome) => void
  updateOtherIncome: (id: string, patch: Partial<OtherIncome>) => void
  removeOtherIncome: (id: string) => void
  addLumpSum: (ls: FutureLumpSum) => void
  updateLumpSum: (id: string, patch: Partial<FutureLumpSum>) => void
  removeLumpSum: (id: string) => void

  // Results & Lifestyle Actions
  setResults: (r: CalculationResults) => void
  selectLifestylePlan: (lifestyle: 'bare_minimum' | 'comfortable' | 'luxury') => void

  // Navigation & Reset
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}
```

---

## Universal Field Setter (`setStepFieldValue`)

To support config-driven dynamic rendering without custom boilerplate actions for every input, `setStepFieldValue` routes field changes using standard step keys:

```ts
setStepFieldValue: (stepKey, fieldId, value) => {
  if (stepKey === 'profile') {
    // Updates profile slice and automatically recalibrates age or area tier defaults
  } else if (stepKey === 'household') {
    // Updates member list and recalculates family category defaults
  } else if (stepKey === 'assumptions') {
    // Updates macroeconomic assumption fields
  } else if (stepKey === 'assets') {
    // Updates active income, retirement age, or asset holdings
  }
}
```

---

## Reactive Plan Switching (`selectLifestylePlan`)

When the user clicks a lifestyle card on the results page:
1. `lifestyleScenario` is updated in the `profile` slice.
2. `categories` are adjusted:
   - For `bare_minimum`: Discretionary items are zeroed out while preserving essential items.
   - For `comfortable`: Standard baseline amounts are applied or restored.
   - For `luxury`: Discretionary items are scaled by 1.5× and essentials by 1.15×.
3. `runScenarios()` is called synchronously with the updated profile and categories.
4. The store atomically sets `{ profile, categories, results }`, updating all views and charts.
