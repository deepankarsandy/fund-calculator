import type { AreaType, LifestyleScenario } from '@/domain/models/profile'
import type { ExpenseCategory, CategoryId, Frequency, ExpenseType } from '@/domain/models/expense'
import type { HouseholdMember } from '@/domain/models/household'
import { EXPENSE_CATEGORIES_CONFIG } from '@/config/formFields'

// Multipliers for different living costs across India
export const AREA_MULTIPLIERS: Record<
  AreaType,
  { label: string; baseMultiplier: number; description: string }
> = {
  village: {
    label: 'Village / Rural',
    baseMultiplier: 0.6,
    description: 'Lower living expenses, modest housing & homegrown/local food.',
  },
  small_town: {
    label: 'Small Town (Tier 3)',
    baseMultiplier: 1.0,
    description: 'Moderate costs (e.g. small town Odisha sample from product guide).',
  },
  city: {
    label: 'City (Tier 2)',
    baseMultiplier: 1.6,
    description: 'State capitals & major hubs (e.g. Bhubaneswar, Jaipur, Chandigarh, Kochi).',
  },
  tier1_metro: {
    label: 'Tier 1 Metro',
    baseMultiplier: 2.5,
    description: 'High cost of living (Mumbai, Bengaluru, Delhi NCR, Hyderabad, Chennai).',
  },
}

// Category-specific tuning relative to area
const CATEGORY_AREA_FACTORS: Record<string, Record<AreaType, number>> = {
  housing: { village: 0.4, small_town: 1.0, city: 1.8, tier1_metro: 3.2 },
  food: { village: 0.7, small_town: 1.0, city: 1.4, tier1_metro: 1.9 },
  transport: { village: 0.6, small_town: 1.0, city: 1.5, tier1_metro: 2.2 },
  utilities: { village: 0.8, small_town: 1.0, city: 1.3, tier1_metro: 1.6 },
  healthcare: { village: 0.8, small_town: 1.0, city: 1.4, tier1_metro: 2.0 },
  personal: { village: 0.5, small_town: 1.0, city: 1.6, tier1_metro: 2.5 },
  technology: { village: 0.9, small_town: 1.0, city: 1.1, tier1_metro: 1.2 },
  family: { village: 0.6, small_town: 1.0, city: 1.5, tier1_metro: 2.2 },
  financial: { village: 0.8, small_town: 1.0, city: 1.2, tier1_metro: 1.5 },
  emergency: { village: 0.7, small_town: 1.0, city: 1.5, tier1_metro: 2.0 },
  custom: { village: 0.7, small_town: 1.0, city: 1.5, tier1_metro: 2.0 },
}

function generateId(prefix: string, idx: number): string {
  return `${prefix}_${idx}_${Math.random().toString(36).slice(2, 6)}`
}

// Member scaling: not linear. Each additional person adds diminishing cost.
// Formula: 1 + (memberCount - 1) * scalingFactor
function getMemberScalingFactor(categoryId: string): number {
  if (['financial', 'emergency', 'technology'].includes(categoryId)) return 0.1
  if (categoryId === 'housing') return 0.25
  if (['food', 'personal'].includes(categoryId)) return 0.65
  if (categoryId === 'healthcare') return 0.5
  if (['transport', 'utilities'].includes(categoryId)) return 0.35
  if (categoryId === 'family') return 0.8
  return 0.4
}

export function buildCategoriesForProfile(
  areaType: AreaType = 'small_town',
  lifestyle: LifestyleScenario = 'comfortable',
  membersOrCount: number | HouseholdMember[] = 1,
  sectorInflationRates?: Record<string, number>
): ExpenseCategory[] {
  let memberCount = 1
  let membersList: HouseholdMember[] = []

  if (typeof membersOrCount === 'number') {
    memberCount = Math.max(1, membersOrCount)
  } else if (Array.isArray(membersOrCount)) {
    membersList = membersOrCount
    const dependentCount = membersList.filter((m) => m.financiallyDependent).length
    memberCount = Math.max(1, dependentCount)
  }

  const childMembers = membersList.filter(
    (m) => m.relationship === 'child' && m.financiallyDependent
  )
  const parentMembers = membersList.filter(
    (m) => m.relationship === 'parent' && m.financiallyDependent
  )

  return EXPENSE_CATEGORIES_CONFIG.map((cat) => {
    const factor =
      CATEGORY_AREA_FACTORS[cat.id]?.[areaType] ?? AREA_MULTIPLIERS[areaType].baseMultiplier

    return {
      id: cat.id as CategoryId,
      label: cat.label,
      description: cat.description,
      defaultInflationRate:
        sectorInflationRates && sectorInflationRates[cat.id] != null
          ? sectorInflationRates[cat.id] > 1
            ? sectorInflationRates[cat.id] / 100
            : sectorInflationRates[cat.id]
          : cat.defaultInflationRate,
      skipped: false,
      parentAmount: undefined,
      parentFrequency: cat.parentInput.defaultFrequency,
      items: cat.subItems.map((sub, idx) => {
        const type: ExpenseType =
          sub.frequency === 'one_time'
            ? 'one_time'
            : sub.frequency === 'every_n_years'
              ? 'periodic'
              : 'recurring'

        // Scale default amount
        let scaledAmount = Math.round((sub.defaultAmount * factor) / 50) * 50
        let itemStartYear = 1
        let itemEndYear: number | undefined = undefined

        // Category H: Family & Dependents smart defaults based on added members
        if (cat.id === 'family') {
          if (sub.id === 'school_fees') {
            if (childMembers.length > 0) {
              const child = childMembers[0]
              // Baseline ~₹35k/year in small town per child
              scaledAmount = Math.round((35000 * factor * childMembers.length) / 500) * 500
              itemStartYear = Math.max(1, 5 - child.age)
              itemEndYear = itemStartYear + 11 // ~12 years of schooling
            } else {
              scaledAmount = 0
            }
          } else if (sub.id === 'higher_education') {
            if (childMembers.length > 0) {
              const child = childMembers[0]
              // Baseline ~₹80k/year in small town per child
              scaledAmount = Math.round((80000 * factor * childMembers.length) / 500) * 500
              itemStartYear = Math.max(1, 17 - child.age)
              itemEndYear = itemStartYear + 3 // ~4 years of college
            } else {
              scaledAmount = 0
            }
          } else if (sub.id === 'parental_support') {
            if (parentMembers.length > 0) {
              const parent = parentMembers[0]
              // Baseline ~₹8k/month in small town per parent
              scaledAmount = Math.round((8000 * factor * parentMembers.length) / 500) * 500
              itemStartYear = 1
              itemEndYear = parent.supportUntilAge
                ? Math.max(1, parent.supportUntilAge - parent.age)
                : Math.max(1, 80 - parent.age)
            } else {
              scaledAmount = 0
            }
          }
        }

        // Lifestyle adjustment
        if (lifestyle === 'bare_minimum' && !sub.essential) {
          scaledAmount = 0
        } else if (lifestyle === 'luxury') {
          scaledAmount = sub.essential
            ? Math.round((scaledAmount * 1.15) / 50) * 50
            : Math.round((scaledAmount * 1.5) / 50) * 50
        }

        // Apply member scaling (non-linear) only to non-zero amounts for general household items
        if (scaledAmount > 0 && memberCount > 1 && cat.id !== 'family') {
          const memberMultiplier = 1 + (memberCount - 1) * getMemberScalingFactor(cat.id)
          scaledAmount = Math.round((scaledAmount * memberMultiplier) / 50) * 50
        }

        return {
          id: generateId(sub.id, idx),
          categoryId: cat.id as CategoryId,
          name: sub.name,
          amount: scaledAmount,
          frequency: sub.frequency as Frequency,
          everyNYears: sub.everyNYears,
          essential: sub.essential,
          appliesTo: 'household',
          startYear: itemStartYear,
          endYear: itemEndYear,
          type,
          notes: sub.help || '',
          skipped: false,
          linkedMemberRelationship: sub.linkedMemberRelationship,
        }
      }),
    }
  })
}
