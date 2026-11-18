# Task 03 — Calculation Engine + Unit Tests

**Phase:** 1 — Domain layer  
**Depends on:** Task 02  
**Blocks:** Task 05 (store), Task 11 (results)

---

## Goal
Implement all financial calculation functions as **pure TypeScript** using `decimal.js`. Every function must have a corresponding unit test matching the 10 test cases from the guide.

---

## Files to Create

### `src/domain/calculations/annualise.ts`
Convert an expense item's amount to an annual baseline.

```ts
import Decimal from 'decimal.js'
import type { ExpenseItem } from '../models/expense'
import { FREQUENCY_MULTIPLIERS } from '../models/expense'

/** Returns the annualised amount for a recurring expense. Returns 0 for one-time/periodic. */
export function annualiseExpense(item: ExpenseItem): number {
  if (item.skipped || item.amount <= 0) return 0
  if (item.frequency === 'one_time') return 0
  if (item.frequency === 'every_n_years') {
    if (!item.everyNYears || item.everyNYears <= 0) return 0
    return new Decimal(item.amount).div(item.everyNYears).toNumber()
  }
  const multiplier = FREQUENCY_MULTIPLIERS[item.frequency]
  return new Decimal(item.amount).mul(multiplier).toNumber()
}

/** Returns the total current annual expense for a list of items. */
export function totalAnnualExpense(items: ExpenseItem[]): number {
  return items.reduce((sum, item) => {
    return new Decimal(sum).plus(annualiseExpense(item)).toNumber()
  }, 0)
}
```

### `src/domain/calculations/projectInflation.ts`
Project a present-value expense forward using inflation.

```ts
import Decimal from 'decimal.js'

/**
 * Future nominal amount after `years` of inflation.
 * Formula: amount × (1 + rate)^years
 */
export function projectInflation(amount: number, rate: number, years: number): number {
  if (years === 0) return amount
  return new Decimal(amount)
    .mul(new Decimal(1).plus(rate).pow(years))
    .toNumber()
}

/** Project an expense to multiple horizons: 5, 10, 20, 30 years */
export function projectHorizons(amount: number, rate: number): Record<number, number> {
  return {
    5:  projectInflation(amount, rate, 5),
    10: projectInflation(amount, rate, 10),
    20: projectInflation(amount, rate, 20),
    30: projectInflation(amount, rate, 30),
  }
}
```

### `src/domain/calculations/corpusFormula.ts`
Growing annuity present-value formula (Convention A) and special cases.

```ts
import Decimal from 'decimal.js'
import type { WithdrawalTiming } from '../models/profile'

/**
 * Required corpus — Convention A: first year-end withdrawal equals E0.
 * When r ≠ g: C = E0 × [1 - ((1+g)/(1+r))^n] / (r - g)
 * When r = g: C = E0 × n / (1 + r)
 */
export function calculateCorpusConventionA(
  e0: number,          // current annual expense
  r: number,           // net annual investment return (decimal)
  g: number,           // annual inflation rate (decimal)
  n: number,           // number of years
  timing: WithdrawalTiming = 'end_of_year',
): number {
  if (n <= 0 || e0 <= 0) return 0

  const E0 = new Decimal(e0)
  const R  = new Decimal(r)
  const G  = new Decimal(g)
  const N  = new Decimal(n)

  let corpus: Decimal

  if (R.equals(G)) {
    // Special case: C = E0 × n / (1 + r)
    corpus = E0.mul(N).div(R.plus(1))
  } else {
    // C = E0 × [1 - ((1+g)/(1+r))^n] / (r - g)
    const ratio = G.plus(1).div(R.plus(1))
    const bracket = new Decimal(1).minus(ratio.pow(N))
    corpus = E0.mul(bracket).div(R.minus(G))
  }

  // Beginning-of-year: multiply by (1 + r)
  if (timing === 'beginning_of_year') {
    corpus = corpus.mul(R.plus(1))
  }

  return corpus.toNumber()
}

/** Net effective return after fees and taxes (if gross return supplied) */
export function netReturn(grossReturn: number, feeRate: number, taxDrag: number): number {
  return new Decimal(grossReturn).minus(feeRate).minus(taxDrag).toNumber()
}

/** Approximate real return */
export function realReturn(nominalReturn: number, inflationRate: number): number {
  return new Decimal(1).plus(nominalReturn)
    .div(new Decimal(1).plus(inflationRate))
    .minus(1)
    .toNumber()
}
```

### `src/domain/calculations/projectCashflows.ts`
Year-by-year cash-flow projection engine.

```ts
import Decimal from 'decimal.js'
import type { ExpenseCategory } from '../models/expense'
import type { Assets } from '../models/assets'
import type { Assumptions } from '../models/assumptions'
import type { YearProjection } from '../models/results'
import { annualiseExpense } from './annualise'
import { projectInflation } from './projectInflation'

export interface CashflowInput {
  categories: ExpenseCategory[]
  assets: Assets
  assumptions: Assumptions
  currentAge: number
  planningYears: number
}

export function projectCashflows(input: CashflowInput): YearProjection[] {
  const { categories, assets, assumptions, currentAge, planningYears } = input
  const r = assumptions.annualInvestmentReturn
  const timing = assumptions.withdrawalTiming

  // Build base annual expense per category item
  const recurringItems = categories.flatMap(cat => {
    if (cat.skipped) return []
    // If parent amount set, treat as single item
    if (cat.parentAmount != null && cat.parentAmount > 0 && cat.parentFrequency) {
      const freq = cat.parentFrequency
      const mult = freq === 'monthly' ? 12 : freq === 'yearly' ? 1 : 1
      return [{ annualBase: cat.parentAmount * mult, inflationRate: cat.defaultInflationRate, essential: true, startYear: 1, endYear: undefined as number | undefined, type: 'recurring' as const }]
    }
    return cat.items
      .filter(i => !i.skipped && i.type === 'recurring')
      .map(i => ({
        annualBase: annualiseExpense(i),
        inflationRate: i.inflationRate ?? cat.defaultInflationRate,
        essential: i.essential,
        startYear: i.startYear,
        endYear: i.endYear,
        type: i.type,
      }))
  })

  const oneTimeItems = categories.flatMap(cat =>
    cat.skipped ? [] :
    cat.items.filter(i => !i.skipped && i.type === 'one_time').map(i => ({
      amount: i.amount,
      year: i.startYear,
    }))
  )

  const projections: YearProjection[] = []

  for (let t = 1; t <= planningYears; t++) {
    // Recurring expenses in year t
    const recurringExpense = recurringItems
      .filter(item => t >= item.startYear && (item.endYear == null || t <= item.endYear))
      .reduce((sum, item) => {
        const inflated = projectInflation(item.annualBase, item.inflationRate, t - 1)
        return new Decimal(sum).plus(inflated).toNumber()
      }, 0)

    // One-time expenses in year t
    const oneTimeExpense = oneTimeItems
      .filter(i => i.year === t)
      .reduce((sum, i) => sum + i.amount, 0)

    const totalExpense = recurringExpense + oneTimeExpense

    // Other income in year t
    const otherIncome = assets.otherIncome
      .filter(inc => t >= inc.startYear && (inc.endYear == null || t <= inc.endYear))
      .reduce((sum, inc) => {
        const amount = inc.inflationLinked
          ? projectInflation(inc.annualAmount, assumptions.globalInflationRate, t - 1)
          : inc.annualAmount
        return sum + amount
      }, 0)

    // Lump sums in year t
    const lumpSum = assets.futureContributions
      .filter(ls => ls.year === t)
      .reduce((sum, ls) => sum + ls.amount, 0)

    const netWithdrawal = Math.max(0, totalExpense - otherIncome - lumpSum)

    projections.push({
      year: t,
      age: currentAge + t,
      expenses: totalExpense,
      otherIncome: otherIncome + lumpSum,
      netWithdrawal,
      investmentGrowth: 0,  // filled in simulatePortfolio
      openingCorpus: 0,
      closingCorpus: 0,
    })
  }

  return projections
}
```

### `src/domain/calculations/simulatePortfolio.ts`
Portfolio balance simulation; fills in the opening/closing/growth columns.

```ts
import Decimal from 'decimal.js'
import type { YearProjection } from '../models/results'
import type { WithdrawalTiming } from '../models/profile'

export function simulatePortfolio(
  projections: YearProjection[],
  startingCorpus: number,
  annualReturn: number,
  timing: WithdrawalTiming,
): YearProjection[] {
  let balance = new Decimal(startingCorpus)
  const r = new Decimal(annualReturn)

  return projections.map(row => {
    const opening = balance
    let growth: Decimal
    let closing: Decimal

    if (timing === 'end_of_year') {
      growth = opening.mul(r)
      closing = opening.plus(growth).minus(row.netWithdrawal)
    } else {
      // Beginning of year: withdraw first, then grow
      const afterWithdrawal = opening.minus(row.netWithdrawal)
      closing = afterWithdrawal.mul(r.plus(1))
      growth = closing.minus(afterWithdrawal)
    }

    balance = closing

    return {
      ...row,
      openingCorpus: opening.toNumber(),
      investmentGrowth: growth.toNumber(),
      closingCorpus: closing.toNumber(),
    }
  })
}
```

### `src/domain/calculations/calculateFundingGap.ts`
```ts
export function calculateFundingGap(
  requiredCorpus: number,
  existingCorpus: number,
  discountedFutureIncome: number,
): number {
  return Math.max(0, requiredCorpus - existingCorpus - discountedFutureIncome)
}
```

### `src/domain/calculations/runScenarios.ts`
Orchestrates all calculations for 3 scenarios and returns `CalculationResults`.

---

## Unit Tests

### `src/domain/calculations/__tests__/calculations.test.ts`

Cover all 10 guide test cases:

| Test | Covers |
|---|---|
| Test 1 | Annualisation: monthly + annual items |
| Test 2 | Inflation projection: 1L at 5% for 10 years → ~1.63L |
| Test 3 | Growing annuity: Convention A, formula vs simulation ~0 |
| Test 4 | r = g special case: no division by zero |
| Test 5 | g = 0: reduces to level annuity PV |
| Test 6 | Per-category inflation rates applied independently |
| Test 7 | One-time expense appears only in target year |
| Test 8 | Pension income offset from correct year |
| Test 9 | Beginning-of-year corpus > end-of-year corpus |
| Test 10 | Extending target age cannot decrease corpus (non-negative withdrawals) |

---

## Acceptance Criteria
- [ ] All 10 tests pass (`npm run test`)
- [ ] `npx tsc --noEmit` clean
- [ ] `annualiseExpense` returns 0 for `one_time` items
- [ ] No division by zero when r = g
- [ ] `simulatePortfolio` with corpus from `calculateCorpusConventionA` ends near zero (± ₹1)
