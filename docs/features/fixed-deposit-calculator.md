# Bank Fixed Deposit (FD) Calculator

The Fixed Deposit (FD) Calculator calculates maturity returns, effective annual yields, interest payout options (cumulative vs non-cumulative), TDS deductions under Section 194A, and income tax slab liabilities based on Reserve Bank of India (RBI) guidelines.

---

## 1. Mathematical Formulas & Logic

### Cumulative (Reinvestment) FD Compounding

Per RBI regulations, Indian banks compound FD interest on a **quarterly** basis ($n = 4$):

$$A = P \times \left(1 + \frac{r}{n}\right)^{n \times t}$$

Where:

- $P$ = Principal deposit amount (₹)
- $r$ = Annual nominal interest rate (decimal, e.g. 0.07 for 7.0%)
- $n$ = Compounding frequency per year ($n = 4$ for quarterly, $n = 12$ for monthly, $n = 2$ for semi-annually, $n = 1$ for annually)
- $t$ = Deposit tenure in years
- $A$ = Total maturity amount (₹)
- Total Interest Earned: $I = A - P$

### Simple Interest FD (Tenures $< 180$ Days or Short-Term)

$$A = P \times (1 + r \times t)$$

### Non-Cumulative Regular Payout FD

In non-cumulative deposits, interest is paid out periodically (monthly or quarterly) into the investor's savings account rather than being reinvested:

- Periodic Payout Amount:
  $$\text{Payout} = \frac{P \times r}{\text{Payouts Per Year}}$$
- Total Principal Returned at Maturity: $P$
- Total Interest Received: $P \times r \times t$

### Effective Annual Yield (APY)

$$\text{Effective Yield} = \left[\left(1 + \frac{r}{n}\right)^n - 1\right] \times 100\%$$

### Inflation Adjustment (Real Purchasing Power)

$$\text{Real Maturity Value} = \frac{A}{(1 + g)^t}$$

---

## 2. Indian Market Defaults & Tax Treatment

### Default Baseline Parameters (India)

- **Principal Deposit Amount**: ₹2,00,000 (configurable from ₹5,000 to ₹1,00,00,000)
- **Interest Rate**: 7.0% p.a. (standard Indian scheduled commercial bank rate for 1 to 5-year deposits)
- **Senior Citizen Option**: +0.50% additional interest bonus (standard practice across Indian banks), raising rate to 7.50%
- **Compounding Frequency**: Quarterly ($n = 4$, Indian banking standard)
- **Deposit Tenure**: 5 Years (configurable in years and months)
- **Assumed General Inflation**: 6.0% p.a.

### Indian Taxation on FD Interest

1. **Tax Treatment ("Income from Other Sources")**:
   - Unlike equity mutual funds, FD interest is not eligible for capital gains tax benefits.
   - It is added to the taxpayer's total annual taxable income and taxed at their applicable income tax slab rate (e.g. 0%, 5%, 10%, 15%, 20%, 30%). Default modeled at 20%.
2. **TDS (Tax Deducted at Source) under Section 194A**:
   - Banks deduct 10% TDS if aggregate annual FD interest exceeds **₹40,000** for regular individuals.
   - For Senior Citizens, the annual threshold under Section 80TTB is **₹50,000**.
   - TDS rate is 20% if PAN is not submitted.
   - Form 15G (individuals $<60$ yrs) / Form 15H (senior citizens $\ge 60$ yrs) can be submitted for zero TDS deduction if total taxable income is below basic exemption limit.
3. **Net In-Hand Maturity Amount**:
   $$\text{Total Tax Liability} = I \times \text{Slab Rate}$$
   $$\text{Net Post-Tax Maturity} = A - \text{Total Tax Liability}$$

---

## 3. Local Storage Architecture

All user configuration and simulation outputs are persisted locally in the browser:

- **Inputs Key**: `fundcalc_fd_inputs_v1`
  - Stores principal, tenure (years/months), base interest rate, senior citizen toggle, compounding frequency, payout mode, tax slab rate, Form 15G/H submission status.
- **Results Key**: `fundcalc_fd_results_v1`
  - Stores maturity amount, total interest earned, effective yield, TDS amount, net post-tax maturity, real purchasing power, periodic payout (if non-cumulative), and yearly schedule.

Zero data leaves the user's browser, maintaining absolute data privacy.
