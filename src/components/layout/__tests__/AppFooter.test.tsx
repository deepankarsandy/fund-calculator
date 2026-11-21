import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AppFooter } from '../AppFooter'
import * as router from '@/lib/router'

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

  it('renders brand title, tagline, and local & private guarantee badge', () => {
    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const text = container?.textContent || ''
    expect(text).toContain('Fund Calculator')
    expect(text).toContain('Personal Financial Planning Suite')
    expect(text).toContain('tailored for Indian households')
    expect(text).toContain('100% Local & Private')
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

  it('renders the mandatory disclaimer callout matching home page requirements', () => {
    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const text = container?.textContent || ''
    expect(text).toContain('Important Disclaimer')
    expect(text).toContain('estimation and scenario planning tool')
    expect(text).toContain('not regulated financial advice')
    expect(text).toContain('SEBI regulations')
  })

  it('navigates to calculators when calculator links are clicked', () => {
    const navCalcSpy = vi.spyOn(router, 'navigateToCalculator').mockImplementation(() => {})
    const navSIPSpy = vi.spyOn(router, 'navigateToSIP').mockImplementation(() => {})
    const navInvestSpy = vi.spyOn(router, 'navigateToInvestment').mockImplementation(() => {})
    const navFDSpy = vi.spyOn(router, 'navigateToFD').mockImplementation(() => {})
    const navLoanSpy = vi.spyOn(router, 'navigateToLoanEMI').mockImplementation(() => {})

    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const buttons = Array.from(container?.querySelectorAll('button') || [])

    // Retirement Fund button
    const fundBtn = buttons.find((b) => b.textContent?.includes('Retirement Fund'))
    expect(fundBtn).toBeDefined()
    act(() => {
      fundBtn?.click()
    })
    expect(navCalcSpy).toHaveBeenCalledWith(1)

    // SIP button
    const sipBtn = buttons.find((b) => b.textContent?.includes('SIP & Step-Up Calculator'))
    expect(sipBtn).toBeDefined()
    act(() => {
      sipBtn?.click()
    })
    expect(navSIPSpy).toHaveBeenCalledTimes(1)

    // Investment button
    const investBtn = buttons.find((b) => b.textContent?.includes('Custom Plan & CAGR'))
    expect(investBtn).toBeDefined()
    act(() => {
      investBtn?.click()
    })
    expect(navInvestSpy).toHaveBeenCalledTimes(1)

    // FD button
    const fdBtn = buttons.find((b) => b.textContent?.includes('Fixed Deposit (FD)'))
    expect(fdBtn).toBeDefined()
    act(() => {
      fdBtn?.click()
    })
    expect(navFDSpy).toHaveBeenCalledTimes(1)

    // Loan EMI button
    const loanBtn = buttons.find((b) => b.textContent?.includes('Loan EMI & Prepayment'))
    expect(loanBtn).toBeDefined()
    act(() => {
      loanBtn?.click()
    })
    expect(navLoanSpy).toHaveBeenCalledTimes(1)
  })

  it('navigates to resources (logic, profile, export-import)', () => {
    const navLogicSpy = vi.spyOn(router, 'navigateToLogic').mockImplementation(() => {})
    const navProfileSpy = vi.spyOn(router, 'navigateToProfile').mockImplementation(() => {})
    const navExportSpy = vi.spyOn(router, 'navigateToExportImport').mockImplementation(() => {})

    act(() => {
      createRoot(container!).render(<AppFooter />)
    })

    const buttons = Array.from(container?.querySelectorAll('button') || [])

    const logicBtn = buttons.find((b) => b.textContent?.includes('Calculation Logic & Formulas'))
    act(() => {
      logicBtn?.click()
    })
    expect(navLogicSpy).toHaveBeenCalledTimes(1)

    const profileBtn = buttons.find((b) => b.textContent?.includes('User Profile & City Defaults'))
    act(() => {
      profileBtn?.click()
    })
    expect(navProfileSpy).toHaveBeenCalledTimes(1)

    const backupBtn = buttons.find((b) => b.textContent?.includes('Backup & Restore (JSON)'))
    act(() => {
      backupBtn?.click()
    })
    expect(navExportSpy).toHaveBeenCalledTimes(1)
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
