# Task 08 — Step 3: Expenses Accordion

**Phase:** 2 — Wizard UI  
**Depends on:** Tasks 02, 05  
**Blocks:** Task 11 (results use expense data)

---

## Goal
Build the expense entry step — the most complex step. Users see all 11 categories (A–K) in an accordion. Each category can be filled at the **parent level** (one amount) or **sub-item level** (individual items). Both levels can be skipped.

---

## Data File

### `src/domain/data/defaultCategories.ts`
Pre-populate all 11 categories with their sub-items and India-specific defaults.

Structure per category:
```ts
export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'housing',
    label: 'A. Housing & Property',
    description: 'Rent, utilities, repairs, and maintenance costs for your home.',
    defaultInflationRate: 0.05,
    skipped: false,
    items: [
      { id: 'electricity', name: 'Electricity', amount: 800, frequency: 'monthly', essential: true, ... },
      { id: 'water', name: 'Water', amount: 0, frequency: 'monthly', essential: true, ... },
      { id: 'internet', name: 'Internet / Broadband', amount: 700, frequency: 'monthly', essential: true, ... },
      { id: 'cooking_gas', name: 'Cooking Gas / LPG', amount: 1000, frequency: 'monthly', essential: true, ... },
      { id: 'property_tax', name: 'Property Tax', amount: 0, frequency: 'yearly', essential: true, ... },
      { id: 'home_insurance', name: 'Home Insurance', amount: 0, frequency: 'yearly', essential: true, ... },
      { id: 'society_fees', name: 'Society / Association Fees', amount: 0, frequency: 'monthly', essential: true, ... },
      { id: 'repairs_maintenance', name: 'Repairs & Maintenance', amount: 50000, frequency: 'yearly', essential: true, ... },
      { id: 'appliance_replacement', name: 'Appliance Replacement', amount: 0, frequency: 'every_n_years', everyNYears: 7, essential: false, ... },
      { id: 'domestic_help', name: 'Domestic Help / Security', amount: 0, frequency: 'monthly', essential: false, ... },
    ],
  },
  {
    id: 'food',
    label: 'B. Food & Household Consumables',
    description: 'Groceries, vegetables, staples, eating out, and household supplies.',
    defaultInflationRate: 0.05,
    items: [
      { id: 'groceries', name: 'Groceries & Staples', amount: 5000, frequency: 'monthly', essential: true, ... },
      { id: 'vegetables_fruits', name: 'Vegetables & Fruits', amount: 0, frequency: 'monthly', essential: true, ... },
      { id: 'fish_meat_dairy', name: 'Fish, Meat, Eggs & Dairy', amount: 0, frequency: 'monthly', essential: true, ... },
      { id: 'eating_out', name: 'Eating Out / Takeaway', amount: 0, frequency: 'monthly', essential: false, ... },
      { id: 'cleaning_supplies', name: 'Cleaning & Household Supplies', amount: 0, frequency: 'monthly', essential: true, ... },
      { id: 'toiletries', name: 'Toiletries & Personal Care', amount: 0, frequency: 'monthly', essential: true, ... },
    ],
  },
  // ... C through K defined similarly
]
```

---

## Components

### `src/components/expenses/ExpenseCategoryAccordion.tsx`
Renders all categories as an accordion (shadcn `<Accordion>` with `type="multiple"`).

Each accordion item header shows:
- Category letter + name
- Completion badge: `Filled` (green) / `Skipped` (gray) / `Empty` (amber)
- Total annual amount for that category (if filled)

### `src/components/expenses/CategoryPanel.tsx`
Inside each accordion item:

**Two-mode toggle at top:**
```
[ Enter total amount ]   [ Fill sub-items ]
```

**Mode A — Parent Amount:**
- Single amount input + frequency select
- Help: "Enter your estimated total for this category. You can break it down into sub-items later."

**Mode B — Sub-items:**
- Table/list of sub-items
- Each row: name | amount | frequency | essential toggle | ⓘ help | delete
- "+ Add custom item" button at the bottom
- Rows can be hidden/shown with a "Show all items" toggle

**Skip button:**
- "Skip this category" link — marks category as `skipped: true`, shown in gray

### `src/components/expenses/ExpenseItemRow.tsx`
Single editable row for one expense item:
- Name (editable)
- Amount (number input, INR prefix)
- Frequency select
- Essential/Discretionary toggle badge
- Expand icon for advanced options (inflation override, start/end year, notes)
- Delete icon

### `src/components/expenses/FrequencySelect.tsx`
Reusable frequency dropdown with all options + "Every N years" revealing an `N` input.

---

## Help Texts (per category)

| Category | Help |
|---|---|
| Housing | "Include rent (₹0 if you own), utilities, and repair reserves. Do not double-count LPG if listed under Utilities." |
| Food | "Monthly grocery and food costs for the whole household." |
| Utilities | "Bills for electricity, water, gas, internet, and phone. Skip if already counted under Housing." |
| Transport | "Fuel, insurance, servicing, and vehicle replacement reserve." |
| Healthcare | "Doctor visits, medicines, insurance premiums, and emergency medical buffer. This category defaults to 7% inflation." |
| Personal | "Clothing, grooming, hobbies, travel, and leisure." |
| Technology | "Phone and laptop replacement, subscriptions, and repairs." |
| Family | "Support for parents, children's education, childcare, and other dependents. Add end years where applicable." |
| Financial | "Taxes, fees, and admin costs. Consider using the Assumptions step for investment-related tax drag." |
| Emergency | "A reserve buffer for unexpected costs. This can also be modelled as a safety margin in the Assumptions step." |
| Custom | "Any other expense not covered above." |

---

## Acceptance Criteria
- [ ] All 11 categories render in accordion
- [ ] Parent-amount mode and sub-item mode both work
- [ ] Switching modes does not lose entered data
- [ ] Skipping a category marks it and shows "Skipped" badge
- [ ] Sub-item rows can be added, edited, and deleted
- [ ] Frequency select includes "Every N years" with N input
- [ ] Advanced row options (inflation override, start/end year) expand inline
- [ ] Category total (annualised) shown in accordion header
- [ ] Responsive: row inputs stack on mobile, accordion opens/closes smoothly
