# Systematic Investment Plan (SIP) Calculator

The SIP Calculator enables users to project wealth accumulation from monthly mutual fund investments over time with compound interest, optional annual step-up contributions, inflation discounting, and post-Budget 2024 Indian capital gains taxation.

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
- The total future value is the sum of future values of each year's monthly installments compounded until the end of the total tenure $t$.

### Inflation Adjustment (Real Purchasing Power)
To reflect real purchasing power at today's cost of living with an annual general inflation rate $g$ over $t$ years:

$$\text{Real Value} = \frac{A}{(1 + g)^t}$$

---

## 2. Indian Market Defaults & Tax Treatment

### Default Baseline Parameters (India)
- **Monthly SIP Contribution**: ₹10,000 / month (configurable from ₹500 to ₹10,00,000)
- **Expected Return Rate**: 12.0% p.a. (historical average of Indian equity indices, e.g., Nifty 50 / Sensex over 10-15+ year periods)
- **Investment Period**: 10 Years (configurable from 1 to 40 years)
- **Annual Step-Up**: 10% per year (optional toggle)
- **Assumed Inflation Rate**: 6.0% p.a. (standard RBI target band benchmark)

### Capital Gains Tax (Union Budget 2024 Regime)
- **Holding Period**: Equity mutual funds held for $>12$ months qualify for Long-Term Capital Gains (LTCG).
- **LTCG Tax Rate**: 12.5% (effective July 23, 2024).
- **Tax-Free Exemption**: The first ₹1.25 Lakh (₹1,25,000) of cumulative long-term capital gains across equity assets in a financial year is exempt from tax.
- **Estimated Net Tax Liability**:
  $$\text{Taxable Gain} = \max(0, G - \text{Exemption})$$
  $$\text{Estimated LTCG Tax} = \text{Taxable Gain} \times 12.5\%$$
- **Post-Tax Corpus**:
  $$\text{Net Corpus} = A - \text{Estimated LTCG Tax}$$
- **Full Customizability**: The user can toggle capital gains tax modeling on/off and customize the tax rate (e.g. 12.5%, 20% STCG, or custom slab) and exemption threshold.

---

## 3. Local Storage Architecture

All user configuration and simulation outputs are persisted locally in the browser with isolated keys:
- **Inputs Key**: `fundcalc_sip_inputs_v1`
  - Stores monthly amount, expected return, tenure, step-up percentage, inflation rate, tax settings.
- **Results Key**: `fundcalc_sip_results_v1`
  - Stores summary metrics: total invested, estimated returns, gross corpus, estimated tax, net post-tax corpus, inflation-adjusted corpus, and annual breakdown snapshots.

Zero data leaves the user's browser, maintaining absolute data privacy.
