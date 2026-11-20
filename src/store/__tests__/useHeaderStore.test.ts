import { describe, it, expect, beforeEach } from 'vitest'
import { useHeaderStore, DEFAULT_PAGE_HEADERS } from '@/store/useHeaderStore'

describe('useHeaderStore', () => {
  beforeEach(() => {
    useHeaderStore.getState().resetHeader()
  })

  it('initializes with default home page header', () => {
    const state = useHeaderStore.getState()
    expect(state.title).toBe('Fund Calculator')
    expect(state.subtitle).toBe('Retirement & Financial Planning')
    expect(state.currentActive).toBeUndefined()
    expect(state.showPrivateBadge).toBe(true)
    expect(state.showStepper).toBe(false)
  })

  it('updates header configuration for specific pages', () => {
    const { setHeaderForPage } = useHeaderStore.getState()

    setHeaderForPage('calculator')
    expect(useHeaderStore.getState().currentActive).toBe('fund')
    expect(useHeaderStore.getState().showStepper).toBe(true)
    expect(useHeaderStore.getState().subtitle).toContain('Retirement Fund Calculator')

    setHeaderForPage('sip')
    expect(useHeaderStore.getState().currentActive).toBe('sip')
    expect(useHeaderStore.getState().showStepper).toBe(false)

    setHeaderForPage('investment')
    expect(useHeaderStore.getState().currentActive).toBe('investment')

    setHeaderForPage('fd')
    expect(useHeaderStore.getState().currentActive).toBe('fd')

    setHeaderForPage('interest')
    expect(useHeaderStore.getState().currentActive).toBe('interest')

    setHeaderForPage('profile')
    expect(useHeaderStore.getState().currentActive).toBe('profile')

    setHeaderForPage('logic')
    expect(useHeaderStore.getState().currentActive).toBe('logic')
  })

  it('falls back to home configuration for unknown pages', () => {
    const { setHeaderForPage } = useHeaderStore.getState()
    setHeaderForPage('unknown_route')
    expect(useHeaderStore.getState().subtitle).toBe(DEFAULT_PAGE_HEADERS.home.subtitle)
  })

  it('allows dynamic customization via setHeaderConfig', () => {
    const { setHeaderConfig } = useHeaderStore.getState()
    setHeaderConfig({ subtitle: 'Custom Dynamic Subtitle', showPrivateBadge: false })
    expect(useHeaderStore.getState().subtitle).toBe('Custom Dynamic Subtitle')
    expect(useHeaderStore.getState().showPrivateBadge).toBe(false)
  })
})
