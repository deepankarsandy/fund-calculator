# Task 15 — Responsive Polish & Accessibility

**Phase:** 4 — Polish  
**Depends on:** Task 14  
**Blocks:** nothing (final task)

---

## Goal
Audit and polish the full app for mobile responsiveness, keyboard navigation, and screen-reader accessibility.

---

## Responsive Breakpoints

Use Tailwind breakpoints:
- `sm` (640px) — single column layout, stacked nav
- `md` (768px) — 2-column grids start, side-by-side buttons
- `lg` (1024px) — full layout with charts and tables side by side

### Per-Step Checklist

| Step | Mobile adjustments |
|---|---|
| Profile | 1-col form; lifestyle radio becomes select on xs |
| Household | Member cards full-width; add button full-width |
| Expenses | Accordion full-width; item rows scroll horizontally if needed |
| Assumptions | Sections stack; sliders full width |
| Assets | Cards full width |
| Results | Cards 1-col; charts full width; table scrolls horizontally |

---

## Accessibility Checklist

- [ ] All inputs have `<Label>` with `htmlFor` wired
- [ ] All icon-only buttons have `aria-label`
- [ ] Tooltips announced by screen readers (`role="tooltip"`)
- [ ] Accordion items use correct ARIA attributes (shadcn handles most)
- [ ] Keyboard: Tab moves through all interactive elements in logical order
- [ ] Keyboard: Enter/Space activates buttons and toggles
- [ ] Keyboard: Escape closes dialogs and tooltips
- [ ] Focus ring visible on all focusable elements
- [ ] Colour contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Charts have `aria-label` descriptions for screen readers
- [ ] Error messages linked to inputs via `aria-describedby`

---

## Performance

- [ ] `React.memo` or `useMemo` on expensive chart components
- [ ] Projection table virtualised if > 50 rows (use windowing or pagination)
- [ ] No calculation logic runs on every render — only on "Calculate" click
- [ ] `localStorage` writes debounced (300ms) to avoid excessive writes

---

## Final Visual Polish

- Consistent spacing: `gap-4` between cards, `gap-6` between sections
- Typography: headings `text-2xl font-semibold`, body `text-sm text-muted-foreground`
- Brand colours defined in `tailwind.config.ts` (teal/indigo palette)
- Dark mode: use Tailwind `dark:` variants on all bg/text colours
- Loading states: spinner on "Calculate", skeleton on chart load
- Empty states: illustrated empty state when no categories filled

---

## Acceptance Criteria
- [ ] App is fully usable on 375px wide screen (iPhone SE)
- [ ] All form elements reachable by keyboard alone
- [ ] No horizontal overflow on any screen size
- [ ] Charts resize correctly on window resize
- [ ] Dark mode toggle works (optional: system preference auto-detected)
- [ ] `axe` accessibility audit in browser shows zero critical errors
