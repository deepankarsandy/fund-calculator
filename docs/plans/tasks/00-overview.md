# Task Overview — Streamlined Config-Driven Corpus Calculator

This project is organized as a lightweight hobby application where all fields, explanations, defaults, and sub-items are defined in a central configuration schema. The UI dynamically loops and renders this schema.

## Simplified Task List

| # | Task | Focus | Status |
|---|---|---|---|
| 01 | [01-config-schema.md](./01-config-schema.md) | Central Form Fields Config (`src/config/formFields.ts`) with all steps, fields, categories, and explanations | 🔲 Todo |
| 02 | [02-calculation-engine.md](./02-calculation-engine.md) | Pure calculation functions (annualise, inflation, corpus formula, cashflows) | 🔲 Todo |
| 03 | [03-logic-tests.md](./03-logic-tests.md) | Pure functionality unit tests for calculation engine (10 core test cases) | 🔲 Todo |
| 04 | [04-dynamic-form-renderer.md](./04-dynamic-form-renderer.md) | Generic field renderers (text, number, select, radio, slider, arrays) with help tooltips & defaults | 🔲 Todo |
| 05 | [05-expenses-category-renderer.md](./05-expenses-category-renderer.md) | Accordion category renderer with parent total vs sub-items toggle and skip choice | 🔲 Todo |
| 06 | [06-wizard-flow-ui.md](./06-wizard-flow-ui.md) | Responsive wizard container (steps, progress bar, back/next/skip, responsive layout) | 🔲 Todo |
| 07 | [07-results-view.md](./07-results-view.md) | Results summary cards, Recharts visualizations, scenario toggles, and projection table | 🔲 Todo |

---

## Architectural Flow
```
src/config/formFields.ts (Central Config: fields, sub-fields, defaults, explanations)
         │
         ├───► Dynamic Field & Expenses Renderers (UI loops & renders based on config)
         │           │
         │           ▼
         │      User Inputs / State
         │           │
         ▼           ▼
Calculation Engine (Pure functions: annualise, inflate, corpus, cashflows)
         │
         ├───► Functionality Unit Tests (Vitest: math/logic only, no UI tests)
         │
         ▼
Results Screen (Cards, Recharts, Projections, Scenarios)
```
