# Loan & Interest EMI Calculator

The Loan & Interest EMI Calculator computes monthly loan installments (EMI), complete loan amortization schedules, prepayments (tenure reduction & interest savings), and Indian tax deductions under Section 24(b) and Section 80C.

---

## 1. Mathematical Formulas & Logic

### Reducing Balance Monthly EMI Formula
For a loan principal of $P$ at an annual interest rate $R$ (monthly interest rate $r = \frac{R}{12 \times 100}$) repaid over $n$ total monthly installments ($t \times 12$ months):

$$E = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

Where:
- $P$ = Principal loan amount (₹)
- $R$ = Annual interest rate (% p.a.)
- $r$ = Monthly interest rate ($R / 1200$)
- $n$ = Total tenure in months
- $E$ = Equated Monthly Installment (EMI) (₹)
- Total Amount Payable = $E \times n$
- Total Interest Payable = $(E \times n) - P$

### Pre-Payment & Accelerated Amortization
Indian borrowers frequently accelerate loan closure via extra monthly prepayments or periodic lump-sum prepayments.
- For each month $m \in [1..n]$:
  $$\text{Interest Component}_m = \text{Remaining Balance}_{m-1} \times r$$
  $$\text{Principal Component}_m = (E - \text{Interest Component}_m) + \text{Extra Prepayment}_m$$
  $$\text{Remaining Balance}_m = \max(0, \text{Remaining Balance}_{m-1} - \text{Principal Component}_m)$$
- **Total Interest Saved**: $\text{Original Total Interest} - \text{Revised Total Interest}$
- **Tenure Reduction**: Original loan months minus revised payoff month.

### Inflation-Adjusted Total Outflow
$$\text{Real Cost of Loan} = \sum_{m=1}^{N} \frac{E}{(1 + g)^{m/12}}$$

---

## 2. Indian Market Defaults & Tax Deductions

### Default Baseline Parameters (India)
- **Loan Category Presets**:
  - Home Loan (Default): ₹40,00,000, 8.5% p.a., 20 Years
  - Car Loan: ₹8,00,000, 9.0% p.a., 5 Years
  - Personal Loan: ₹3,00,000, 13.0% p.a., 3 Years
- **Standard Benchmark**: Floating home loan interest rates linked to RBI Repo Rate + Spread (~8.5% to 9.0%).

### Indian Income Tax Deductions (Home Loans)
For self-occupied residential property loans under the **Old Tax Regime**:
1. **Section 24(b) (Interest Deduction)**:
   - Up to **₹2,00,000** per financial year is deductible from taxable income.
2. **Section 80C (Principal Repayment Deduction)**:
   - Up to **₹1,50,000** per financial year can be claimed on the principal repayment portion (subject to overall ₹1.5L 80C limit).
3. **Tax Bracket Savings**:
   $$\text{Annual Tax Savings} = \min(\text{Annual Interest}, 200000) \times \text{Tax Slab} + \min(\text{Annual Principal}, 150000) \times \text{Tax Slab}$$
4. **New Tax Regime Note**: Under the New Tax Regime (Section 115BAC), deductions under Section 24(b) for self-occupied properties and Section 80C are not applicable. The calculator allows toggling regimes and customizing tax brackets (e.g. 20% or 30%).

---

## 3. Local Storage Architecture

All user configuration and simulation outputs are persisted in the browser:
- **Inputs Key**: `fundcalc_loan_emi_inputs_v1`
  - Stores loan amount, interest rate, tenure, loan type preset, monthly prepayment, annual prepayment, tax deduction toggles, tax slab.
- **Results Key**: `fundcalc_loan_emi_results_v1`
  - Stores monthly EMI, total interest payable, total payment, prepayment interest savings, tenure months saved, annual tax savings, and amortization schedule.

Zero financial data is transmitted to external servers.
