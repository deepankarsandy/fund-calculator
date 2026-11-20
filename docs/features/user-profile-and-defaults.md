# User Profile & Centralized Financial Defaults

The **User Profile & Defaults** system centralizes personal demographics, income, taxation brackets, inflation benchmarks, and investment return expectations into a single configuration hub that synchronizes across the entire application.

---

## 1. Overview & Purpose

Previously, each calculator and wizard step required users to re-enter core demographic and financial assumptions (such as current age, retirement age, expected inflation, or return rates).

The **User Profile** solves this by establishing a unified financial identity:

- **Configure Once, Use Everywhere**: Establish baseline assumptions that pre-populate both the comprehensive Lifetime Cost Corpus Calculator and all standalone calculators (SIP, FD, Loan EMI, Multi-Asset Investment).
- **Two-Way Synchronization**: Updating settings in the profile page or modal can automatically propagate to all calculators with a single click.
- **Client-Side Reactive Updates**: Updates dispatch custom window events (`fundcalc_user_profile_updated`), instantly updating all open components without requiring a full page refresh.

---

## 2. Configurable Profile Parameters

### A. Demographics & Identity

- **Name & Date of Birth**: Birthdate input dynamically computes exact calendar age while accounting for leap years and reference dates.
- **Current Age**: Starting baseline age ($t = 0$), defaulting to 30.
- **Retirement Target Age**: Planned milestone when active income ceases, defaulting to 60.
- **Planning Life Expectancy**: Terminal age through which the corpus must remain solvent, defaulting to 85.
- **Location Tier**: Rural (0.6×), Small Town / Tier 3 (1.0× baseline), City / Tier 2 (1.6×), or Tier 1 Metro (2.5×).
- **Lifestyle Baseline**: Bare Minimum, Comfortable, or Luxury / Aspirational.

### B. Income & Accumulation Parameters

- **Monthly In-Hand Income**: Baseline net monthly earnings.
- **Annual Income Increment**: Expected annual career salary hike rate (e.g., 7.0% p.a.).
- **Existing Liquid Corpus**: Current accumulated savings & investment balance at starting age.
- **Monthly Savings Allocations**: Baseline breakdown across Provident Fund (EPF/VPF), National Pension System (NPS), and Mutual Fund SIPs.

### C. Taxes & Regimes

- **Income Tax Bracket**: Marginal slab rate (0%, 5%, 10%, 15%, 20%, 30%).
- **Tax Regime**: New Tax Regime (Section 115BAC default) vs. Old Tax Regime.
- **Long-Term Capital Gains (LTCG) Rate**: Union Budget 2024 equity LTCG rate (12.5%).

### D. Inflation Benchmarks (Overall vs. Sector-Specific)

- **Inflation Mode**: Toggle between **Overall Inflation** (single flat rate, default 6.0%) or **Sector-Specific Inflation**.
- **Calibrated Indian Sector Rates**:
  - **Healthcare**: 7.0% p.a. (historically runs higher due to medical inflation)
  - **Family & Education**: 7.0% p.a. (higher tuition and childcare costs)
  - **Housing & Rent**: 5.0% p.a.
  - **Food & Groceries**: 5.0% p.a.
  - **Utilities & Transport**: 5.0% p.a.
  - **Technology & Gadgets**: 3.0% p.a. (deflationary electronic cycles)
  - **Personal, Financial & Emergency**: 5.0% p.a.

### E. Baseline Return & Interest Expectations

- **Equity Mutual Fund Returns**: Default benchmark 12.0% p.a. (Nifty 50 long-term CAGR).
- **Debt / Fixed Income Returns**: Default benchmark 7.0% p.a.
- **Fixed Deposit (FD) Rate**: Default benchmark 7.0% p.a.
- **Benchmark Loan Interest Rate**: Default benchmark 8.5% p.a.

---

## 3. Propagation to Calculators

When saving the profile with **“Sync with All Calculators”** enabled, values propagate automatically:

```
┌────────────────────────────────────────────────────────┐
│                      User Profile                      │
│             (fundcalc_user_profile_v1)                 │
└───────────┬───────────────┬──────────────┬─────────────┘
            │               │              │
            ▼               ▼              ▼
     ┌──────────────┐ ┌───────────┐ ┌──────────────┐
     │SIP Calculator│ │FD Calcul- │ │Loan EMI      │
     │              │ │ator       │ │Calculator    │
     │• Monthly SIP │ │• FD Rate  │ │• Loan Rate   │
     │• Equity Ret. │ │• Tax Slab │ │• Tax Slab    │
     │• Inflation   │ └───────────┘ └──────────────┘
     │• LTCG Tax    │
     └──────────────┘
            │
            ▼
     ┌─────────────────────────────────────────────┐
     │Lifetime Cost Corpus Calculator Wizard       │
     │• Current, Retirement & Life Expectancy Ages │
     │• Area Multiplier & Lifestyle Baseline       │
     │• Income, Increments & Initial Portfolio     │
     │• Category-specific sector inflation rates   │
     └─────────────────────────────────────────────┘
```

---

## 4. Navigation & Interface Touchpoints

1. **Header Profile Button**: Accessible on every page in `AppHeader.tsx` displaying the user's name or _"Setup Profile"_ pill.
2. **Interactive Modal**: Quick overlay drawer (`UserProfileModal.tsx`) allowing rapid tweaks without leaving the active calculator or wizard step.
3. **Dedicated Profile Page**: Full-screen settings dashboard (`/profile`) with tabbed sections for Demographics, Income, Inflation, and Benchmarks.
4. **Home Page Banner**: Contextual banner on the landing page guiding new users to configure their defaults before starting their financial plan.

---

## 5. Storage & Architecture

- **Storage Key**: `fundcalc_user_profile_v1`
- **Hook / Accessor**: `useUserProfile()` and `getUserProfile()` in `src/lib/userProfileStorage.ts`
- **Safety**: 100% stored in the browser's `localStorage` with zero server transmission.
