# Lifetime Cost & Corpus Calculator — Agent & Developer Guide

## Project Overview

A lightweight, hobby-scale web application built with **React 19**, **TypeScript**, and **Tailwind CSS** that helps Indian households calculate their required investment corpus to fund living expenses over their chosen lifetime horizon.

The core philosophy of this project is **simplicity, modularity, and maintainability**:

- **Pure Domain Separation**: Pure financial calculation functions live in `src/domain/calculations/` with zero UI or React dependencies.
- **Config-Driven Architecture**: All wizard steps, sections, fields, sub-fields, options, default values, and help text are defined in a single configuration file (`src/config/formFields.ts`).
- **Logic-Only Automated Testing**: Automated tests focus exclusively on mathematical calculations, demographic algorithms, and financial compounding. No DOM/component testing.
- **Privacy-First & Zero-Backend**: 100% client-side execution with Zustand `localStorage` persistence.

---

## Technical Documentation Index

For in-depth technical details, refer to the dedicated specification documents in [`docs/technical/`](docs/technical/):

| Technical Topic             | Description                                                                                                          | Deep Dive Document                                                         |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **System Architecture**     | High-level system design, unidirectional data flow, and directory hierarchy.                                         | [📖 Architecture Overview](docs/technical/architecture-overview.md)        |
| **Config-Driven Engine**    | `FieldConfig` & `StepConfig` schemas, `DynamicStepRenderer`, `DynamicField`, and `DynamicExpensesRenderer`.          | [📖 Config-Driven Engine](docs/technical/config-driven-engine.md)          |
| **Calculation Engine**      | Growing annuity formulas (Convention A), annualisation, career accumulation, and drawdown simulation.                | [📖 Calculation Engine](docs/technical/calculation-engine.md)              |
| **State Management**        | Zustand store (`useScenarioStore`), state slices, universal setter `setStepFieldValue`, and reactive recalculations. | [📖 State Management](docs/technical/state-management.md)                  |
| **Demographic Calibration** | Geographic area multipliers, non-linear member scaling, and child/parent lifecycle windows.                          | [📖 Calibration Algorithms](docs/technical/area-and-lifestyle-defaults.md) |
| **Testing Strategy**        | Vitest testing policy, mathematical test suites, and edge case coverage.                                             | [📖 Testing Strategy](docs/technical/testing-strategy.md)                  |

---

## User Feature Documentation Index

For feature-specific functionality, refer to the documentation in [`docs/features/`](docs/features/):

- [Guided 6-Step Wizard Flow](docs/features/wizard-flow.md)
- [Profile & Location-Calibrated Defaults](docs/features/profile-and-location.md)
- [Income, Savings & Career Accumulation](docs/features/income-and-career-accumulation.md)
- [Household & Dependents Modeling](docs/features/household-dependents.md)
- [Expense Management (Categories A to K)](docs/features/expense-management.md)
- [Financial & Macroeconomic Assumptions](docs/features/financial-assumptions.md)
- [Results Dashboard & Projections](docs/features/results-and-projections.md)
- [Lifestyle Scenarios & 1-Click Plan Switching](docs/features/lifestyle-scenarios.md)
- [PDF Report Export & Print Styling](docs/features/pdf-export-and-print.md)
- [Storage, Persistence & Theming](docs/features/storage-and-theming.md)

---

## Tech Stack Summary

- **Framework**: React 19 (Vite + TypeScript)
- **Styling**: Tailwind CSS with custom CSS variables and Light/Dark/System theme persistence
- **Icons**: Lucide React
- **Math/Precision**: `decimal.js` (for financial formulas)
- **Charts**: Recharts (responsive SVG charts)
- **State**: Zustand with `persist` middleware
- **Test Runner**: Vitest (pure functionality tests for financial and demographic logic)

---

## Developer Guidelines & Rules

1. **Modifying or Adding Form Fields**:
   - Always update `src/config/formFields.ts`.
   - Never hardcode input fields in JSX components. The `DynamicStepRenderer` and `DynamicField` components will automatically loop and render your additions.
2. **Editing Financial Math**:
   - Keep calculations pure and deterministic in `src/domain/calculations/`.
   - Always add or update corresponding unit tests in `src/domain/calculations/__tests__/`.
3. **Preserving User Data**:
   - Lifestyle switching and category recalibrations must remain non-destructive. Do not remove expense categories or items from the user's active state.
4. **Running Tests & Building**:
   ```bash
   # Run automated test suite
   npm test

   # Run production build and verify typechecking
   npm run build
   ```
