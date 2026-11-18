# Task 14 — Warnings, Tooltips & Missing-Data Banners

**Phase:** 4 — Polish  
**Depends on:** Tasks 04, 11  
**Blocks:** Task 15

---

## Goal
Wire all warnings from `generateWarnings()` into the UI. Add consistent info tooltips to every field. Show missing-data banners in Results.

---

## Warning Banner Component

### `src/components/ui/WarningBanner.tsx`
```tsx
interface Props {
  warnings: string[]
  dismissible?: boolean
}
```
- Yellow/amber card with ⚠️ icon
- One warning per line
- Dismissible per warning (stores dismissed IDs in local state)
- Shown on Results page (Step 6) and inline in Assumptions (Step 4)

---

## Info Tooltip Component

### `src/components/ui/FieldTooltip.tsx`
Wraps shadcn `<Tooltip>`:
```tsx
interface Props {
  content: string   // help text
  children: React.ReactNode
}
```
- Trigger: `ℹ` icon button (accessible, `aria-label="More info"`)
- Tooltip content: plain text, max 300 chars
- Position: auto (above on mobile, right on desktop)

**Usage in every step:**
```tsx
<Label>
  Current Age
  <FieldTooltip content="Your age today. Used to calculate the planning horizon." />
</Label>
<Input ... />
```

---

## Missing Data Panel

### `src/components/results/MissingDataPanel.tsx`
Shown at the top of Results if any of these are missing:
- Healthcare category: empty and not skipped
- Housing repairs: not entered
- Vehicle replacement: transport filled but no replacement item
- Planning to age < 85

Renders as a dismissible callout:
```
⚠️ Some expense categories may be incomplete
• Healthcare expenses appear to be missing
• No housing repair reserve found
[Review Expenses →]
```

---

## Skipped Category Indicator
In the Expenses accordion (Task 08), enhance the category header:
- **Filled (green):** total shown, green dot
- **Skipped (gray):** "Skipped" badge, dash for total
- **Empty / Needs attention (amber):** "Not filled" badge — categories that are not skipped but have zero amounts get amber warning

---

## Step-Level Completion Badges
In `WizardProgress.tsx` (Task 05), show per-step status:
- ✅ Complete (required fields filled)
- ⚠️ Warnings present
- ⬜ Not started / skipped

---

## Disclaimer Footer
### `src/components/ui/DisclaimerBanner.tsx`
Shown persistently at bottom of Results page:
> "Estimated corpus under the assumptions you entered. This is not a guaranteed safe withdrawal amount or personalised investment recommendation. Market returns, inflation, healthcare costs, and life circumstances are uncertain."

---

## Acceptance Criteria
- [ ] Every field across all steps has an ℹ tooltip with meaningful text
- [ ] Warning banners appear on Results when issues detected
- [ ] Missing-data panel shows correct issues
- [ ] Warnings are dismissible and don't block navigation
- [ ] Disclaimer footer always visible on Results page
- [ ] Step indicators show ✅/⚠️/⬜ correctly
- [ ] Empty expense categories show amber "Not filled" badge
