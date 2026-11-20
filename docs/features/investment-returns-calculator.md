# Investment & Returns Calculator

The Investment & Returns Calculator allows investors to model lump-sum compound growth and multi-asset portfolio projections across Indian asset classes (Equity, Debt, Gold, Cash/Liquid), factoring in differential asset returns, inflation discounting, and post-Budget 2024 Indian capital gains taxation.

---

## 1. Mathematical Formulas & Logic

### Compound Interest Growth (Lump-Sum)
For an initial lump-sum investment of principal $P$ compounded annually over $t$ years at an annual expected return rate $r$:

$$A = P \times (1 + r)^t$$

Where:
- $P$ = Initial lump-sum investment (₹)
- $r$ = Annual nominal rate of return (decimal)
- $t$ = Investment time horizon (years)
- $A$ = Total gross future value (₹)
- Gross Capital Gain: $G = A - P$

### Multi-Asset Portfolio Blending
Investors can allocate their portfolio across four prominent Indian asset classes:
$$\sum_{k} w_k = 100\%$$

Where each asset class $k$ has weight $w_k$, initial investment $P_k = P \times \frac{w_k}{100}$, and expected return $r_k$:
$$A_k = P_k \times (1 + r_k)^t$$
$$\text{Gross Portfolio Corpus } A = \sum_{k} A_k$$
$$\text{Effective Blended Return } r_{\text{blended}} = \left(\frac{A}{P}\right)^{1/t} - 1$$

### Inflation Adjustment (Real Purchasing Power)
To calculate purchasing power in today's currency against general inflation $g$:

$$\text{Real Value} = \frac{A}{(1 + g)^t}$$

---

## 2. Indian Market Defaults & Tax Treatment

### Default Baseline Parameters (India)
- **Initial Lump-Sum Investment**: ₹5,00,000 (configurable from ₹10,000 to ₹10,00,00,000)
- **Time Horizon**: 10 Years (configurable from 1 to 40 years)
- **Assumed General Inflation**: 6.0% p.a.

### Asset Class Defaults & Budget 2024 Taxation
1. **Domestic Equity (Nifty / Mutual Funds)**:
   - Default Allocation: 50%
   - Expected Return: 12.0% p.a.
   - Taxation: Long-Term Capital Gains (LTCG) at 12.5% for holding $>12$ months, with aggregate annual exemption of ₹1,25,000.
2. **Debt & Fixed Income Instruments**:
   - Default Allocation: 30%
   - Expected Return: 7.0% p.a.
   - Taxation: Post-Finance Act 2023, gains on specified debt funds are taxed at individual income tax slab rates (default modeled at 20%).
3. **Gold (ETFs, SGBs, Physical)**:
   - Default Allocation: 10%
   - Expected Return: 9.0% p.a.
   - Taxation: Budget 2024 rationalized non-equity financial assets: LTCG at 12.5% for holding $>24$ months.
4. **Cash / Liquid & Bank Deposits**:
   - Default Allocation: 10%
   - Expected Return: 6.5% p.a.
   - Taxation: Taxed at slab rates (default modeled at 20%).

### Post-Tax Corpus
$$\text{Total Tax} = \sum_{k} \text{Tax}_k$$
$$\text{Net In-Hand Corpus} = A - \text{Total Tax}$$

Users can toggle between a simple single-rate return model and the multi-asset allocation model, as well as customize all return expectations and tax assumptions.

---

## 3. Local Storage Architecture

All user configuration and simulation outputs are saved in the browser:
- **Inputs Key**: `fundcalc_investment_inputs_v1`
  - Stores principal, tenure, mode (simple vs multi-asset), asset allocations, expected returns, tax settings.
- **Results Key**: `fundcalc_investment_results_v1`
  - Stores total invested, gross returns, gross corpus, tax liabilities, net corpus, purchasing power, and year-by-year schedule.

All calculations execute strictly locally on the client without external network calls.


---

## 4. Custom Policy & Cash Flow XIRR Calculator

The calculator includes a dedicated **Custom Plan / Policy (XIRR)** tab designed specifically to evaluate complex, staggered financial products sold by insurance companies and financial institutions (e.g. Guaranteed Income Plans, Endowment Policies, Deferred Annuities, and Money-Back Policies).

### Key Capabilities & Logic

1. **Annualized Internal Rate of Return (IRR / XIRR)**:
   Solves for the exact rate $r$ satisfying the Net Present Value equation:
   $$\sum_{t=0}^{T} \frac{C_t}{(1 + r)^t} = 0$$
   Where $C_t = \text{Inflow}_t - \text{Outflow}_t$ for each period $t$. Computed using high-precision Newton-Raphson method with automatic bisection bracket fallback.

2. **Inflation-Adjusted Real Return & Present Purchasing Power**:
   - Computes real return rate via Fisher formula:
     $$r_{\text{real}} = \frac{1 + \text{XIRR}}{1 + \text{inflation}} - 1$$
   - Discounts each future payout into today's purchasing power using the general inflation rate:
     $$\text{PV}_t = \frac{\text{Payout}_t}{(1 + \text{inflation})^t}$$
   - Quantifies the exact percentage of purchasing power eroded by multi-decade inflation.

3. **Flexible Investment & Return Structures**:
   - **Investment Phase**: Per-year investment or total investment distributed evenly across tenure; customizable duration and payment timing (start of year vs end of year).
   - **Payout Phase**:
     - *Annual Income + Maturity Lump Sum*: Regular annual income across duration, plus terminal lump sum or Return of Premium (ROP).
     - *Annual Income Only*: Regular annuity/pension across retirement years.
     - *Single Lump Sum*: Traditional endowment maturity.
   - **Custom Cash Flow Table**: Toggle to customize individual years for policies with non-uniform benefits (e.g. survival benefits at Year 5, 10, 15).

4. **Opportunity Cost Benchmarks**:
   Simulates investing the identical annual cash flows into:
   - **Public Provident Fund (PPF)** / Sovereign Debt at 7.1% p.a.
   - **Nifty Index Mutual Fund** / Equity at 12.0% p.a.
   - User-defined benchmark rate.

5. **Storage Keys**:
   - `fundcalc_custom_plan_inputs_v1`
   - `fundcalc_custom_plan_results_v1`
   - `fundcalc_investment_tab_v1`
