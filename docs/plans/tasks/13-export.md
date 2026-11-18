# Task 13 — Export (CSV + PDF)

**Phase:** 3 — Results  
**Depends on:** Task 12  
**Blocks:** nothing

---

## Goal
Let users download the year-by-year projection table as a CSV and a summary report as a PDF.

---

## Components

### `src/components/results/ExportButtons.tsx`
Two buttons in the Results header:
- "⬇ Download CSV" — exports projection table
- "⬇ Download PDF" — exports summary report

---

## CSV Export

### `src/lib/exportCSV.ts`
Using `papaparse`:

```ts
import Papa from 'papaparse'
import type { YearProjection } from '@/domain/models/results'

export function exportProjectionCSV(projections: YearProjection[], filename = 'corpus-projection.csv') {
  const rows = projections.map(row => ({
    'Year': row.year,
    'Age': row.age,
    'Opening Corpus (₹)': row.openingCorpus,
    'Expenses (₹)': row.expenses,
    'Other Income (₹)': row.otherIncome,
    'Net Withdrawal (₹)': row.netWithdrawal,
    'Investment Growth (₹)': row.investmentGrowth,
    'Closing Corpus (₹)': row.closingCorpus,
  }))
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
```

---

## PDF Export

### `src/lib/exportPDF.ts`
Using `jsPDF` (text-only, no canvas):

Sections in PDF:
1. Title: "Lifetime Cost Corpus Calculator — Planning Report"
2. Generated date and disclaimer
3. **Profile summary** (age, planning duration, lifestyle)
4. **Expense summary** (annual total, essential vs discretionary)
5. **Assumptions used** (inflation, return, timing, safety margin)
6. **Results — 3 scenarios** (corpus, gap, corpus with margin)
7. **Projection table** (all years, 7 columns)
8. **Warnings** (from `generateWarnings()`)
9. **Disclaimer footer**

```ts
import jsPDF from 'jspdf'

export function exportSummaryPDF(/* snapshot of store */) {
  const doc = new jsPDF()
  // ... build doc with doc.text(), doc.line(), etc.
  doc.save('corpus-report.pdf')
}
```

---

## Disclaimer in Export
Every export must include at top and bottom:
> "This report is a planning estimate based on the assumptions entered. It is not financial advice. Investment returns and inflation are uncertain. Consult a registered financial adviser before making investment decisions."

---

## Acceptance Criteria
- [ ] "Download CSV" triggers file download with correct data
- [ ] CSV contains all planning years as rows
- [ ] "Download PDF" produces a readable multi-page PDF
- [ ] PDF includes all 3 scenario results
- [ ] Disclaimer text present in both exports
- [ ] Filenames include date stamp (e.g. `corpus-projection-2026-11-18.csv`)
