# Task 09 — Step 4: Assumptions

**Phase:** 2 — Wizard UI  
**Depends on:** Task 05  
**Blocks:** Task 11 (results)

---

## Goal
Let users configure the financial assumptions that drive the corpus calculation. All fields have sensible defaults. Everything is skippable. Warn when dangerous combinations are entered.

---

## Component

### `src/components/steps/StepAssumptions.tsx`

Sections:

### Section 1 — Inflation

| Field | Type | Default | Help |
|---|---|---|---|
| Inflation mode | Radio | Simple | "Simple: one rate for all expenses. Category: different rates per category. Item: custom rate per expense line." |
| Global inflation rate | Slider + number | 5% | "Annual rate at which all expenses grow. India's historical average has been around 5–6%." |
| (If category mode) Per-category rates | Table | pre-filled defaults | "Override the inflation rate for specific expense categories. E.g. healthcare typically inflates faster." |

Category-level default rates shown in a compact table if mode = `category`:
```
Housing & Property     5%
Food & Consumables     5%
Healthcare            7%
Transport              5%
Technology             3%
...
```

### Section 2 — Investment Return

| Field | Type | Default | Help |
|---|---|---|---|
| Annual investment return | Slider + number | 7% | "Expected annual return on your invested corpus, net of fees and taxes. A diversified equity-debt portfolio historically returns 7–10% in India, but this is not guaranteed." |
| Return basis | Radio | Net | "Net: you've already accounted for fees and taxes. Gross: enter fees and taxes separately below." |
| Investment fee rate | Number | 0% | Shown only if gross. "Annual management/advisory fee (e.g. 0.5% for index funds, 1–1.5% for active funds)." |
| Tax drag | Number | 0% | Shown only if gross. "Effective tax drag on returns (e.g. LTCG tax at 12.5% on 7% return ≈ 0.875% drag)." |

Inline computed label: "Real return ≈ 1.90% (nominal 7% − 5% inflation)"

### Section 3 — Withdrawal & Planning

| Field | Type | Default | Help |
|---|---|---|---|
| Withdrawal timing | Radio | End of year | "End-of-year: simpler, slightly lower corpus. Beginning-of-year: more conservative, higher corpus. Most retirement models use end-of-year." |
| Safety margin | Slider + number | 15% | "Extra buffer added on top of the calculated corpus to cover unexpected costs, sequence-of-returns risk, or underestimated expenses." |
| Compounding | Radio | Annual | "How often returns compound within each year. Annual is standard for a first estimate." |

---

## Warnings (shown inline in this step)
- If `return ≤ inflation`: red banner — "Return is at or below inflation. The corpus figure will be very large or undefined."
- If `return = inflation`: yellow banner — "Special calculation formula is used (r = g case)."
- If `returnBasis = gross` and fees = 0 and tax = 0: yellow banner

---

## Acceptance Criteria
- [ ] All fields render with correct defaults
- [ ] Sliders and number inputs stay in sync (changing one updates the other)
- [ ] Real return label updates live
- [ ] Fee/tax fields only visible when returnBasis = gross
- [ ] Category-rate table only visible when inflationMode = category
- [ ] Inline warnings appear on dangerous combinations
- [ ] "Skip this step" uses all defaults
- [ ] Responsive: sections stack on mobile
