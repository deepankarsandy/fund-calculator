# Loan & Interest EMI Calculator

The Loan & Interest EMI Calculator computes monthly loan installments (EMI), complete loan amortization schedules, prepayments (tenure reduction & interest savings), reducing vs. flat interest methods, and Indian tax deductions under Section 24(b) and Section 80C.

---

## 1. Mathematical Formulas & Logic

### Reducing Balance Monthly EMI (Default)

In reducing balance loans (standard for Indian home loans and public bank car loans), interest is charged strictly on the outstanding balance at the end of each month:

$$E = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

Where:

- $P$ = Principal loan amount (₹)
- $R$ = Annual interest rate (% p.a.)
- $r$ = Monthly interest rate ($R / 1200$)
- $n$ = Total tenure in months ($t \times 12$)
- $E$ = Equated Monthly Installment (EMI) (₹)
- Total Amount Payable = $E \times n$
- Total Interest Payable = $(E \times n) - P$

### Flat Interest Rate Loan Method

In a flat rate loan (frequently advertised by NBFCs and consumer/vehicle loan dealers), interest is calculated on the original full principal amount for the entirety of the tenure, ignoring all principal repaid over time:

$$\text{Total Flat Interest} = P \times \frac{R}{100} \times \left(\frac{n}{12}\right)$$
$$\text{Total Amount Payable} = P + \text{Total Flat Interest}$$
$$\text{Monthly EMI (Flat)} = \frac{P + \text{Total Flat Interest}}{n}$$

- **Effective Reducing APR Warning**: Because principal is not discounted as it is repaid, a flat rate loan has an effective reducing APR of approximately $1.8\times$ to $1.95\times$ the nominal flat rate:
  $$\text{Equivalent APR}_{\text{reducing}} \approx R_{\text{flat}} \times \left(\frac{2n}{n + 1}\right)$$
  For example, a 10% flat rate loan over 5 years is effectively an ~18.5% reducing APR loan.

### Pre-Payment & Accelerated Amortization

Indian borrowers frequently accelerate loan closure via extra monthly prepayments or periodic lump-sum prepayments.

- For each month $m \in [1..n]$:
  $$\text{Interest Component}_m = \text{Remaining Balance}_{m-1} \times r$$
  $$\text{Principal Component}_m = (E - \text{Interest Component}_m) + \text{Extra Prepayment}_m$$
  $$\text{Remaining Balance}_m = \max(0, \text{Remaining Balance}_{m-1} - \text{Principal Component}_m)$$
- **Total Interest Saved**: $\text{Original Total Interest} - \text{Revised Total Interest}$
- **Tenure Reduction**: Original loan months minus revised payoff month.

---

## 2. Indian Market Defaults & Tax Deductions

### Default Baseline Parameters (India)

- **Loan Category Presets**:
  - Home Loan (Default): ₹40,00,000, 8.5% p.a., 20 Years (Reducing Balance)
  - Car Loan: ₹8,00,000, 9.0% p.a., 5 Years
  - Personal Loan: ₹3,00,000, 13.0% p.a., 3 Years
- **Interest Method Switch**:
  - **Reducing Balance (Default)**: Recommended and standard across Indian commercial banks.
  - **Flat Rate**: Available for comparing dealer quotes and consumer financing.

### Indian Income Tax Deductions (Home Loans)

For self-occupied residential property loans under the **Old Tax Regime**:

1. **Section 24(b) (Interest Deduction)**:
   - Up to **₹2,00,000** per financial year is deductible from taxable income.
2. **Section 80C (Principal Repayment Deduction)**:
   - Up to **₹1,50,000** per financial year can be claimed on the principal repayment portion (subject to overall ₹1.5L 80C limit).
3. **Tax Bracket Savings**:
   $$\text{Annual Tax Savings} = \min(\text{Annual Interest}, 200000) \times \text{Tax Slab} + \min(\text{Annual Principal}, 150000) \times \text{Tax Slab}$$
4. **New Tax Regime Note**: Under the New Tax Regime (Section 115BAC), deductions under Section 24(b) for self-occupied properties and Section 80C are not applicable.

---

## 3. Local Storage Architecture

All user configuration and simulation outputs are persisted in the browser:

- **Inputs Key**: `fundcalc_loan_emi_inputs_v1`
  - Stores loan amount, interest rate, tenure, interest method (`'reducing' | 'flat'`), loan type preset, prepayments, tax deduction toggles.
- **Results Key**: `fundcalc_loan_emi_results_v1`
  - Stores monthly EMI, total interest, total payment, equivalent APR, interest saved, tenure reduction, tax savings, and amortization schedule.

Zero financial data is transmitted to external servers.
