import type { ExpenseCategory } from '../models/expense'
import { buildCategoriesForProfile } from '../calculations/areaDefaults'

export const DEFAULT_CATEGORIES: ExpenseCategory[] = buildCategoriesForProfile('small_town', 'comfortable')
