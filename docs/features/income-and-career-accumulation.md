# Income, Savings & Career Accumulation

The application models the full career earning arc, annual salary increment hikes, ongoing living expenses, and the resulting compounding wealth accumulation until retirement age.

---

## Overview

Unlike basic retirement calculators that assume retirement starts immediately on Day 1, this calculator bridges the gap for users who are currently working. It accurately projects how active salary surplus compounds over your remaining working years, computing both your **Target Corpus Needed at Retirement** and your **Projected Accumulated Corpus** at that milestone.

---

## Key Features

### 1. Active Take-Home Income & Salary Hikes

- **Monthly Take-Home Income**: Net post-tax salary or regular business income.
- **Income End Age (Retirement Age)**: Planned age of retirement (e.g., 55 or 60).
- **Annual Salary Increment Rate**: Expected annual hike percentage (default: 7.0%/year).

### 2. Career Surplus Compounding

- For each working year $t$ from current age to retirement age:
  1. Salary grows at the annual increment rate: $\text{Income}_t = \text{Income}_0 \times (1 + g_{\text{salary}})^t$.
  2. Living expenses grow at their respective inflation rates: $\text{Expenses}_t$.
  3. Annual Net Surplus = $\text{Income}_t - \text{Expenses}_t$.
  4. Surplus is added to the investment portfolio and compounds at the portfolio net return rate ($r$).

### 3. Existing Liquid Assets & Outstanding Debt

- **Existing Liquid Investable Assets**: Mutual funds, stocks, PF/EPF/PPF, bank FDs, and cash.
- **Liabilities & Outstanding Loans**: Home loans, vehicle loans, or personal debt, cleanly accounted for in net starting wealth.

### 4. Post-Retirement Guaranteed Cash Flows

- **Other Recurring Inflows**: Support for post-retirement pension, rental income, or annuity cash flows with customizable start and end years.
- **Future Lump Sum Inflows**: Single-occurrence cash windfalls (inheritance, property sales, mature policies) credited in designated planning years.

### 5. Linked SIP & Fixed Deposit (FD) Inflow Cards

- Dedicated standalone cards for **SIP & SWP Inflows** and **Fixed Deposit Inflows** directly link saved calculator results without manual entry.
- Supports dual-level controls: master inclusion toggle plus granular include/exclude toggles for each sub-type (Regular SIP, SWP, Combo, Cumulative FD, Monthly Payout FD, Quarterly Payout FD).
- For complete details, see [Linked Calculators Integration](linked-calculators.md).

### 6. Self-Funded Plan Detection

- If projected accumulated savings exceed the retirement target corpus, the engine flags the plan as **Fully Self-Funded (₹0 Extra Starting Corpus Needed Today)**.
