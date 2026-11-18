import type { ExpenseCategory, CategoryId, Frequency, ExpenseType } from '../models/expense'
import { EXPENSE_CATEGORIES_CONFIG } from '@/config/formFields'

function generateId(prefix: string, idx: number): string {
  return `${prefix}_${idx}_${Math.random().toString(36).slice(2, 6)}`
}

export function buildDefaultCategories(): ExpenseCategory[] {
  return EXPENSE_CATEGORIES_CONFIG.map(cat => ({
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

      return {
        id: generateId(sub.id, idx),
        categoryId: cat.id as CategoryId,
        name: sub.name,
        amount: sub.defaultAmount,
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
  }))
}

export const DEFAULT_CATEGORIES: ExpenseCategory[] = buildDefaultCategories()
