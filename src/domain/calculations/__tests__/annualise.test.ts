import { describe, it, expect } from 'vitest'
import { annualiseExpense, totalAnnualExpense } from '../annualise'
import type { ExpenseItem } from '../../models/expense'

function makeItem(overrides: Partial<ExpenseItem> = {}): ExpenseItem {
  return {
    id: 'test',
    categoryId: 'housing',
    name: 'Test',
    amount: 1000,
    frequency: 'monthly',
    essential: true,
    appliesTo: 'household',
    startYear: 1,
    type: 'recurring',
    notes: '',
    skipped: false,
    ...overrides,
  }
}

describe('annualiseExpense', () => {
  it('Test 1a: monthly ₹800 → ₹9,600 annually', () => {
    const item = makeItem({ amount: 800, frequency: 'monthly' })
    expect(annualiseExpense(item)).toBe(9600)
  })

  it('Test 1b: yearly ₹10,000 → ₹10,000 annually', () => {
    const item = makeItem({ amount: 10000, frequency: 'yearly' })
    expect(annualiseExpense(item)).toBe(10000)
  })

  it('Test 1c: combined monthly + yearly total = ₹19,600', () => {
    const items = [
      makeItem({ amount: 800, frequency: 'monthly' }),
      makeItem({ amount: 10000, frequency: 'yearly' }),
    ]
    expect(totalAnnualExpense(items)).toBe(19600)
  })

  it('returns 0 for one_time frequency', () => {
    const item = makeItem({ amount: 200000, frequency: 'one_time', type: 'one_time' })
    expect(annualiseExpense(item)).toBe(0)
  })

  it('returns 0 for skipped item', () => {
    const item = makeItem({ skipped: true })
    expect(annualiseExpense(item)).toBe(0)
  })

  it('handles every_n_years correctly', () => {
    const item = makeItem({ amount: 100000, frequency: 'every_n_years', everyNYears: 10 })
    expect(annualiseExpense(item)).toBe(10000)
  })

  it('handles quarterly frequency', () => {
    const item = makeItem({ amount: 2500, frequency: 'quarterly' })
    expect(annualiseExpense(item)).toBe(10000)
  })
})
