import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AppFooter } from '../AppFooter'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

describe('AppFooter', () => {
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
    vi.restoreAllMocks()
  })

  it('renders copyright notice with current year', () => {
    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const text = container?.textContent || ''
    expect(text).toContain(`© ${new Date().getFullYear()} Fund Calculator`)
    expect(text).toContain('Open Source Personal Financial Planning Suite')
  })

  it('renders social links for GitHub, LinkedIn, and Instagram in footer', () => {
    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const githubLink = container?.querySelector('a[href="https://github.com/deepankarsandy"]')
    const linkedinLink = container?.querySelector(
      'a[href="https://www.linkedin.com/in/deepankarsandhibigraha"]'
    )
    const instagramLink = container?.querySelector(
      'a[href="https://www.instagram.com/deepankar_sandy"]'
    )

    expect(githubLink).not.toBeNull()
    expect(linkedinLink).not.toBeNull()
    expect(instagramLink).not.toBeNull()

    expect(githubLink?.getAttribute('target')).toBe('_blank')
    expect(linkedinLink?.getAttribute('target')).toBe('_blank')
    expect(instagramLink?.getAttribute('target')).toBe('_blank')
  })

  it('renders the mandatory disclaimer callout matching requirements', () => {
    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const text = container?.textContent || ''
    expect(text).toContain('Important Disclaimer')
    expect(text).toContain('estimation and scenario planning tool')
    expect(text).toContain('not regulated financial advice')
    expect(text).toContain('SEBI regulations')
  })

  it('does not render removed brand logo, descriptions, calculator list, or resource links', () => {
    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const text = container?.textContent || ''
    expect(text).not.toContain('Calculators')
    expect(text).not.toContain('SIP & Step-Up Calculator')
    expect(text).not.toContain('Calculation Logic & Formulas')
    expect(text).not.toContain('100% Local & Private')
    expect(text).not.toContain('tailored for Indian households')
  })

  it('scrolls to top when Back to top button is clicked', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const buttons = Array.from(container?.querySelectorAll('button') || [])
    const backToTopBtn = buttons.find((b) => b.textContent?.includes('Back to top'))
    expect(backToTopBtn).toBeDefined()

    act(() => {
      backToTopBtn?.click()
    })

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
