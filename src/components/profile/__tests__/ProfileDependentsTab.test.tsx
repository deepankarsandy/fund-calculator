import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ProfileDependentsTab } from '../ProfileDependentsTab'
import type { HouseholdMember } from '@/domain/models/household'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

describe('ProfileDependentsTab', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container)
    }
    container = null
  })

  it('renders empty state when no dependents are provided', () => {
    const handleChange = vi.fn()

    act(() => {
      createRoot(container!).render(
        <ProfileDependentsTab dependents={[]} onChange={handleChange} userCurrentAge={30} />
      )
    })

    const text = container?.textContent || ''
    expect(text).toContain('No Default Dependents Added')
    expect(text).toContain('Default Household Dependents for Retirement Planning')
  })

  it('triggers quick-add callbacks when preset buttons are clicked', () => {
    const handleChange = vi.fn()

    act(() => {
      createRoot(container!).render(
        <ProfileDependentsTab dependents={[]} onChange={handleChange} userCurrentAge={35} />
      )
    })

    const buttons = Array.from(container?.querySelectorAll('button') || [])
    const addSpouseBtn = buttons.find((b) => b.textContent?.includes('+ Spouse'))
    expect(addSpouseBtn).toBeDefined()

    act(() => {
      addSpouseBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
    const addedList = handleChange.mock.calls[0][0] as HouseholdMember[]
    expect(addedList).toHaveLength(1)
    expect(addedList[0].relationship).toBe('spouse')
    expect(addedList[0].label).toBe('Spouse')
  })

  it('renders cards for each dependent and displays summary pills', () => {
    const handleChange = vi.fn()
    const dependents: HouseholdMember[] = [
      {
        id: 'spouse-1',
        label: 'Ananya',
        relationship: 'spouse',
        age: 32,
        financiallyDependent: true,
        hasHealthInsurance: true,
      },
      {
        id: 'child-1',
        label: 'Aarav',
        relationship: 'child',
        age: 5,
        financiallyDependent: true,
        supportUntilAge: 25,
        hasHealthInsurance: false,
      },
    ]

    act(() => {
      createRoot(container!).render(
        <ProfileDependentsTab dependents={dependents} onChange={handleChange} userCurrentAge={35} />
      )
    })

    const text = container?.textContent || ''
    expect(text).toContain('2 Default Dependents Configured')
    expect(text).toContain('1 Child (Education Horizon)')
    expect(text).toContain('Ananya')
    expect(text).toContain('Aarav')
  })
})
