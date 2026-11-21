import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { CleanViewToggle } from '../CleanViewToggle'
import { saveCleanView } from '@/lib/cleanView'

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

describe('CleanViewToggle Component', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    memoryStore.clear()
    document.documentElement.classList.remove('clean-view')
    saveCleanView(false)
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container)
    }
    container = null
    memoryStore.clear()
    document.documentElement.classList.remove('clean-view')
  })

  it('renders correctly with default off state and tooltip', () => {
    act(() => {
      createRoot(container!).render(<CleanViewToggle />)
    })

    const button = container?.querySelector('button')
    expect(button).not.toBeNull()
    expect(button?.getAttribute('role')).toBe('switch')
    expect(button?.getAttribute('aria-checked')).toBe('false')
    expect(button?.getAttribute('title')).toContain('Clean View: OFF')
    expect(document.documentElement.classList.contains('clean-view')).toBe(false)
  })

  it('toggles clean view on and off on click with appropriate tooltip and document class', () => {
    act(() => {
      createRoot(container!).render(<CleanViewToggle />)
    })

    const button = container?.querySelector('button')
    expect(button).not.toBeNull()

    // Click to turn ON
    act(() => {
      button?.click()
    })

    expect(button?.getAttribute('aria-checked')).toBe('true')
    expect(button?.getAttribute('title')).toContain('Clean View: ON')
    expect(document.documentElement.classList.contains('clean-view')).toBe(true)

    // Click to turn OFF
    act(() => {
      button?.click()
    })

    expect(button?.getAttribute('aria-checked')).toBe('false')
    expect(button?.getAttribute('title')).toContain('Clean View: OFF')
    expect(document.documentElement.classList.contains('clean-view')).toBe(false)
  })
})
