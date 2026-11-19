# Financial Calculation Engine & Mathematical Formulations

This document details the mathematical algorithms and financial models implemented in `src/domain/calculations/`.

---

## 1. Annualisation of Expenses (`annualise.ts`)

Every recurring or periodic expense item is normalized to an annual cashflow base using exact frequency multipliers:

$$\text{Annual Amount} = \text{Amount} \times \text{Multiplier}$$

| Frequency | Multiplier | Notes |
| :--- | :--- | :--- |
| `monthly` | $12$ | 12 calendar months |
| `quarterly` | $4$ | 4 financial quarters |
| `half_yearly` | $2$ | Biannual |
| `yearly` | $1$ | Annual |
| `weekly` | $52$ | 52 weeks in a calendar year |
| `every_n_years` | $\frac{1}{N}$ | Periodic capital replacement amortized over $N$ years |
| `one_time` | $1$ in year $T$, else $0$ | Single planning year impact |

---

## 2. Growing Annuity Formula (Convention A) (`corpusFormula.ts`)

To fund an annual living expense $E_0$ growing at inflation rate $g$ over $n$ retirement years with an investment portfolio yielding net annual return $r$:

### Case 1: When $r \neq g$
$$C = E_0 \times \left[ \frac{1 - \left(\frac{1 + g}{1 + r}\right)^n}{r - g} \right] \times (1 + r)$$

### Case 2: When $r = g$ (Edge Case)
$$C = E_0 \times \left[ \frac{n}{1 + r} \right] \times (1 + r) = E_0 \times n$$

*(The beginning-of-year adjustment factor $(1 + r)$ accounts for living expenses drawn at the start of each expenditure cycle).*

---

## 3. Active Career Accumulation Modeling (`runScenarios.ts`)

For individuals currently working from current age $A_{\text{current}}$ to retirement age $A_{\text{ret}}$:

1. **Active Income Escalation**:
   $$I_t = I_0 \times (1 + g_{\text{salary}})^t$$

2. **Inflated Living Cost**:
   $$E_t = \sum_{i} E_{i,0} \times (1 + g_i)^t$$

3. **Annual Investable Surplus**:
   $$S_t = \max(0, I_t - E_t)$$

4. **Portfolio Accumulation Recursive Step**:
   $$P_t = \left( P_{t-1} + S_t \right) \times (1 + r)$$

At retirement age $A_{\text{ret}}$, $P_{A_{\text{ret}}}$ represents the **Projected Accumulated Corpus ($P_R$)**.

---

## 4. Retirement Drawdown Simulation (`projectCashflows.ts`, `simulatePortfolio.ts`)

In retirement ($t > A_{\text{ret}}$), active income stops ($I_t = 0$).

1. **Net Withdrawal Deficit**:
   $$W_t = \max(0, E_t - O_t)$$
   *(where $O_t$ is reliable guaranteed post-retirement income such as pension or rental).*

2. **Portfolio Depletion Recursive Step**:
   $$B_t = (B_{t-1} - W_t) \times (1 + r)$$

3. **Depletion Detection**:
   If $B_t < 0$ at any year $t$, the age is recorded as the **Depletion Age ($A_{\text{deplete}}$)**.

---

## 5. Multi-Scenario & Sensitivity Matrix (`runScenarios.ts`)

The engine computes 6 distinct scenarios simultaneously:
- **Optimistic**: Low inflation (5%), High return (12%)
- **Base**: Realistic inflation (6%), Moderate return (10%)
- **Conservative**: High inflation (7.5%), Low return (8.5%)
- **Bare Minimum Lifestyle**: Non-essential items = ₹0
- **Comfortable Lifestyle**: Standard baseline
- **Luxury Lifestyle**: Discretionary = 1.5×, Essentials = 1.15×
