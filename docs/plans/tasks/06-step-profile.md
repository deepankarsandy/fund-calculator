# Task 06 — Step 1: Profile

**Phase:** 2 — Wizard UI  
**Depends on:** Task 05  
**Blocks:** nothing (independent of other steps)

---

## Goal
Build the Profile wizard step — the first screen the user sees. Collect basic identity and planning horizon info with defaults pre-filled and every field explained.

---

## Component

### `src/components/steps/StepProfile.tsx`

Fields (all with help tooltips):

| Field | Type | Default | Help text |
|---|---|---|---|
| Country | Select | India | "The country you plan to spend your retirement in. Affects default currency." |
| State / Region | Text | (blank) | "Optional. Used for context — no automatic cost adjustments are made." |
| City | Text | (blank) | "Optional. Helps you remember which scenario this is." |
| Currency | Select | INR | "All amounts will be shown in this currency." |
| Current Age | Number | 30 | "Your age today. Used to calculate the planning horizon." |
| Target Age | Number | 85 | "The age you want your corpus to last until. We suggest testing 90–100." |
| Household size | Number | 1 | "Total number of people whose expenses are covered by this plan." |
| Lifestyle Scenario | Radio | Comfortable | "Bare Minimum: only essential costs. Comfortable: includes discretionary. Custom: you configure." |

### UI Details
- `Country` and `Currency` are Select dropdowns (short list: India, Others; INR, USD, EUR)
- `Current Age` and `Target Age` validate live: target must exceed current
- **Planning duration** shown as a computed label: "55 years (age 30 → 85)"
- Help icon (ℹ️) next to every label opens a Tooltip or inline note
- "Skip this step" is NOT available for Profile (it is required)
- Lifestyle scenario explained:
  - **Bare Minimum:** only essentials like food, housing, basic healthcare
  - **Comfortable:** includes travel, hobbies, leisure, better healthcare
  - **Custom:** you control which items are essential vs discretionary

### Validation (react-hook-form + zod)
- Uses `profileSchema` from Task 04
- Errors shown inline below each field
- "Next" button disabled if schema fails

---

## Acceptance Criteria
- [ ] All fields render with correct defaults
- [ ] Help tooltips appear on click/hover for every field
- [ ] Planning duration updates live as ages change
- [ ] Error shown when targetAge ≤ currentAge
- [ ] Store updated on every change (not just on "Next")
- [ ] Responsive: stacks to single column on mobile
