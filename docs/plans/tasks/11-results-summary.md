# Task 11 — Step 6: Results Summary Cards

**Phase:** 3 — Results  
**Depends on:** Tasks 03, 05–10  
**Blocks:** Task 12 (charts use same data)

---

## Goal
Trigger calculation when user clicks "Calculate", display the results as summary cards for three scenarios, and provide a clear plain-language explanation of each number.

---

## Trigger

When user completes Step 5 and clicks "Calculate":
1. Call `runScenarios()` from `src/domain/calculations/runScenarios.ts`
2. Store result in Zustand store (`setResults`)
3. Navigate to step 6 (Results)
4. Show a loading spinner briefly (calculations are synchronous but add 300ms artificial delay for UX)

---

## Component

### `src/components/results/ResultsSummary.tsx`

#### Top — Scenario Tabs
Three tabs: `Optimistic (4% infl, 7% return)` | `Base (5%, 7%)` | `Conservative (6%, 7%)`

Each tab shows the same card layout for that scenario's numbers.

#### Summary Cards Grid (2×3 on desktop, 1 col on mobile)

| Card | Value | Help |
|---|---|---|
| Monthly household budget | ₹X,XXX | "What you spend today each month, including annual costs averaged monthly." |
| Annual household budget | ₹X,XX,XXX | "Total current-day annual expenses across all filled categories." |
| Essential expenses | ₹X,XX,XXX / yr | "Expenses marked as essential (housing, food, healthcare, etc.)." |
| Discretionary expenses | ₹X,XX,XXX / yr | "Expenses marked as discretionary (travel, hobbies, leisure, etc.)." |
| Planning duration | XX years | "Age 30 to 85 — your planning horizon." |
| Inflation / Return | 5% / 7% | "Assumed expense inflation and net investment return for this scenario." |

#### Main Result Card (highlighted, full width)
```
Estimated Starting Corpus Required
₹X.XX Crore
(Convention A, end-of-year withdrawals, 5% inflation, 7% net return, 55 years)
```
Below: "This is not a guaranteed amount. It is a planning estimate based on the assumptions you entered."

#### Funding Gap Card
```
Existing corpus:        ₹XX L
Estimated gap:          ₹X.XX Cr
Corpus with 15% safety: ₹X.XX Cr
```
If gap < 0: "You appear to have a surplus. Verify your income entries and assumptions."

---

## Explanation Section
Below the cards, a collapsible "How was this calculated?" section:
- Lists the formula used (Convention A)
- Lists withdrawal timing
- Lists whether return is net or gross
- Lists any warnings generated
- Notes which expense categories were skipped

---

## Edit & Recalculate
"← Edit assumptions" button returns to Step 4.  
"← Edit expenses" returns to Step 3.  
"Recalculate" re-runs without navigating away.

---

## Acceptance Criteria
- [ ] All three scenario tabs render correct numbers
- [ ] Summary cards show correct values from store
- [ ] Required corpus shows with correct formula label
- [ ] Funding gap = required − existing; negative gap shows surplus message
- [ ] "How was this calculated?" section is collapsible
- [ ] Warning banners from `generateWarnings()` shown here
- [ ] "Edit" buttons navigate back to correct steps
- [ ] Responsive: cards stack to 1 col on mobile, 2 on tablet
