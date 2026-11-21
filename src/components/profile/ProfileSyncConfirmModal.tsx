import { useEffect } from 'react'
import { X, Sparkles, Check, ShieldCheck, AlertCircle } from 'lucide-react'

interface ProfileSyncConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ProfileSyncConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: ProfileSyncConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-sync-confirm-title"
    >
      <div className="relative w-full max-w-lg bg-card text-foreground border border-border rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="profile-sync-confirm-title"
                className="text-base font-extrabold text-foreground"
              >
                Apply Profile Defaults to Calculators?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto-apply to all 5 calculators is enabled
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Content */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Saving will update specific baseline parameters across all 5 calculators to match your
          profile defaults, while safely preserving your custom inputs:
        </p>

        <div className="space-y-3">
          {/* Will Update */}
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200">
              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Will be updated to profile defaults:</span>
            </div>
            <ul className="text-[11px] text-blue-800 dark:text-blue-300 space-y-1 pl-5 list-disc">
              <li>
                <strong>Retirement age, current age & horizon</strong> across planners and SIP/SWP
              </li>
              <li>
                <strong>Calculation type & inflation rates</strong> (overall and category sector
                inflation)
              </li>
              <li>
                <strong>Expected return baselines</strong> (equity, debt, FD rate, loan interest)
              </li>
              <li>
                <strong>Tax bracket & tax regime</strong> (new vs old, LTCG tax rate)
              </li>
              <li>
                <strong>Monthly earned income & growth rate</strong>
              </li>
              <li>
                <strong>EPF maturity (8.25%) & NPS annuity (40% at 6% p.a.)</strong> auto-calculated
                in Income & Savings
              </li>
            </ul>
          </div>

          {/* Will NOT Update / Protected */}
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Will NOT be reset or removed (Protected):</span>
            </div>
            <ul className="text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1 pl-5 list-disc">
              <li>
                <strong>Your entered expenses:</strong> Custom amounts like mobile recharge,
                groceries, rent, and custom items remain intact
              </li>
              <li>
                <strong>Your entered dependents:</strong> Added household members (spouse, children,
                parents) are preserved
              </li>
              <li>
                <strong>Custom income streams & insurance plans:</strong> Existing rental income,
                custom insurance plans starting from current year, and custom lump sums remain
                intact
              </li>
              <li>
                <strong>Custom calculator inputs:</strong> Custom loan amounts, tenures, and FD
                deposits remain untouched
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Callout */}
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border">
          <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>
            Only profile-configured defaults will be synchronized. Your personalized budget details
            will not be lost.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors cursor-pointer hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Confirm & Save Defaults</span>
          </button>
        </div>
      </div>
    </div>
  )
}
