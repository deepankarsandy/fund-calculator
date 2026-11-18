# Task Overview — Lifetime Corpus Calculator

All tasks are numbered and sequenced. Each task file is self-contained with acceptance criteria.

## Phases

| Phase | Tasks | Focus |
|---|---|---|
| 0 | 01 | Project scaffold & tooling |
| 1 | 02–04 | Domain layer (models, calculations, validation) |
| 2 | 05–10 | Wizard UI steps |
| 3 | 11–13 | Results, charts, export |
| 4 | 14–15 | Polish, warnings, disclaimers |

## Task Index

| # | File | Title | Status |
|---|---|---|---|
| 01 | [01-scaffold.md](./01-scaffold.md) | Project scaffold & tooling | 🔲 Todo |
| 02 | [02-domain-models.md](./02-domain-models.md) | Domain models & TypeScript types | 🔲 Todo |
| 03 | [03-calculation-engine.md](./03-calculation-engine.md) | Calculation engine + unit tests | 🔲 Todo |
| 04 | [04-validation.md](./04-validation.md) | Validation & warnings logic | 🔲 Todo |
| 05 | [05-wizard-shell.md](./05-wizard-shell.md) | Wizard shell + Zustand store | 🔲 Todo |
| 06 | [06-step-profile.md](./06-step-profile.md) | Step 1: Profile | 🔲 Todo |
| 07 | [07-step-household.md](./07-step-household.md) | Step 2: Household members | 🔲 Todo |
| 08 | [08-step-expenses.md](./08-step-expenses.md) | Step 3: Expenses accordion | 🔲 Todo |
| 09 | [09-step-assumptions.md](./09-step-assumptions.md) | Step 4: Assumptions | 🔲 Todo |
| 10 | [10-step-assets.md](./10-step-assets.md) | Step 5: Assets & Income | 🔲 Todo |
| 11 | [11-results-summary.md](./11-results-summary.md) | Step 6: Results summary cards | 🔲 Todo |
| 12 | [12-results-charts.md](./12-results-charts.md) | Results charts & projection table | 🔲 Todo |
| 13 | [13-export.md](./13-export.md) | Export (CSV + PDF) | 🔲 Todo |
| 14 | [14-warnings-ux.md](./14-warnings-ux.md) | Warnings, tooltips, missing-data banners | 🔲 Todo |
| 15 | [15-responsive-polish.md](./15-responsive-polish.md) | Responsive polish & accessibility | 🔲 Todo |

## Dependency Order
```
01 → 02 → 03 → 04
              ↓
         05 (store + wizard shell)
         ↓
    06 → 07 → 08 → 09 → 10
                          ↓
                    11 → 12 → 13
                                ↓
                          14 → 15
```
