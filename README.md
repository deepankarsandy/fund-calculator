# Lifetime Cost & Corpus Calculator

A lightweight, modern web application designed for Indian households to estimate their lifetime cost of living, calculate their required retirement corpus, and project year-by-year wealth accumulation and drawdown.

Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

---

## 🌟 Features Overview

The calculator translates complex personal finance mathematics into an intuitive, guided experience. Detailed documentation for each feature is available in the [`docs/features/`](docs/features/) directory:

| Feature Area | Description | Detailed Documentation |
| :--- | :--- | :--- |
| **Guided 6-Step Wizard** | Smooth multi-step progression, step skipping, header navigation, and last-filled auto-scroll. | [📖 Wizard Flow Doc](docs/features/wizard-flow.md) |
| **Profile & Area Cost Calibration** | Longevity risk planning horizon (age 85–100) and geographic cost-of-living tiers across India (Village, Small Town, City, Metro). | [📖 Profile & Location Doc](docs/features/profile-and-location.md) |
| **Income & Career Accumulation** | Active salary compounding, annual salary increments, existing liquid assets, debt accounting, and self-funded retirement checks. | [📖 Career Accumulation Doc](docs/features/income-and-career-accumulation.md) |
| **Household & Dependents** | Member rosters, non-linear diminishing living cost scaling, child schooling/college lifecycle windows, and parental support. | [📖 Household & Dependents Doc](docs/features/household-dependents.md) |
| **Expense Categories A to K** | 11 comprehensive budget categories, dual entry (lump sum vs itemized), multi-frequency cadence, and category skipping. | [📖 Expense Management Doc](docs/features/expense-management.md) |
| **Macroeconomic Assumptions** | General inflation ($g$), differential healthcare inflation, investment returns ($r$), and one-click Optimistic / Base / Conservative presets. | [📖 Assumptions Doc](docs/features/financial-assumptions.md) |
| **Results & Projections** | Retirement Readiness Hero card, Target Corpus ($C_R$) vs Projected Accumulation ($P_R$), Crossover charts, and Year-by-Year ledgers. | [📖 Results & Projections Doc](docs/features/results-and-projections.md) |
| **1-Click Lifestyle Plan Switcher** | Sensitivity comparisons across Bare Minimum, Comfortable, and Luxury tiers with instant 1-click plan switching. | [📖 Lifestyle Scenarios Doc](docs/features/lifestyle-scenarios.md) |
| **PDF Export & Print Styling** | Executive summary report download and tailored print styling hiding interactive UI elements. | [📖 PDF & Print Doc](docs/features/pdf-export-and-print.md) |
| **Persistence & Theming** | 100% private client-side `localStorage` persistence, one-click reset, and Light / Dark / System theme switcher. | [📖 Storage & Theming Doc](docs/features/storage-and-theming.md) |

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

## 🛠️ Technical Documentation

For developers, contributors, and AI agents, in-depth architectural and technical specifications are organized in the [`docs/technical/`](docs/technical/) directory:

- [System Architecture & Directory Layout](docs/technical/architecture-overview.md)
- [Config-Driven Form Engine (`formFields.ts`)](docs/technical/config-driven-engine.md)
- [Financial Calculation Engine & Mathematical Formulations](docs/technical/calculation-engine.md)
- [State Management Architecture (`useScenarioStore`)](docs/technical/state-management.md)
- [Area Multipliers & Demographic Calibration Algorithms](docs/technical/area-and-lifestyle-defaults.md)
- [Testing Strategy & Policy](docs/technical/testing-strategy.md)

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

## 🧪 Testing Policy

This project strictly follows a **logic-only testing policy**:
- **What is tested**: Pure financial algorithms, annualisation routines, growing annuity edge cases ($r \ne g$ and $r = g$), inflation compounding, income accumulation, and portfolio depletion.
- **What is NOT tested**: UI components and DOM rendering (no Jest DOM / React Testing Library bloat) to keep development fast, lightweight, and maintainable.
- All 30 unit tests run via **Vitest** in `< 1s`.

---

## 📄 License & Disclaimer

This project is created as a personal planning tool and open-source project. The projections and calculations provided are for educational and financial awareness purposes only and do not constitute certified financial advice.
