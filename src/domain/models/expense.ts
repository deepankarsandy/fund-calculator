export type Frequency =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly'
  | 'every_n_years'
  | 'one_time'

export type ExpenseType = 'recurring' | 'one_time' | 'periodic'

export type CategoryId =
  | 'housing'
  | 'food'
  | 'utilities'
  | 'transport'
  | 'healthcare'
  | 'personal'
  | 'technology'
  | 'family'
  | 'financial'
  | 'emergency'
  | 'custom'

export interface ExpenseItem {
  id: string
  categoryId: CategoryId
  parentId?: string
  name: string
  amount: number
  frequency: Frequency
  everyNYears?: number
  essential: boolean
  appliesTo: 'household' | string[]
  inflationRate?: number
  startYear: number
  endYear?: number
  type: ExpenseType
  notes: string
  skipped: boolean
}

export interface ExpenseCategory {
  id: CategoryId
  label: string
  description: string
  defaultInflationRate: number
  items: ExpenseItem[]
  parentAmount?: number
  parentFrequency?: Frequency
  skipped: boolean
}

export const FREQUENCY_MULTIPLIERS: Record<Frequency, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  half_yearly: 2,
  yearly: 1,
  every_n_years: 0,
  one_time: 0,
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half-Yearly',
  yearly: 'Yearly',
  every_n_years: 'Every N Years',
  one_time: 'One-Time',
}
