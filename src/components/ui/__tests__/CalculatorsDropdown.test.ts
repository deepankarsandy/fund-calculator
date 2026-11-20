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

  it('marks helper calculators with coming_soon status', () => {
    const helpers = FINANCIAL_CALCULATORS.filter((c) => c.category === 'helper')
    for (const helper of helpers) {
      expect(helper.status).toBe('coming_soon')
      expect(helper.badge).toBe('Coming Soon')
    }
  })
})
