import { describe, it, expect } from 'vitest'
import { FINANCIAL_CALCULATORS } from '@/components/ui/CalculatorsDropdown'

describe('FINANCIAL_CALCULATORS configuration', () => {
  it('contains the primary retirement fund calculator', () => {
    const primary = FINANCIAL_CALCULATORS.find((c) => c.category === 'primary')
    expect(primary).toBeDefined()
    expect(primary?.id).toBe('fund')
    expect(primary?.status).toBe('active')
    expect(primary?.name).toContain('Retirement Fund Calculator')
  })

  it('contains planned helper calculators', () => {
    const helperIds = FINANCIAL_CALCULATORS.filter((c) => c.category === 'helper').map((c) => c.id)
    expect(helperIds).toContain('sip')
    expect(helperIds).toContain('investment')
    expect(helperIds).toContain('fd')
    expect(helperIds).toContain('interest')
  })

  it('marks all four helper calculators as active', () => {
    const helperIds = ['sip', 'investment', 'fd', 'interest']
    for (const id of helperIds) {
      const calc = FINANCIAL_CALCULATORS.find((c) => c.id === id)
      expect(calc?.status).toBe('active')
      expect(calc?.badge).toBe('Active')
    }
  })
})
