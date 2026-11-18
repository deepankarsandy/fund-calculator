import type { AreaType, LifestyleScenario } from '@/domain/models/profile'
import type { ExpenseCategory, CategoryId, Frequency, ExpenseType } from '@/domain/models/expense'
import { EXPENSE_CATEGORIES_CONFIG } from '@/config/formFields'

// Multipliers for different living costs across India
export const AREA_MULTIPLIERS: Record<AreaType, { label: string; baseMultiplier: number; description: string }> = {
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

export function buildCategoriesForProfile(
  areaType: AreaType = 'small_town',
  lifestyle: LifestyleScenario = 'comfortable',
): ExpenseCategory[] {
  return EXPENSE_CATEGORIES_CONFIG.map(cat => {
    const factor = CATEGORY_AREA_FACTORS[cat.id]?.[areaType] ?? AREA_MULTIPLIERS[areaType].baseMultiplier

    return {
      id: cat.id as CategoryId,
      label: cat.label,
      description: cat.description,
      defaultInflationRate: cat.defaultInflationRate,
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

        // If bare minimum lifestyle, reduce discretionary to 0 or 50%
        if (lifestyle === 'bare_minimum' && !sub.essential) {
          scaledAmount = 0
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
          startYear: 1,
          type,
          notes: sub.help || '',
          skipped: false,
        }
      }),
    }
  })
}
