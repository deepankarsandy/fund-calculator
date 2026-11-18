# Lifetime Cost & Corpus Calculator

A lightweight, modern web application designed for Indian households to estimate their lifetime cost of living, calculate their required retirement corpus, and project year-by-year wealth accumulation and drawdown.

Built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

---

## 🌟 Key Features

### 1. Engaging Home & Walkthrough Page
- Clean, informative landing page explaining the core philosophy, location cost-of-living adjustments, and growing annuity mathematics.
- Direct Call-to-Action (CTA) to launch the calculation wizard at any time.
- Frequently Asked Questions (FAQ) answering common financial planning queries.

### 2. Config-Driven 6-Step Wizard
Every field, section, validation rule, default value, and help explanation is declared in a single source of truth: [`src/config/formFields.ts`](file:///Users/deepankar/projects/lifetime-cost-corpus-calculator/src/config/formFields.ts). The UI dynamically renders inputs without hardcoded component forms:

1. **Profile**:
   - Current age, planned retirement age, life expectancy planning horizon.
   - **Area & Location Calibration**: Select between **Village / Rural**, **Small Town (Tier 3)**, **City (Tier 2)**, or **Tier 1 Metro**. Default living expenses automatically scale according to realistic regional cost multipliers.
2. **Income, Savings & Assets**:
   - Monthly earned income, planned income duration (until retirement age), and expected annual salary hike (%).
   - Existing investable corpus (mutual funds, stocks, PF, fixed deposits).
   - Non-investable assets, outstanding liabilities (home loans, personal debt), and post-retirement reliable income (pension, annuity, rental).
3. **Household Members**:
   - Add primary earner, spouse, children, parents, and other dependents with ages and dependency duration.
   - Built-in warning reminders if zero dependents are specified.
4. **Living Expenses (Categories A to K)**:
   - Flexible expense entry: enter a **Category Lump-Sum Total** (with itemized sub-categories shown as disabled reference guides) OR break down expenses **Item by Item**.
   - Categories include Housing, Food & Groceries, Utilities, Healthcare, Transportation, Discretionary & Lifestyle, Children's Education, Insurance Premiums, Maintenance & Renovations, Emergency Contingency, and Miscellaneous.
   - One-click **Skip Category** for categories that do not apply.
5. **Financial Assumptions**:
   - General inflation rate (%) and healthcare-specific inflation rate (%).
   - Return basis choice: **Real (Inflation-Adjusted)** or **Nominal**.
   - Asset-class return projections (Equity, Debt, Gold, Real Estate) or a single blended return rate.
6. **Results & Projections**:
   - **Retirement Milestone Card**: Explicit side-by-side comparison of **Target Corpus at Retirement ($C_R$)** vs **Projected Accumulated Savings ($P_R$)**.
   - **Readiness Progress Bar**: Color-coded indicator (Emerald for $\ge 100\%$, Amber for $75-99\%$, Rose for $< 75\%$) showing surplus or gap at retirement.
   - **Year-by-Year Cash Flow Trajectory**: Interactive Recharts graph tracking earned income, annual expenses, and portfolio net worth from current age through age 85+.
   - **Lifetime Cashflow Reconciliation Ledger**: Clear reconciliation showing total lifetime living costs vs cumulative saved surplus and investment compounding.
   - **Lifestyle Tier Sensitivity**: Instant comparison across **Frugal / Bare-Minimum (0.75×)**, **Comfortable (1.0×)**, and **Luxury (1.4×)** lifestyle tiers.
   - **1-Click PDF Report Export**: Generates a clean, comprehensive multi-page PDF summary via `jsPDF` for offline review.

### 3. User Experience & Design
- **Theme Switcher**: Seamless switching between **Light**, **Dark**, and **System** themes, automatically persisted in browser `localStorage`.
- **Form Controls**: Uniform 44px (`h-11`) touch-friendly inputs, custom dropdown chevron indicators, and removed default browser number-input spinners.
- **Full State Persistence**: Every input is saved in `localStorage` in real-time. A single click on **Reset** cleanly wipes all stored data.
- **Top Step Navigation**: Direct navigation between steps at any point in the wizard flow.

---

## 🧮 Financial & Mathematical Foundation

### 1. Growing Annuity Formula (Convention A)
Retirement corpus is computed using the standard growing annuity formula under two mathematical cases:

- **When return rate ($r$) $\neq$ inflation rate ($g$):**
  $$C = E_0 \times \frac{1 - \left(\frac{1+g}{1+r}\right)^n}{r - g} \times (1 + r)$$

- **When return rate ($r$) $=$ inflation rate ($g$):**
  $$C = E_0 \times \frac{n}{1+r} \times (1 + r) = E_0 \times n$$

*(Beginning-of-year adjustment $(1+r)$ is applied for living expenses incurred throughout each year).*

### 2. Active Income & Wealth Accumulation
For users still earning active income:
1. Annual income compounds each year by the user's expected salary increment rate ($g_{\text{income}}$).
2. Annual expenses compound by expense inflation ($g_{\text{expense}}$).
3. If $\text{Annual Income} > \text{Annual Expenses}$, the surplus is added to the investment portfolio and compounds at investment return rate ($r$).
4. At retirement age, active earned income stops. If guaranteed post-retirement income (pension/rent) is present, only the remaining net deficit is withdrawn from the accumulated portfolio.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/lifetime-cost-corpus-calculator.git
cd lifetime-cost-corpus-calculator

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Unit Tests
```bash
npm test
```
To run tests in watch mode:
```bash
npm run test:watch
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
lifetime-cost-corpus-calculator/
├── src/
│   ├── config/
│   │   └── formFields.ts              # Single source of truth for wizard fields, categories & defaults
│   ├── domain/
│   │   ├── calculations/              # Pure financial calculation engine
│   │   │   ├── annualise.ts           # Frequency converters (weekly, monthly, annual, etc.)
│   │   │   ├── corpusConventionA.ts   # Growing annuity formula implementations
│   │   │   ├── runScenarios.ts        # Year-by-year cash flow projections & accumulations
│   │   │   └── __tests__/             # Pure mathematical unit tests (Vitest)
│   │   ├── models/                    # TypeScript interfaces (Profile, Assets, Expenses, Results)
│   │   └── validation/                # Data sanitization and warning rules
│   ├── components/
│   │   ├── common/                    # Header, Footer, Reset confirmation modal
│   │   ├── expenses/                  # Dynamic category & subcategory expense renderer
│   │   ├── form/                      # Config-driven field renderer (input, select, radio, slider)
│   │   ├── steps/                     # Wizard step views (Profile, Assets, Household, Expenses, Assumptions, Results)
│   │   └── ui/                        # ThemeToggle, buttons, cards, progress bars
│   ├── pages/
│   │   ├── HomePage.tsx               # Landing page with feature breakdown & CTA
│   │   └── WizardPage.tsx             # 6-step calculation wizard shell
│   ├── store/
│   │   └── useCalculatorStore.ts      # Zustand state store with localStorage persistence
│   ├── lib/
│   │   └── formatters.ts              # INR Lakhs (L) and Crores (Cr) currency formatters
│   ├── App.tsx                        # Root component handling page routing (Home vs Wizard)
│   └── main.tsx                       # Vite app entry point
├── docs/
│   └── plans/                         # Project specifications and implementation guides
├── agent.md                           # Architecture and developer guidelines
└── package.json
```

---

## 🧪 Testing Policy

This project strictly follows a **logic-only testing policy**:
- **What is tested**: Pure financial algorithms, annualisation routines, growing annuity edge cases ($r \ne g$ and $r = g$), inflation compounding, income accumulation, and portfolio depletion.
- **What is NOT tested**: UI components and DOM rendering (no Jest DOM / React Testing Library bloat) to keep development fast, lightweight, and maintainable.
- All 24 unit tests run via **Vitest** in `< 1s`.

---

## 📄 License & Disclaimer

This project is created as a personal planning tool and hobby project. The projections and calculations provided are for educational and financial awareness purposes only and do not constitute certified financial advice.
