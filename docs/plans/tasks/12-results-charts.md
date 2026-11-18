# Task 12 — Results: Charts & Projection Table

**Phase:** 3 — Results  
**Depends on:** Task 11  
**Blocks:** Task 13 (export uses same data)

---

## Goal
Render charts and a year-by-year projection table using Recharts. All charts use `CalculationResults` from the store.

---

## Charts (Recharts)

### `src/components/results/charts/ExpensesOverTimeChart.tsx`
- Type: `LineChart` or `AreaChart`
- X-axis: age (currentAge to targetAge)
- Y-axis: amount in ₹
- Series: Total expenses (nominal), Total expenses (today's money / real), Other income
- Tooltip: year, age, nominal expense, real expense, net withdrawal
- **Help:** "Nominal = actual future rupees. Real = equivalent purchasing power in today's money."

### `src/components/results/charts/PortfolioBalanceChart.tsx`
- Type: `AreaChart`
- X-axis: age
- Y-axis: corpus balance in ₹
- Series: Optimistic / Base / Conservative closing corpus per year (3 lines)
- Shaded area where corpus > 0
- Corpus depletion year highlighted if balance goes to 0
- **Help:** "Shows how your corpus grows and depletes over time. If the line reaches zero before your target age, the plan is underfunded."

### `src/components/results/charts/CategoryBreakdownChart.tsx`
- Type: `PieChart` or `BarChart`
- Shows current annual cost by category
- Colour-coded per category
- Clicking a slice highlights that category

### `src/components/results/charts/ScenarioComparisonChart.tsx`
- Type: `BarChart` (grouped)
- X-axis: Optimistic / Base / Conservative
- Y-axis: Required corpus
- Shows corpus with and without safety margin per scenario

---

## Projection Table

### `src/components/results/ProjectionTable.tsx`

Columns:
| Year | Age | Opening Corpus | Expenses | Other Income | Net Withdrawal | Growth | Closing Corpus |

- Paginated: show 10 rows at a time, with "Show all" toggle
- Row click expands to show category-level expense breakdown for that year
- Positive closing corpus = green; negative = red
- Formatted as INR with L/Cr shorthand for large values

---

## Expense Breakdown Table

### `src/components/results/ExpenseBreakdownTable.tsx`

Columns:
| Category | Current Annual | % of Total | Inflation | In 10 Years | In 20 Years | In 30 Years | Type |

- Sortable columns
- Essential/Discretionary badge in Type column
- Skipped categories shown as "—"

---

## Layout (Results Page)

```
┌──────────────────────────────────────────┐
│  Summary Cards (Task 11)                 │
├──────────────────────────────────────────┤
│  [Tab: Charts] [Tab: Table] [Tab: Breakdown] │
├──────────────────────────────────────────┤
│  Chart / Table content                   │
└──────────────────────────────────────────┘
```

---

## Acceptance Criteria
- [ ] All 4 charts render without errors
- [ ] Portfolio balance chart shows all 3 scenarios
- [ ] Corpus depletion year shown if balance hits zero
- [ ] Projection table shows all planning years (paginated)
- [ ] Row expansion shows category breakdown
- [ ] Expense breakdown table is sortable
- [ ] Charts are responsive (ResponsiveContainer wrapping)
- [ ] Tooltips show correctly formatted INR values
