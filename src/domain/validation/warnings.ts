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

  if (r < g) {
    warnings.push(
      'Investment return is below inflation. The required corpus may be very large.',
    )
  }
  if (Math.abs(r - g) < 0.001) {
    warnings.push(
      'Return equals inflation — a special formula case (r = g) is used.',
    )
  }

  if (
    assumptions.returnBasis === 'gross' &&
    assumptions.investmentFeeRate === 0 &&
    assumptions.taxDragRate === 0
  ) {
    warnings.push(
      'Gross return selected but no fees or tax drag entered. The estimate may be optimistic.',
    )
  }

  if (profile.targetAge < 85) {
    warnings.push(
      `Planning only to age ${profile.targetAge}. Consider testing to age 90 or 95 to account for longevity.`,
    )
  }

  const healthCat = categories.find(c => c.id === 'healthcare')
  const healthFilled =
    healthCat &&
    !healthCat.skipped &&
    ((healthCat.parentAmount && healthCat.parentAmount > 0) ||
      healthCat.items.some(i => !i.skipped && i.amount > 0))
  if (!healthFilled) {
    warnings.push(
      'Healthcare & insurance expenses appear to be empty. These often grow faster than general inflation.',
    )
  }

  const housingCat = categories.find(c => c.id === 'housing')
  const hasRepairs = housingCat?.items.some(
    i =>
      !i.skipped &&
      i.amount > 0 &&
      (i.name.toLowerCase().includes('repair') ||
        i.name.toLowerCase().includes('maintenance')),
  )
  if (!hasRepairs) {
    warnings.push(
      'No housing repairs or maintenance costs found. Consider a home maintenance reserve.',
    )
  }

  const transportCat = categories.find(c => c.id === 'transport')
  const hasTransport =
    transportCat &&
    !transportCat.skipped &&
    ((transportCat.parentAmount && transportCat.parentAmount > 0) ||
      transportCat.items.some(i => !i.skipped && i.amount > 0))
  const hasVehicleReplacement = transportCat?.items.some(
    i =>
      !i.skipped &&
      i.amount > 0 &&
      i.name.toLowerCase().includes('replacement'),
  )
  if (hasTransport && !hasVehicleReplacement) {
    warnings.push(
      'Transport expenses found but no vehicle replacement cost. Vehicles need periodic replacement.',
    )
  }

  const dependents = members.filter(
    m => m.financiallyDependent && m.id !== 'self',
  )
  const familyCat = categories.find(c => c.id === 'family')
  const hasFamilyWithEnd = familyCat?.items.some(i => i.endYear != null)
  if (dependents.length > 0 && !hasFamilyWithEnd) {
    warnings.push(
      'You have dependents but no family expenses with an end year. Education and childcare costs typically stop at a certain age.',
    )
  }

  return warnings
}
