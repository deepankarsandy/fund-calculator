# Lifetime Cost & Corpus Calculator — Agent Guide

## Project Purpose
A React + TypeScript web app that helps Indian households estimate the **investment corpus** required to fund their lifetime living expenses. The user walks through a **wizard flow** collecting profile, household members, categorised expenses, financial assumptions, and then sees results with projections, charts, and export options.

---

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript (Vite) |
| Styling | Tailwind CSS v3 |
| UI components | shadcn/ui (Radix primitives) |
| Charts | Recharts |
| State | Zustand |
| Math/decimal | decimal.js |
| Forms | react-hook-form + zod |
| Export | jsPDF + papaparse (CSV) |

---

## Repository Layout

```
src/
  domain/
    models/           # TypeScript types/interfaces (pure data)
    calculations/     # Pure functions: annualise, inflate, corpus formula
    validation/       # Zod schemas + warning logic
  store/              # Zustand slices (profile, expenses, assumptions, results)
  components/
    wizard/           # Step shell and progress bar
    steps/            # One component per wizard step
    expenses/         # Category accordion, sub-item rows, inline edit
    results/          # Summary cards, charts, projection table
    ui/               # Generic reusable UI (shadcn wrappers, tooltips)
  lib/                # Utility helpers (formatting, currency, etc.)
  pages/              # Route-level pages (Wizard, Results, About)
  App.tsx
  main.tsx
docs/
  plans/              # PRD and task-level planning docs
    tasks/            # Individual task breakdown files
```

---

## Wizard Steps (in order)
1. **Profile** – age, target age, location, currency, lifestyle scenario
2. **Household** – members list (name, relationship, age, dependency)
3. **Expenses** – accordion by category (A–K); parent total OR sub-items; skip allowed
4. **Assumptions** – inflation mode, investment return, withdrawal timing, safety margin
5. **Assets & Income** – existing corpus, pensions, lump sums, other income
6. **Results** – summary cards, charts, year-by-year table, scenario comparison

---

## Expense Categories (A–K)
A Housing & Property · B Food & Consumables · C Utilities & Communication · D Transport & Vehicles · E Healthcare & Insurance · F Personal & Lifestyle · G Household Technology & Devices · H Family & Dependents · I Financial & Admin · J Emergencies & Contingencies · K Custom

Each category supports:
- **Parent-level amount** (enter total, skip sub-items) OR
- **Sub-item breakdown** (open accordion, fill individually)
- Per-item: amount, frequency, essential/discretionary flag, inflation override, start/end year

---

## Calculation Engine Rules
- All math in **pure TypeScript functions** in `src/domain/calculations/`
- Internal rates stored as **decimals** (5% = 0.05)
- Use `decimal.js` for all financial arithmetic
- Growing annuity corpus formula: Convention A (first withdrawal = E0 at year-end)
- Special case when r = g: `C = E0 × n / (1 + r)`
- Portfolio simulation must reconcile with corpus formula to ~zero at end
- Monthly return: `(1 + annual)^(1/12) - 1` — never divide annual by 12
- Funding gap = Required corpus − existing assets − discounted future income

---

## Key UX Rules
- Every input field has an **info tooltip / help text** explaining what it means
- All fields are **skippable** — the user can proceed with defaults
- Reasonable **defaults pre-filled** (India, INR, 5% inflation, 7% return, etc.)
- Wizard shows **progress bar** with step names; steps can be revisited
- Expense categories show **completion indicator** (filled / skipped / empty)
- Results page shows **three scenarios** (Optimistic/Base/Conservative) side-by-side
- Warnings are non-blocking — shown as banners, not errors that block submission

---

## Validation & Warnings
Implemented in `src/domain/validation/`:
- Target age > current age
- Expense amounts ≥ 0
- Inflation/return > -100%
- Warn: return ≤ inflation (special case or very high corpus)
- Warn: missing healthcare / housing maintenance / vehicle replacement
- Warn: gross return entered with no fee/tax assumptions
- Warn: planning only to age 70 (suggest testing to 90–100)

---

## Development Commands
```bash
npm install          # install deps
npm run dev          # Vite dev server
npm run build        # production build
npm run test         # Vitest unit tests
npm run lint         # ESLint
```

---

## Testing
- Unit tests in `src/domain/calculations/__tests__/` using Vitest
- Cover all 10 test cases from the guide (annualisation, inflation projection, growing annuity, edge cases)
- No UI tests in MVP; Playwright can be added later

---

## Financial Disclaimers (always visible in Results)
> "Estimated corpus under the assumptions you entered. This is not a guaranteed safe withdrawal amount or personalised investment recommendation. Returns and inflation are uncertain."

---

## MVP Scope (do first)
1. Wizard shell + all 6 steps with skip/default support
2. Expense accordion with parent OR sub-item entry
3. Growing annuity quick estimate + annual cash-flow projection
4. Three-scenario results page with charts
5. Export to CSV and PDF
6. All 10 calculation unit tests passing

## Out of Scope (MVP)
- Monthly cash-flow granularity
- Variable/stochastic return simulation
- Multi-currency
- Cloud storage / auth
- Shared household planning
