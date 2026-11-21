# Comprehensive Expense Management (Categories A to K)

The living expense module provides a structured, comprehensive framework covering 11 standardized expense categories with dual entry modes and granular frequency controls.

---

## Overview

Overlooking recurring or occasional living costs is the #1 reason retirement plans fail. The calculator divides all household expenses into 11 distinct categories (A through K) aligned with Indian household spending patterns.

---

## The 11 Expense Categories

| Category                     | Description                                              | Sample Line Items                                               |
| :--------------------------- | :------------------------------------------------------- | :-------------------------------------------------------------- |
| **A. Housing**               | Rent, society maintenance, home repair, property tax     | Rent, Society Maintenance, Painting/Repairs, Property Tax       |
| **B. Food & Groceries**      | Monthly groceries, perishables, and dining               | Kitchen Staples, Vegetables/Meat, Dining Out, Order In          |
| **C. Utilities**             | Essential municipal and household power                  | Electricity, Piped Gas/LPG, Water Tankers                       |
| **D. Healthcare**            | Routine consultation, medicines, and diagnostic checkups | Routine Medicines, Doctor Visits, Health Insurance Premiums     |
| **E. Transportation**        | Vehicle running and commuting expenses                   | Fuel (Petrol/Diesel), Vehicle Servicing, Public Transit, FASTag |
| **F. Personal & Lifestyle**  | Personal care, clothing, fitness, and hobbies            | Clothing/Footwear, Salons, Hobbies, Domestic Vacations          |
| **G. Technology & Bills**    | Digital connectivity and communication                   | Mobile Recharges, Home Broadband, OTT Subscriptions             |
| **H. Family & Dependents**   | Child schooling, higher education, and parental support  | School Tuition, College Funds, Parental Allowance               |
| **I. Financial & Insurance** | Term insurance, bank charges, and advisory fees          | Term Life Premiums, Account Fees, CA / Tax Prep                 |
| **J. Emergency Buffer**      | Contingency buffer for unforeseen repairs or events      | Unplanned Appliance Replacement, Medical Incidentals            |
| **K. Custom Expenses**       | User-defined personalized budget items                   | Pet Care, Farming / Land Lease, Philanthropy                    |

---

## Key Features

### 1. Dual Entry Modes: Category Total vs Itemized Breakdown

- **Parent Category Total**: Enter one combined monthly or annual sum for the whole category. Sub-items are displayed as an educational reference guide.
- **Item-by-Item Breakdown**: Expand the category to configure individual sub-items with unique frequencies and amounts.

### 2. Multi-Frequency Annualization

Each line item supports realistic billing cadences:

- `Monthly` (×12)
- `Quarterly` (×4)
- `Half-Yearly` (×2)
- `Yearly` (×1)
- `Weekly` (×52)
- `Every N Years` (Periodic capital expenditure, e.g. laptop replacement every 4 years)
- `One-Time` (Applies only in a specific future planning year)

### 3. Essential vs Discretionary Tagging

- Items are tagged as `essential: true` (core survival items: groceries, shelter, electricity, medicines) or `essential: false` (discretionary: travel, dining out, streaming).
- This metadata powers instant lifestyle sensitivity testing.

### 4. One-Click Category Skipping

- If a category is irrelevant (e.g. user has no vehicle or no children), a single click on **"Skip Category"** zeros out its contribution while preserving the data structure.

### 5. Linked Loan Liabilities (Fixed 0% Inflation)

- Contractual loan EMIs from the dedicated Loan EMI Calculator are integrated directly into Category I (Financial & Insurance).
- Enforces an explicit 0% inflation rate because contractual loan EMIs do not inflate with general living expenses, and drops off automatically post-payoff.
- Supports independent include/exclude toggles for each loan sub-type (Home, Car, Personal, Custom) with simultaneous multi-loan support.
- For complete details, see [Linked Calculators Integration](linked-calculators.md).
