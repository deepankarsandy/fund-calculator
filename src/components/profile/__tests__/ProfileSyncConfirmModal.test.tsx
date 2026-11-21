import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ProfileSyncConfirmModal } from '../ProfileSyncConfirmModal'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

describe('ProfileSyncConfirmModal', () => {
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

  it('renders nothing when isOpen is false', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    act(() => {
      createRoot(container!).render(
        <ProfileSyncConfirmModal isOpen={false} onClose={handleClose} onConfirm={handleConfirm} />
      )
    })

    expect(container?.innerHTML).toBe('')
  })

  it('renders confirmation dialog with expected contents when isOpen is true', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    act(() => {
      createRoot(container!).render(
        <ProfileSyncConfirmModal isOpen={true} onClose={handleClose} onConfirm={handleConfirm} />
      )
    })

    const text = container?.textContent || ''
    expect(text).toContain('Apply Profile Defaults to Calculators?')
    expect(text).toContain('Will be updated to profile defaults')
    expect(text).toContain('Will NOT be reset or removed (Protected)')
    expect(text).toContain('Retirement age')
    expect(text).toContain('mobile recharge')
    expect(text).toContain('entered dependents')
  })

  it('triggers onConfirm when Confirm & Save Defaults button is clicked', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    act(() => {
      createRoot(container!).render(
        <ProfileSyncConfirmModal isOpen={true} onClose={handleClose} onConfirm={handleConfirm} />
      )
    })

    const buttons = container?.querySelectorAll('button')
    const confirmBtn = Array.from(buttons || []).find((btn) =>
      btn.textContent?.includes('Confirm & Save Defaults')
    )
    expect(confirmBtn).toBeDefined()

    act(() => {
      confirmBtn?.click()
    })

    expect(handleConfirm).toHaveBeenCalledTimes(1)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('triggers onClose when Cancel button is clicked', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    act(() => {
      createRoot(container!).render(
        <ProfileSyncConfirmModal isOpen={true} onClose={handleClose} onConfirm={handleConfirm} />
      )
    })

    const buttons = container?.querySelectorAll('button')
    const cancelBtn = Array.from(buttons || []).find((btn) => btn.textContent?.trim() === 'Cancel')
    expect(cancelBtn).toBeDefined()

    act(() => {
      cancelBtn?.click()
    })

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(handleConfirm).not.toHaveBeenCalled()
  })
})
