import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ProfilePage from '../ProfilePage'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const memoryStore = new Map<string, string>()

const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => memoryStore.set(key, value),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
}

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('ProfilePage Tab Navigation and Sticky Tabs', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    mockLocalStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container)
    }
    container = null
    vi.clearAllMocks()
  })

  it('renders sticky tab navigation bar and default Personal tab', () => {
    act(() => {
      createRoot(container!).render(<ProfilePage onBackToHome={vi.fn()} />)
    })

    // Check sticky header
    const stickyContainer = container?.querySelector('.sticky.top-\\[60px\\]')
    expect(stickyContainer).not.toBeNull()

    // Check tab labels exist
    expect(container?.textContent).toContain('Personal & Horizon')
    expect(container?.textContent).toContain('Dependents')
    expect(container?.textContent).toContain('Inflation Defaults')
    expect(container?.textContent).toContain('Income, Savings & Tax')
    expect(container?.textContent).toContain('Returns & Interest')

    // Active tab initially Personal
    expect(container?.textContent).toContain('Date of Birth & Lifestyle Baseline')
  })

  it('renders next-prev tab navigation buttons beside the save button with tab counter', () => {
    act(() => {
      createRoot(container!).render(<ProfilePage onBackToHome={vi.fn()} />)
    })

    const prevBtn = container?.querySelector(
      'button[aria-label="Previous tab"]'
    ) as HTMLButtonElement
    const nextBtn = container?.querySelector('button[aria-label="Next tab"]') as HTMLButtonElement

    expect(prevBtn).not.toBeNull()
    expect(nextBtn).not.toBeNull()
    expect(prevBtn.textContent).toContain('Prev Tab')
    expect(nextBtn.textContent).toContain('Next Tab')

    // Initial state: first tab (Tab 1 of 5)
    expect(container?.textContent).toContain('Tab 1 of 5')
    expect(prevBtn.disabled).toBe(true)
    expect(nextBtn.disabled).toBe(false)
  })

  it('navigates through tabs sequentially using Next Tab and Prev Tab buttons', () => {
    act(() => {
      createRoot(container!).render(<ProfilePage onBackToHome={vi.fn()} />)
    })

    const prevBtn = container?.querySelector(
      'button[aria-label="Previous tab"]'
    ) as HTMLButtonElement
    const nextBtn = container?.querySelector('button[aria-label="Next tab"]') as HTMLButtonElement

    // Click Next Tab -> Tab 2 (Dependents)
    act(() => {
      nextBtn.click()
    })

    expect(container?.textContent).toContain('Tab 2 of 5')
    expect(prevBtn.disabled).toBe(false)
    expect(nextBtn.disabled).toBe(false)
    expect(container?.textContent).toContain('Default Household Dependents for Retirement Planning')

    // Click Next Tab -> Tab 3 (Inflation Defaults)
    act(() => {
      nextBtn.click()
    })
    expect(container?.textContent).toContain('Tab 3 of 5')
    expect(container?.textContent).toContain('Inflation Mode Preference')

    // Click Next Tab -> Tab 4 (Income, Savings & Tax)
    act(() => {
      nextBtn.click()
    })
    expect(container?.textContent).toContain('Tab 4 of 5')
    expect(container?.textContent).toContain('Current Monthly Take-Home Income')

    // Click Next Tab -> Tab 5 (Returns & Interest)
    act(() => {
      nextBtn.click()
    })
    expect(container?.textContent).toContain('Tab 5 of 5')
    expect(container?.textContent).toContain('Default Expected Return Rates & Interest Benchmarks')
    expect(nextBtn.disabled).toBe(true)
    expect(prevBtn.disabled).toBe(false)

    // Click Prev Tab -> Tab 4
    act(() => {
      prevBtn.click()
    })
    expect(container?.textContent).toContain('Tab 4 of 5')
    expect(nextBtn.disabled).toBe(false)
  })

  it('allows jumping to tabs directly via the sticky tab buttons', () => {
    act(() => {
      createRoot(container!).render(<ProfilePage onBackToHome={vi.fn()} />)
    })

    const buttons = Array.from(container?.querySelectorAll('button') || [])
    const returnsTabBtn = buttons.find((b) => b.textContent?.includes('Returns & Interest'))
    expect(returnsTabBtn).toBeDefined()

    act(() => {
      returnsTabBtn?.click()
    })

    expect(container?.textContent).toContain('Tab 5 of 5')
    expect(container?.textContent).toContain('Expected Equity / Mutual Fund Return')

    const nextBtn = container?.querySelector('button[aria-label="Next tab"]') as HTMLButtonElement
    expect(nextBtn.disabled).toBe(true)
  })
})
