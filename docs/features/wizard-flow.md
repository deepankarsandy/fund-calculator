# Guided 6-Step Wizard Flow

The application organizes complex financial planning into a frictionless, 6-step guided wizard that minimizes cognitive load while collecting granular financial data.

---

## Overview

Retirement planning requires inputs across multiple domains: demographic profile, current and future income, household dependents, recurring living expenses, and macroeconomic assumptions. Presenting all these fields on a single page is overwhelming.

The 6-step wizard breaks the process down into logical, progressive steps:

1. **Step 1: Profile & Horizon** — Geographic location, area cost tier, age, and planning horizon.
2. **Step 2: Income, Savings & Assets** — Active take-home salary, annual increments, existing corpus, liabilities, and other income.
3. **Step 3: Household & Dependents** — Dependents, ages, duration of support, and insurance coverage.
4. **Step 4: Living Expenses** — Categories A through K, lump-sum or itemized expenses.
5. **Step 5: Financial Assumptions** — Inflation rates, investment returns, and market scenarios.
6. **Step 6: Corpus Calculation & Results** — Comprehensive results dashboard, charts, tables, and PDF generation.

---

## Key Features

### 1. Interactive Step Progress Header

- The wizard features a top progress tracker showing all 6 steps with completion indicators.
- Users can click any step in the header to jump directly between sections at any time without losing filled data.

### 2. Optional Steps & One-Click Skipping

- Non-essential steps (such as adding dependents or complex other income) provide clear **"Skip"** options with informative labels (e.g. _“Skip & treat as retirement from today”_ or _“Skip (Plan for myself only)”_).
- Clicking skip pre-fills sensible baseline defaults and automatically advances to the next step.

### 3. Smart Last-Filled Auto-Scroll

- When returning to an earlier step or navigating the wizard, the UI remembers the last-interacted element and smoothly scrolls it into view.

### 4. Non-Destructive Step Traversal

- Users can go forward and backward freely using the **"← Previous"** and **"Next →"** controls.
- Calculations update reactively as soon as the user arrives at Step 6.
