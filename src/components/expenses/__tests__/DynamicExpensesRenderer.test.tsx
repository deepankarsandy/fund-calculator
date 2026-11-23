import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

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
  configurable: true,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  })
}

const { DynamicExpensesRenderer } = await import('../DynamicExpensesRenderer')
const { saveCleanView } = await import('@/lib/cleanView')
const { useScenarioStore } = await import('@/store/useScenarioStore')

describe('DynamicExpensesRenderer Clean View & Row Details', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    memoryStore.clear()
    document.documentElement.classList.remove('clean-view')
    saveCleanView(false)
    container = document.createElement('div')
    document.body.appendChild(container)
    useScenarioStore.getState().reset()
  })

  afterEach(() => {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container)
    }
    container = null
    memoryStore.clear()
    document.documentElement.classList.remove('clean-view')
  })

  it('renders with "More" option ON by default in normal mode (clean view off), showing "Less" button', async () => {
    saveCleanView(false)

    let root: any
    act(() => {
      root = createRoot(container!)
      root.render(<DynamicExpensesRenderer />)
    })

    // Find "Expand All" button
    const expandAllButton = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Expand All')
    )
    expect(expandAllButton).toBeDefined()

    act(() => {
      expandAllButton?.click()
    })

    // Find expense item rows
    const rows = container?.querySelectorAll('.expense-item-row')
    expect(rows?.length).toBeGreaterThan(0)

    const firstRow = rows?.[0]
    expect(firstRow).toBeDefined()
    // Should have standard border and padding in normal mode
    expect(firstRow?.className).toContain('border-zinc-200')
    expect(firstRow?.className).toContain('p-3')

    // In normal mode, row details are open by default and show the "Less" button
    const lessButton = Array.from(firstRow?.querySelectorAll('button') || []).find(
      (b) => b.textContent?.trim() === 'Less'
    )
    expect(lessButton).toBeDefined()
    expect(firstRow?.textContent).toContain('Essential Expense')
    expect(firstRow?.textContent).toContain('Start Year:')

    // Clicking "Less" toggles it to "More" and hides details
    act(() => {
      lessButton?.click()
    })

    const moreButton = Array.from(firstRow?.querySelectorAll('button') || []).find(
      (b) => b.textContent?.trim() === 'More'
    )
    expect(moreButton).toBeDefined()
    expect(firstRow?.textContent).not.toContain('Essential Expense')

    // Clicking "More" toggles back to "Less" and shows details again
    act(() => {
      moreButton?.click()
    })

    const lessButtonAgain = Array.from(firstRow?.querySelectorAll('button') || []).find(
      (b) => b.textContent?.trim() === 'Less'
    )
    expect(lessButtonAgain).toBeDefined()
    expect(firstRow?.textContent).toContain('Essential Expense')

    act(() => {
      root.unmount()
    })
  })

  it('removes margin and border, and lowers padding when clean view mode is on', async () => {
    saveCleanView(true)

    let root: any
    act(() => {
      root = createRoot(container!)
      root.render(<DynamicExpensesRenderer />)
    })

    // Expand all categories
    const expandAllButton = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Expand All')
    )
    act(() => {
      expandAllButton?.click()
    })

    const rows = container?.querySelectorAll('.expense-item-row')
    expect(rows?.length).toBeGreaterThan(0)

    const firstRow = rows?.[0]
    expect(firstRow).toBeDefined()

    // Clean mode styling checks:
    // border removed (border-0, border-transparent)
    expect(firstRow?.className).toContain('border-0')
    expect(firstRow?.className).toContain('border-transparent')
    expect(firstRow?.className).toContain('shadow-none')

    // margin removed (my-0)
    expect(firstRow?.className).toContain('my-0')

    // padding lowered (p-1.5, sm:p-2)
    expect(firstRow?.className).toContain('p-1.5')
    expect(firstRow?.className).not.toContain('p-3')

    // In clean view mode, details start collapsed (More button shown) to look compact
    const moreButton = Array.from(firstRow?.querySelectorAll('button') || []).find(
      (b) => b.textContent?.trim() === 'More'
    )
    expect(moreButton).toBeDefined()

    act(() => {
      root.unmount()
    })
  })
})
