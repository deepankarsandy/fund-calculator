# Lifetime Cost & Corpus Calculator — Agent Guide

## Project Overview
A lightweight, hobby-scale web application built with **React** and **Tailwind CSS** that helps Indian households calculate their required investment corpus to fund living expenses over their chosen lifetime horizon.

The core philosophy of this project is **simplicity and maintainability**:
- **Hobby-grade, clean architecture**: Keep code straightforward and easy to understand without enterprise boilerplate.
- **Config-Driven Forms**: All wizard steps, sections, fields, sub-fields, options, default values, and explanation texts are defined in a single configuration file (`src/config/formFields.ts` / `src/config/wizardConfig.ts`).
- **Easy Field Modifications**: Adding, removing, reordering, or tweaking fields requires only changing the config file — the UI dynamically loops and renders them.
- **Wizard Flow**: Clean multi-step flow keeping screens small, friendly, and responsive across desktop and mobile.
- **Flexible Expense Categories**: Categories can have subcategories/sub-items. Users can either fill the parent category as a single total OR break it down into sub-items, or skip the category altogether.
- **Explanations & Defaults**: Every field features clear explanation text for what it means. Sensible defaults are pre-filled so users can skip or proceed rapidly.
- **Logic-Only Testing**: Automated unit tests focus strictly on calculation and financial logic (growing annuities, inflation projections, portfolio depletion, cash flows). No component tests are required.

---

## Tech Stack
- **Framework**: React (Vite + TypeScript)
- **Styling**: Tailwind CSS with Dark/Light/System theme switcher and modern form styling
- **Icons**: Lucide React
- **Math/Precision**: `decimal.js` (for financial formulas)
- **Charts**: Recharts (clean, responsive visualizations)
- **Test Runner**: Vitest (pure functionality tests for calculation logic)

---

## Key Features & User Experience
- **Theme Switcher**: Supports Light, Dark, and System theme defaults, persisted in `localStorage`.
- **Modern Form Elements**: Consistent 44px (`h-11`) inputs and dropdowns, custom select indicators, and removed default browser number input arrows.
- **Area & Location Calibrated Defaults**: Choose between **Village / Rural**, **Small Town (Tier 3)**, **City (Tier 2)**, and **Tier 1 Metro** in Profile. Default expense estimates automatically adjust according to realistic cost-of-living multipliers across India.
- **High Contrast UI**: Distinct status badges (`Filled`, `Not filled`, `Skipped`), high-contrast alerts, and clear explanation tooltips.
- **Complete Local Storage Persistence**: All user inputs persist across reloads and are cleared cleanly upon clicking "Reset".
- **Dynamic Expense Management**: Categories A to K support entering a single category total or expanding sub-items, with one-click skip.

---

## Architecture & Directory Layout

```
src/
  config/
    formFields.ts       # THE SINGLE SOURCE OF TRUTH for all steps, fields,
                        # sub-fields, types, defaults, options, and explanations.
  domain/
    models/             # TypeScript type definitions for data structures
    calculations/       # Pure calculation functions (annualise, inflation, corpus, cashflows)
      __tests__/        # Functionality-only unit tests for math and logic
  components/
    wizard/             # Dynamic wizard shell, progress bar, navigation
    form/               # Dynamic field renderer (number, text, select, radio, slider, array, etc.)
    expenses/           # Dynamic category renderer (parent total vs sub-items toggle)
    results/            # Summary cards, charts, and projection table
  lib/                  # Utilities (currency formatting INR/L/Cr, math helpers)
  App.tsx               # Root component hosting the wizard
  main.tsx              # App entrypoint
docs/
  plans/
    tasks/              # Task breakdowns for building the simplified project
```

---

## The Config-Driven Field Schema (`src/config/formFields.ts`)

Every field in the application is represented as a structured object:

```ts
export interface FieldConfig {
  id: string
  label: string
  type: 'number' | 'text' | 'select' | 'radio' | 'slider' | 'checkbox' | 'array' | 'category-group'
  defaultValue: any
  help: string               // Clear explanation of what this field means
  options?: { label: string; value: any; description?: string }[]
  min?: number
  max?: number
  step?: number
  prefix?: string            // e.g. '₹'
  suffix?: string            // e.g. '%' or 'years'
  skippable?: boolean        // If true, user can skip filling this field
  subFields?: FieldConfig[]  // For array items or composite groups
}
```

### Expense Categories Schema
Categories (A through K) contain:
- `id`: e.g. `housing`, `food`, `healthcare`
- `label`: Category title
- `description`: What is covered, advice on double-counting
- `defaultInflationRate`: e.g. `0.05` (5%), healthcare `0.07` (7%)
- `parentInput`: Allows entering a single combined total with frequency
- `subItems`: Array of item configurations with default amounts and frequencies
- The UI renders a toggle allowing the user to either enter the parent total or fill sub-items.

---

## Calculation Rules & Financial Logic
- **Annualisation**: Convert weekly (×52), monthly (×12), quarterly (×4), yearly (×1), or every N years (/N) to annual baselines. One-time items are applied only in the specified planning year.
- **Convention A Growing Annuity**:
  - For $r \neq g$: $C = E_0 \times \frac{1 - \left(\frac{1+g}{1+r}\right)^n}{r - g}$
  - For $r = g$: $C = E_0 \times \frac{n}{1+r}$
  - Beginning-of-year adjustment multiplies by $(1+r)$.
- **Cash Flow Simulation**: Year-by-year calculation with inflating expenses, reliable income offset, investment growth, and closing balance depletion check.
- **Funding Gap**: $\text{Required Corpus} - \text{Existing Investable Corpus}$.

---

## Testing Policy
- **Strictly Functionality / Math Tests**: Test the calculation engine against the 10 test scenarios from the guide (annualisation, inflation compounding, annuity formula, $r = g$ edge cases, horizon extension, portfolio depletion).
- **No Component / UI Tests**: Skip testing React components or DOM rendering to keep the project light and agile.
