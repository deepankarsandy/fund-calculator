# Systematic Investment Plan (SIP) & Systematic Withdrawal Plan (SWP) Calculator

The SIP & SWP Calculator enables users to model both wealth accumulation (SIP) and retirement cash flow decumulation (SWP) from Indian mutual funds over time, with compound interest, annual step-up adjustments, inflation discounting, and post-Budget 2024 Indian capital gains taxation.

---

## 1. Mathematical Formulas & Logic

### Regular Monthly SIP Compounding

For an investment of $M$ per month for $n$ total months at an annual nominal return rate $r$ (monthly rate $i = \frac{r}{12}$):

$$A = M \times \left[ \frac{(1 + i)^n - 1}{i} \right] \times (1 + i)$$

Where:

- $M$ = Monthly investment amount (₹)
- $r$ = Annual expected rate of return (decimal)
- $i$ = Monthly compounded return rate ($r / 12$)
- $n$ = Total number of monthly installments ($t \times 12$ months)
- $A$ = Total maturity / gross corpus accumulated (₹)
- Total Invested Amount: $P = M \times n$
- Estimated Gross Wealth Gain: $G = A - P$

### Annual Step-Up SIP (Top-Up SIP)

Many Indian investors increase their monthly SIP contribution each year as their annual salary or income grows (e.g. 5% to 15% annual step-up).

- In Year 1: Monthly investment is $M_1 = M$
- In Year $k$: Monthly investment is $M_k = M_{k-1} \times (1 + s) = M \times (1 + s)^{k-1}$
  where $s$ is the annual step-up percentage.

### Systematic Withdrawal Plan (SWP)

In retirement or financial independence, investors withdraw a fixed monthly amount $W$ from an initial investment corpus $P$, while the remaining balance continues to generate returns at rate $r$:

- In month $m$:
  $$\text{Balance after withdrawal} = \text{Balance}_{m-1} - W_m$$
  $$\text{Month-end Balance}_m = \text{Balance after withdrawal} \times (1 + i)$$
- If the corpus cannot sustain the withdrawal rate, the calculator pinpoints the exact **depletion year and month**.
- **Inflation-Indexed SWP**: Supports annual percentage step-ups to match rising living costs over a 20-30 year retirement horizon.

### Inflation Adjustment (Real Purchasing Power)

To reflect real purchasing power at today's cost of living with an annual general inflation rate $g$ over $t$ years:

$$\text{Real Value} = \frac{A}{(1 + g)^t}$$

---

## 2. Indian Market Defaults & Tax Treatment

### Default Baseline Parameters (India)

- **SIP Monthly Contribution**: ₹10,000 / month (configurable from ₹500 to ₹10,00,000)
- **SWP Initial Corpus**: ₹50,00,000 (configurable from ₹5,00,000 to ₹20,00,00,000)
- **SWP Monthly Withdrawal**: ₹35,000 / month (configurable from ₹5,000 to ₹2,00,000)
- **Expected Return Rate**: 12.0% p.a. for SIP (Nifty 50 equity base), 8.5% p.a. for SWP (Balanced Advantage / Conservative Hybrid)
- **Time Horizon**: 10 Years for SIP, 20 Years for SWP
- **Assumed Inflation Rate**: 6.0% p.a.

### Capital Gains Tax (Union Budget 2024 Regime)

- **Holding Period**: Equity mutual funds held for $>12$ months qualify for Long-Term Capital Gains (LTCG).
- **LTCG Tax Rate**: 12.5% (effective July 23, 2024).
- **Tax-Free Exemption**: The first ₹1.25 Lakh (₹1,25,000) of cumulative long-term capital gains across equity assets in a financial year is exempt from tax.
- **SWP Taxation**: In India, each SWP payout is treated as a partial redemption of units on a FIFO basis, with the gain portion eligible for the ₹1.25 Lakh annual LTCG exemption.

---

## 3. Local Storage Architecture

All user configuration and simulation outputs are persisted locally in the browser with isolated keys:

- **Inputs Key**: `fundcalc_sip_inputs_v1`
  - Stores mode (`'sip' | 'swp'`), monthly amounts, expected return, tenure, step-up percentages, inflation rate, tax settings.
- **Results Key**: `fundcalc_sip_results_v1`
  - Stores summary metrics: total invested/withdrawn, remaining balance, estimated returns, tax liabilities, depletion milestones, and annual breakdown schedules.

Zero data leaves the user's browser, maintaining absolute data privacy.
