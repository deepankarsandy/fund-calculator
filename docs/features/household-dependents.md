# Household & Dependents Modeling

The **Household** module models non-linear family living costs, child education milestones, and parental support duration.

---

## Overview

A family of four does not cost four times what a single person costs. Household economics benefit from shared fixed costs (housing, utilities, kitchen overheads). Furthermore, child education costs and elderly parent support have specific lifecycle windows rather than lasting forever.

---

## Key Features

### 1. Dynamic Household Member Roster
- Add individual family members: **Self**, **Spouse**, **Child**, **Parent**, or **Other Dependent**.
- Specify current age, financial dependency status, and duration of support.
- Track individual health insurance coverage status.

### 2. Non-Linear Household Cost Scaling
- Adding dependents scales category expenses using diminishing marginal cost factors:
  - Housing: +25% per additional member
  - Utilities & Transport: +35% per additional member
  - Food & Personal: +65% per additional member
  - Financial, Technology & Emergency: +10% per additional member

### 3. Lifecycle-Triggered Child Education Defaults
When a child dependent is added to the household:
- **School Fees**: Automatically triggers at child age 5 and runs for 12 years.
- **Higher Education / College**: Automatically triggers at child age 17 and runs for 4 years.
- Default amounts scale based on the user's geographic area tier (e.g. ₹35,000/yr in small town, scaled higher in metros).

### 4. Elderly Parent Support Window
When a parent dependent is added:
- Monthly parental allowance / support is automatically activated.
- Support duration is bounded by the parent's `supportUntilAge` (or standard life expectancy).

### 5. Dependency Warnings & Prompts
- If zero dependents are specified, the system shows an informational reminder in the results view to consider dependent protection.
