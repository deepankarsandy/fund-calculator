# Task 02 — Calculation Engine

**Goal:** Implement pure mathematical functions in `src/domain/calculations/` without UI dependencies using `decimal.js` for financial accuracy.

## Modules

1. **`annualise.ts`**:
   - Convert amounts based on frequency: weekly (×52), monthly (×12), quarterly (×4), half-yearly (×2), yearly (×1), every N years (/N).
   - One-time items return 0 for annual recurring baseline.
   - Aggregate annual expense across all active categories and items.

2. **`projectInflation.ts`**:
   - `projectInflation(amount, rate, years)`: Compounding $E_t = E_0 \times (1 + g)^t$.
   - Multi-horizon projections (5, 10, 20, 30 years).

3. **`corpusFormula.ts`**:
   - Growing annuity Convention A:
     - When $r \neq g$: $C = E_0 \times \frac{1 - \left(\frac{1+g}{1+r}\right)^n}{r - g}$
     - When $r = g$: $C = E_0 \times \frac{n}{1+r}$ (special case avoidance of division by zero)
   - Beginning of year timing adjustment: $C \times (1 + r)$.
   - Real return helper: $\frac{1 + r}{1 + g} - 1$.
   - Net return deduction helper for gross basis: $r_{\text{net}} = r_{\text{gross}} - \text{fees} - \text{taxDrag}$.

4. **`projectCashflows.ts` & `simulatePortfolio.ts`**:
   - Build year-by-year cashflow schedule.
   - Project inflated recurring expenses, inject scheduled one-time costs.
   - Deduct pension/other income and lump sum contributions.
   - Simulate portfolio depletion year-by-year to verify portfolio closes at ~0 when funded by the calculated corpus.

5. **`runScenarios.ts`**:
   - Run three standard scenarios side-by-side:
     - Optimistic: 4% inflation, 7% return
     - Base: User's configured assumptions (default 5% inflation, 7% return)
     - Conservative: 6% inflation, 7% return
   - Calculate required corpus, funding gap, safety margin addition, and year-by-year projections for each.

## Acceptance Criteria

- [ ] All calculations implemented as pure functions in `src/domain/calculations/`.
- [ ] Division by zero prevented when return equals inflation ($r = g$).
- [ ] Precision handled reliably using `decimal.js`.
