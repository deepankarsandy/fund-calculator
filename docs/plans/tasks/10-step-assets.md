# Task 10 — Step 5: Assets & Income

**Phase:** 2 — Wizard UI  
**Depends on:** Task 05  
**Blocks:** Task 11 (results)

---

## Goal
Collect existing investable corpus, expected income streams (pensions, rent), and future lump sums. All fully optional — users can skip entirely.

---

## Component

### `src/components/steps/StepAssets.tsx`

Three sections:

### Section 1 — Existing Corpus

| Field | Default | Help |
|---|---|---|
| Existing investable corpus | ₹0 | "Total value of investments you already have that can be used for retirement (mutual funds, FDs, EPF, NPS, etc.). Do NOT include your home unless you plan to sell or rent it." |

Single number input. Formats to `₹X.XX L / ₹X.XX Cr` as the user types.

### Section 2 — Regular Income After Retirement

A list of income streams. Each entry:

| Field | Type | Help |
|---|---|---|
| Label | Text | e.g. "Pension", "Rental income" |
| Annual amount | Number | Gross annual income |
| Starts in year | Number | Planning year when income begins (1 = immediately) |
| Ends in year | Number | Leave blank if lifelong |
| Inflation-linked | Toggle | "Will this income increase with inflation each year? E.g. CPI-linked pension." |

"+ Add income source" button. Each income shown as an editable card. Remove button per card.

**Help:** "Only include income you are highly confident of receiving. A pension from your employer, rental income from a property you own outright, or an annuity income. Do not include variable or uncertain income."

### Section 3 — Future Lump Sums

One-time amounts expected in a future year (inheritance, property sale, EPF/PPF maturity):

| Field | Type | Help |
|---|---|---|
| Label | Text | e.g. "EPF maturity", "Property sale" |
| Amount | Number | Expected amount in today's money |
| In planning year | Number | Which year (1-based) |

**Help:** "These amounts reduce your funding gap in the year they arrive. The calculator does NOT discount them to today's value automatically — enter them in future nominal terms or today's value, and note which you've used."

---

## Acceptance Criteria
- [ ] Existing corpus field formats large numbers as L/Cr live
- [ ] Income sources can be added, edited, removed
- [ ] "Inflation-linked" toggle works per income source
- [ ] Lump sums can be added, edited, removed
- [ ] "Skip this step" leaves all as defaults (₹0, empty lists)
- [ ] Store updated correctly
- [ ] Responsive: cards stack on mobile
