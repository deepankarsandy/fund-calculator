# Task 07 — Step 2: Household Members

**Phase:** 2 — Wizard UI  
**Depends on:** Task 05  
**Blocks:** nothing (independent of other steps)

---

## Goal
Let users add, edit, and remove household members. The first member "Self" is pre-added. Users can skip this step if planning for themselves only.

---

## Component

### `src/components/steps/StepHousehold.tsx`

Layout:
- Introductory text explaining what this step is for
- "Skip this step" link at top right (uses `self` member only)
- List of member cards (auto-includes `Self` on first load)
- "+ Add member" button at bottom

### Member Card

Each card shows:
- Name/label (editable, e.g. "Spouse", "Parent 1")
- Relationship select: Self / Spouse / Parent / Child / Sibling / Other
- Age (number input)
- "Financially dependent?" toggle
- "Support until age" (shown only if dependent = true)
- "Has health insurance?" toggle
- Delete button (cannot delete Self)

### `src/components/steps/MemberCard.tsx`
Compact form card. Opens inline on "+ Add member", collapses after save.

### Help texts per field:

| Field | Help text |
|---|---|
| Relationship | "How this person relates to you. Used for labelling only." |
| Age | "Their current age. Used for planning dependent expense windows." |
| Financially dependent | "Check if you are funding this person's expenses from the same corpus." |
| Support until age | "The age at which you expect to stop supporting this person financially (e.g. child becomes independent at 25)." |
| Health insurance | "Whether this person has health insurance coverage. Affects warnings in the healthcare expense section." |

---

## Default State

On first load, pre-add:
```ts
{
  id: 'self',
  label: 'Self',
  relationship: 'self',
  age: profile.currentAge,  // from Profile step
  financiallyDependent: false,
  hasHealthInsurance: false,
}
```

---

## Acceptance Criteria
- [ ] Self member always present and cannot be deleted
- [ ] New members can be added, edited, and removed
- [ ] "Support until age" field only visible when dependent = true
- [ ] "Skip this step" keeps Self member but no others
- [ ] Store updates on save of each member
- [ ] Responsive: cards stack on mobile
