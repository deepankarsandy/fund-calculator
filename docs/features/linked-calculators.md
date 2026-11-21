# Linked Calculators Integration (SIP, Fixed Deposit & Loan EMI)

The Lifetime Cost & Corpus Calculator suite features seamless, non-destructive synchronization between helper calculators (SIP, Fixed Deposit, Loan EMI) and the central Retirement Fund Planner.

---

## Overview

Rather than forcing users to manually calculate and re-enter complex maturity values, periodic interest cashflows, or debt amortizations, the application links data directly from your saved calculator sessions into:

1. **Step 2: Income, Savings & Assets** — SIP & Fixed Deposit cash inflows.
2. **Step 3: Living Expenses** — Contractual fixed Loan EMIs (Financial category).

---

## Standalone Cards Architecture

Previously presented within a single tabbed container, linked calculators now render as **independent, standalone cards** for transparent, simultaneous visibility:

1. **Linked SIP & SWP Inflows Card (`LinkedSipInflowCard`)**:
   - Manages wealth accumulation and systematic withdrawal cashflows.
   - Emerald theme highlighting compounding investments and post-retirement payouts.
2. **Linked Fixed Deposit Inflows Card (`LinkedFdInflowCard`)**:
   - Manages bank fixed deposit investments.
   - Dedicated blue card displaying guaranteed maturity lump sums and periodic interest income.
3. **Linked Loan Liability Card (`LinkedLoanExpenseCard`)**:
   - Manages household debt obligations in living expenses.
   - Amber theme displaying contractual loan repayments with guaranteed 0% inflation.

---

## Dual-Level Inclusion & Exclusion Controls

Each linked calculator card provides two levels of control:

- **Master Level (Full Include / Exclude)**: Toggle the entire calculator's data in or out of the retirement plan with a single click.
- **Granular Sub-Type Level (Individual Include / Exclude)**: Selectively toggle individual sub-types on or off to match your real-world financial structure.

### 1. SIP & SWP Sub-Types

- **Regular SIP (Maturity Lump Sum)**:
  - Monthly investment compounds over tenure ($N$ years).
  - Pre-fills net post-tax maturity corpus into **Future Lump Sums** (`futureContributions`) at Year $N$.
- **SWP (Systematic Withdrawal Plan)**:
  - Monthly cashflow payout drawn from capital.
  - Pre-fills regular annual cashflow into **Other Income** (`otherIncome`) from Year 1 to Year $N$, directly offsetting living costs.
- **SIP-to-SWP Combo Plan**:
  - Two-phase modeling: Phase 1 accumulation during working years, followed by Phase 2 lifetime pension.
  - Pre-fills regular annual pension into **Other Income** starting strictly post-accumulation (Year $N_1 + 1$ to Year $N_1 + N_2$).

### 2. Fixed Deposit (FD) Sub-Types

- **Cumulative FD (Compounded Maturity)**:
  - Reinvests quarterly compound interest.
  - Pre-fills net post-tax maturity proceeds into **Future Lump Sums** at tenure end.
- **Monthly Payout FD (Regular Income)**:
  - Monthly interest credited as cashflow into **Other Income** across tenure.
  - Pre-fills 100% principal return as a **Future Lump Sum** at tenure maturity.
- **Quarterly Payout FD (Quarterly Income)**:
  - Quarterly interest payouts credited into **Other Income** across tenure.
  - Pre-fills 100% principal return as a **Future Lump Sum** at tenure maturity.

### 3. Loan EMI Sub-Types

- **Home Loan**: Contractual 20-year reducing balance housing mortgage.
- **Car Loan**: Contractual 5-year medium-term auto loan EMI.
- **Personal Loan**: Contractual 3-year short-term loan obligation.
- **Custom Loan**: Direct sync of user-configured loan amount, interest rate, tenure, and prepayments from the Loan EMI Calculator.

---

## Simultaneous Multi-Type Linking

Users can activate any combination of sub-types at the same time:

- **Multiple Loans**: A household can carry both a **Home Loan** (₹34,713/mo for 20 yrs) and a **Car Loan** (₹16,607/mo for 5 yrs) simultaneously. Both are added as individual line items to the Financial expense category.
- **Multiple Inflows**: A user can simultaneously link a **Regular SIP** (for lump sum wealth building) and an **SWP** or **Monthly FD** (for recurring secondary income).

---

## Financial Precision & Inflation Exemptions

- **Fixed 0% Inflation for Loans**: Unlike lifestyle expenses (groceries, utilities, healthcare) which compound annually with inflation, loan repayments are contractual fixed nominal obligations. The engine enforces an explicit `0%` inflation rate on all linked loan items.
- **Automatic Payoff Drop-Off**: Loan obligations terminate strictly after their configured payoff year ($N$), accurately modeling increased disposable income once loans are cleared.

---

## Non-Destructive Merging & Deep Links

- **User Data Safety**: Manual income sources (rental income, custom insurance plans) and manual lump sums (land sales, inheritances) are 100% preserved. System-linked items carry unique `linked-*` identifiers and never overwrite user inputs.
- **Direct Deep Links**: Each card features a direct navigation shortcut (`Edit in SIP Calculator ↗`, `Edit in Fixed Deposit Calculator ↗`, `Edit in Loan EMI Calculator ↗`) for effortless parameter tuning.
