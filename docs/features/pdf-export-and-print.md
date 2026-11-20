# PDF Report Export & Print Styling

The application includes print styling and one-click PDF generation, enabling users to save or share their financial plan.

---

## Overview

Financial plans often need to be reviewed offline, discussed with family members, or shared with a certified financial planner. The calculator provides a one-click PDF export that formats the entire plan into an executive report.

---

## Key Features

### 1. One-Click PDF Generation

- A prominent **“Download / Print PDF”** button is available in the results view header.
- Triggers the browser’s print dialog configured with print stylesheets.

### 2. Tailored Print Stylesheets (`@media print`)

When printing or exporting to PDF:

- Interactive screen elements (wizard navigation, scenario tabs, pagination controls, theme toggles, and edit links) are hidden.
- Key summary sections, cards, and data tables are styled with clean borders and high-contrast typography.
- Smart page-break utilities (`print-break-inside-avoid`) prevent awkward breaks through summary cards or ledger blocks.

### 3. Executive Report Contents

The exported document includes:

- Profile summary (location tier, ages, planning horizon).
- Key milestones (starting liquid assets, career income, retirement age).
- Retirement readiness score and funding gap analysis.
- Complete positive and negative lifetime cashflow reconciliation.
- Comparative lifestyle requirements (Bare Minimum, Comfortable, Luxury).
- Full year-by-year cashflow projections ledger.
