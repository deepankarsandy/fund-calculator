# Task 04 — Validation & Warnings Logic

**Phase:** 1 — Domain layer  
**Depends on:** Task 02  
**Blocks:** Task 05 (store), Task 14 (warnings UX)

---

## Goal
Implement Zod schemas for input validation and a pure-function warning engine that returns non-blocking warning messages based on the current scenario state.

---

## Files to Create

### `src/domain/validation/profileSchema.ts`
```ts
import { z } from 'zod'

export const profileSchema = z.object({
  country:           z.string().min(1, 'Country is required'),
  region:            z.string().optional(),
  city:              z.string().optional(),
  currency:          z.string().min(1),
  currentAge:        z.number().int().min(1, 'Age must be at least 1').max(120),
  targetAge:         z.number().int().min(2).max(120),
  householdSize:     z.number().int().min(1).max(50),
  lifestyleScenario: z.enum(['bare_minimum', 'comfortable', 'custom']),
}).refine(d => d.targetAge > d.currentAge, {
  message: 'Target age must be greater than current age',
  path: ['targetAge'],
})
```

### `src/domain/validation/expenseSchema.ts`
```ts
import { z } from 'zod'

export const expenseItemSchema = z.object({
  amount:        z.number().min(0, 'Amount cannot be negative'),
  frequency:     z.enum(['weekly','monthly','quarterly','half_yearly','yearly','every_n_years','one_time']),
  everyNYears:   z.number().int().min(1).optional(),
  essential:     z.boolean(),
  inflationRate: z.number().min(-0.99).max(2).optional(),
  startYear:     z.number().int().min(1),
  endYear:       z.number().int().min(1).optional(),
}).refine(d => !d.endYear || d.endYear >= d.startYear, {
  message: 'End year must be ≥ start year',
  path: ['endYear'],
})
```

### `src/domain/validation/assumptionsSchema.ts`
```ts
import { z } from 'zod'

export const assumptionsSchema = z.object({
  globalInflationRate:    z.number().gt(-1, 'Must be > -100%'),
  annualInvestmentReturn: z.number().gt(-1, 'Must be > -100%'),
  returnBasis:            z.enum(['gross', 'net']),
  investmentFeeRate:      z.number().min(0).max(1),
  taxDragRate:            z.number().min(0).max(1),
  safetyMarginPercent:    z.number().min(0).max(2),
  withdrawalTiming:       z.enum(['beginning_of_year', 'end_of_year']),
})
```

### `src/domain/validation/warnings.ts`
Returns an array of warning strings based on the current scenario. Warnings are **non-blocking** — they guide the user, they don't prevent calculation.

```ts
import type { ExpenseCategory } from '../models/expense'
import type { HouseholdMember } from '../models/household'
import type { Assumptions } from '../models/assumptions'
import type { Profile } from '../models/profile'

export interface WarningContext {
  profile: Profile
  members: HouseholdMember[]
  categories: ExpenseCategory[]
  assumptions: Assumptions
}

export function generateWarnings(ctx: WarningContext): string[] {
  const warnings: string[] = []
  const { profile, members, categories, assumptions } = ctx

  const r = assumptions.annualInvestmentReturn
  const g = assumptions.globalInflationRate

  // Return vs inflation
  if (r < g) {
    warnings.push('⚠️ Investment return is below inflation. Required corpus may be very high.')
  }
  if (Math.abs(r - g) < 0.001) {
    warnings.push('ℹ️ Return equals inflation — a special formula case is used.')
  }

  // Gross return without fees/taxes
  if (assumptions.returnBasis === 'gross' && assumptions.investmentFeeRate === 0 && assumptions.taxDragRate === 0) {
    warnings.push('⚠️ You selected a gross return but have not entered fees or tax assumptions. Consider using net return or add fee/tax values.')
  }

  // Short planning horizon
  if (profile.targetAge < 85) {
    warnings.push(`ℹ️ You are planning only to age ${profile.targetAge}. Consider testing to age 90 or 95 to account for longevity.`)
  }

  // Healthcare missing
  const healthcat = categories.find(c => c.id === 'healthcare')
  const healthFilled = healthcat && !healthcat.skipped && (
    (healthcat.parentAmount && healthcat.parentAmount > 0) ||
    healthcat.items.some(i => !i.skipped && i.amount > 0)
  )
  if (!healthFilled) {
    warnings.push('⚠️ Healthcare & insurance expenses appear to be missing. These can grow significantly with inflation (default 7%).')
  }

  // Housing maintenance missing
  const housingCat = categories.find(c => c.id === 'housing')
  const hasRepairs = housingCat?.items.some(i =>
    !i.skipped && i.amount > 0 &&
    (i.name.toLowerCase().includes('repair') || i.name.toLowerCase().includes('maintenance'))
  )
  if (!hasRepairs) {
    warnings.push('⚠️ No housing repairs or maintenance costs found. Consider adding a home maintenance budget.')
  }

  // Vehicle replacement
  const transportCat = categories.find(c => c.id === 'transport')
  const hasTransport = transportCat && !transportCat.skipped
  const hasVehicleReplacement = transportCat?.items.some(i =>
    !i.skipped && i.amount > 0 &&
    i.name.toLowerCase().includes('replacement')
  )
  if (hasTransport && !hasVehicleReplacement) {
    warnings.push('⚠️ You have transport expenses but no vehicle replacement cost. Vehicles need periodic replacement.')
  }

  // Dependents without end dates
  const dependents = members.filter(m => m.financiallyDependent && m.id !== 'self')
  const familyCat = categories.find(c => c.id === 'family')
  if (dependents.length > 0 && !familyCat?.items.some(i => i.endYear != null)) {
    warnings.push('⚠️ You have dependents but no family expenses with an end year. Education, childcare, and support costs typically stop at a certain age.')
  }

  return warnings
}
```

---

## Acceptance Criteria
- [ ] `profileSchema.parse({...})` throws `ZodError` when `targetAge ≤ currentAge`
- [ ] `expenseItemSchema.parse({amount: -1, ...})` throws
- [ ] `generateWarnings` returns at least 1 warning for a bare scenario with no healthcare filled
- [ ] `generateWarnings` returns age warning when `targetAge < 85`
- [ ] `generateWarnings` returns gross-return warning when `returnBasis === 'gross'` and fees are 0
