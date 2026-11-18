# Task 03 — Logic-Only Functionality Tests

**Goal:** Provide thorough unit test coverage using Vitest for calculation and financial logic only. Per project requirements, **component and UI tests are not needed**.

## Test Cases to Cover

1. **Annualisation Test**:
   - Monthly electricity (₹800/mo = ₹9,600/yr).
   - Annual medicines (₹10,000/yr = ₹10,000/yr).
   - Combined sum = ₹19,600.
   - Frequency multipliers check (weekly, quarterly, half-yearly, every N years).

2. **Inflation Projection Test**:
   - ₹1,00,000 at 5% for 10 years $\approx$ ₹1,62,889.
   - 0% inflation returns exact original amount.
   - 0 years returns original amount.

3. **Growing Annuity Formula Test**:
   - $E_0 = 1,00,000, r = 7\%, g = 5\%, n = 10$ years, end-of-year convention.
   - Verify portfolio simulation with calculated starting corpus depletes to $\approx 0$ (within ₹1) at year 10.

4. **Equal Return and Inflation Edge Case ($r = g$)**:
   - Test $r = 5\%, g = 5\%$.
   - Confirm no division by zero and result matches $C = E_0 \times n / (1 + r)$.

5. **Zero Inflation Test ($g = 0$)**:
   - Formula collapses to standard level annuity present value $E_0 \times \frac{1 - (1+r)^{-n}}{r}$.

6. **Beginning-of-Year vs End-of-Year Test**:
   - Beginning-of-year corpus must be strictly greater than end-of-year corpus by a factor of $(1 + r)$.

7. **Horizon Extension Test**:
   - Corpus for 55 years must be strictly greater than corpus for 50 years under positive net expenses.

8. **Cashflow Injection Test**:
   - One-time repair in Year 8 appears only in Year 8 cashflow.
   - Pension starting Year 10 reduces net withdrawal from Year 10 onward.

## Acceptance Criteria
- [ ] Run via `npm run test`.
- [ ] All tests execute quickly without browser/DOM overhead.
- [ ] 100% of calculation test cases pass.
