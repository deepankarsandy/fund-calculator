# Task 05 — Expenses Category Renderer (Parent vs Sub-Items)

**Goal:** Build the dynamic expense category manager supporting categories A to K, where users can either fill the parent total or fill sub-items individually, or skip.

## Requirements

1. **Category Accordion**:
   - Each category rendered with its label, description, and status badge (`Filled`, `Skipped`, `Not filled`).
   - Header displays the calculated annual total for that category.

2. **Dual Mode Selection**:
   - **Mode A: Parent Total**:
     - User inputs a single amount and frequency (e.g. ₹15,000 / month for Food).
     - Sub-items are bypassed in calculations.
   - **Mode B: Sub-items Breakdown**:
     - User expands and fills individual line items (e.g. Groceries ₹5,000, Veg/Fruits ₹2,000, Dining out ₹1,000).
     - Includes "+ Add custom item" button.
     - Each item supports: amount, frequency, essential/discretionary toggle, and optional inflation override.

3. **Skip Functionality**:
   - Each category has a "Skip this category" button that marks the category as skipped and zeroes its contribution.
   - Skipped categories can be un-skipped with one click.

4. **Category Explanation & Guidance**:
   - Show advice on preventing double counting (e.g. LPG under Housing vs Utilities).
   - Display default inflation rate for the category (e.g. Healthcare 7%, Tech 3%, General 5%).

## Acceptance Criteria
- [ ] Switching between Parent mode and Sub-items mode is smooth and preserves data.
- [ ] Category totals automatically aggregate to the top-level annual expense banner.
- [ ] Fully responsive on small mobile viewports.
