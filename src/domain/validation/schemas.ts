import { z } from 'zod'

export const profileSchema = z
  .object({
    country: z.string().min(1, 'Country is required'),
    region: z.string().optional(),
    city: z.string().optional(),
    currency: z.string().min(1),
    currentAge: z
      .number()
      .int()
      .min(1, 'Age must be at least 1')
      .max(120, 'Age must be under 120'),
    targetAge: z
      .number()
      .int()
      .min(2, 'Target age must be at least 2')
      .max(120, 'Target age must be under 120'),
    householdSize: z.number().int().min(1).max(50),
    lifestyleScenario: z.enum(['bare_minimum', 'comfortable', 'custom']),
  })
  .refine(d => d.targetAge > d.currentAge, {
    message: 'Target age must be greater than current age',
    path: ['targetAge'],
  })

export const expenseItemSchema = z
  .object({
    amount: z.number().min(0, 'Amount cannot be negative'),
    frequency: z.enum([
      'weekly',
      'monthly',
      'quarterly',
      'half_yearly',
      'yearly',
      'every_n_years',
      'one_time',
    ]),
    everyNYears: z.number().int().min(1).optional(),
    essential: z.boolean(),
    inflationRate: z.number().min(-0.99).max(2).optional(),
    startYear: z.number().int().min(1),
    endYear: z.number().int().min(1).optional(),
  })
  .refine(d => !d.endYear || d.endYear >= d.startYear, {
    message: 'End year must be ≥ start year',
    path: ['endYear'],
  })

export const assumptionsSchema = z.object({
  globalInflationRate: z.number().gt(-1, 'Must be > -100%'),
  annualInvestmentReturn: z.number().gt(-1, 'Must be > -100%'),
  returnBasis: z.enum(['gross', 'net']),
  investmentFeeRate: z.number().min(0).max(1),
  taxDragRate: z.number().min(0).max(1),
  safetyMarginPercent: z.number().min(0).max(2),
  withdrawalTiming: z.enum(['beginning_of_year', 'end_of_year']),
})
