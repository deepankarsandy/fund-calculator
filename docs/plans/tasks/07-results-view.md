# Task 07 — Results View (Cards, Charts & Projections)

**Goal:** Present the calculated corpus, scenario comparisons, visual charts, and a detailed projection table with transparent explanations.

## Components to Render

1. **Scenario Tabs**:
   - Optimistic (e.g. 4% inflation, 7% return)
   - Base (User's configured assumptions, default 5% inflation, 7% return)
   - Conservative (e.g. 6% inflation, 7% return)

2. **Key Metric Summary Cards**:
   - Monthly household budget in today's rupees.
   - Annual household budget in today's rupees.
   - Essential vs Discretionary spending breakdown.
   - Planning horizon (e.g. "55 years: Age 30 → 85").
   - Net return vs inflation.

3. **Highlight Corpus Card**:
   - Required starting corpus in Crores / Lakhs (₹).
   - Existing investable assets.
   - Funding Gap (or Surplus notification).
   - Safety margin buffer (e.g. +15%).

4. **Recharts Visualizations**:
   - Portfolio balance over time (comparing Optimistic, Base, and Conservative depletion curves).
   - Expenses over time (nominal future rupees vs today's purchasing power).
   - Category composition chart.
   - Scenario comparison bar chart.

5. **Year-by-Year Projection Table**:
   - Columns: Year, Age, Opening Balance, Inflated Expenses, Income/Lump Sums, Net Withdrawal, Investment Growth, Closing Balance.
   - Paginated for responsiveness.

6. **Clear Disclaimers & Assumptions Accordion**:
   - Explains the formula used (Growing annuity Convention A).
   - Plain-language financial disclaimers emphasizing that results are planning estimates rather than investment guarantees.

## Acceptance Criteria
- [ ] Switching scenarios updates all cards, charts, and tables instantly.
- [ ] Charts scale responsively to mobile and desktop widths.
- [ ] Disclaimers are prominently visible.
