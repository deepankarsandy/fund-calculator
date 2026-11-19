# Testing Strategy & Policy

This document details the automated testing policy, test suites, and validation guidelines for the project.

---

## Testing Policy: Pure Financial Logic Focus

The project adheres to a strict **Logic-Only Testing Policy**:
- **Automated Unit Tests**: Focus exclusively on the financial calculation engine (`src/domain/calculations/`).
- **No Fragile UI/DOM Tests**: We intentionally omit React component render tests, snapshot tests, or simulated DOM clicks. This keeps the test suite fast (under 1 second), deterministic, and immune to UI refactoring churn.

---

## Test Suites Overview

All unit tests are located in `src/domain/calculations/__tests__/` and executed via [Vitest](https://vitest.dev/).

```
src/domain/calculations/__tests__/
├── annualise.test.ts          # Normalization of monthly, quarterly, weekly, and N-year expenses
├── areaDefaults.test.ts       # Geographic multipliers, non-linear member scaling, lifecycle intervals
├── calculations.test.ts       # Growing annuity formula (Convention A), r = g edge case, inflation
└── activeIncome.test.ts       # Career salary compounding, net investable surplus, and peak wealth
```

---

## Key Test Scenarios Covered

1. **Annualisation Invariance**:
   - Monthly expenses (₹800) $\to$ ₹9,600/yr.
   - Weekly expenses (₹500) $\to$ ₹26,000/yr.
   - Periodic items (laptop every 3 years) $\to$ 1/3 annual amortization.

2. **Convention A Growing Annuity Precision**:
   - Correct corpus computation when $r > g$, $r < g$, and the edge case $r = g$.
   - Beginning-of-year adjustment $(1 + r)$ verified.

3. **Active Income & Surplus Accumulation**:
   - Salary escalating with 7% annual hikes compounding surplus into corpus.
   - Verifying that zero-deficit scenarios report ₹0 starting corpus needed.

4. **Area & Demographic Scaling**:
   - Ensuring Tier 1 Metro costs exceed Village costs across housing and food.
   - Non-linear scaling: 3 household members cost less than 3× a single person.
   - Verification of child schooling and college start years based on age.
   - Verification that lifestyle transformations preserve category item counts.

---

## Running the Tests

```bash
# Run test suite once
npm test

# Run tests in interactive watch mode
npm run test:watch
```
