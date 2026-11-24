import React, { useState } from 'react'
import {
  TrendingUp,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  PlusCircle,
} from 'lucide-react'
import { useRouter } from '@/lib/router'
import { formatINR, formatCrore } from '@/lib/currency'
import { useScenarioStore } from '@/store/useScenarioStore'
import { useCleanView } from '@/lib/cleanView'
import { cn } from '@/lib/cn'
import {
  LinkedCalculatorsConfig,
  getLinkedCalculatorsConfig,
  saveLinkedCalculatorsConfig,
  getSipSummaries,
  getFdSummaries,
  getPpfSummary,
  SipLinkedType,
  FdLinkedType,
  applyLinkedDataToStore,
} from '@/lib/linkedCalculatorsStorage'
import { saveStoredFdPageTab } from '@/lib/ppfStorage'
import { runScenarios } from '@/domain/calculations/runScenarios'

// ─── 1. Standalone SIP & SWP Inflow Card ──────────────────────────────────────

function SipCumulativeImpactBox({
  activeTypes,
  totalCumulativeValue,
  totalMonthlyInflow,
  sipSummaries,
}: {
  activeTypes: SipLinkedType[]
  totalCumulativeValue: number
  totalMonthlyInflow: number
  sipSummaries: Record<SipLinkedType, any>
}) {
  if (activeTypes.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-3 sm:p-3.5 text-xs text-muted-foreground flex items-center justify-between gap-2">
        <span>No SIP/SWP inflows included in plan. Toggle any subtype above to include.</span>
        <span className="font-semibold text-zinc-500 text-[11px] shrink-0">0 of 3 Active</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Total Cumulative SIP & SWP Impact
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
          {activeTypes.length} of 3 Types Active
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-emerald-200/40 dark:border-emerald-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Total Cumulative Inflow Value
          </span>
          <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCrore(totalCumulativeValue)}
          </span>
        </div>
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-emerald-200/40 dark:border-emerald-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Active Monthly Cashflow / Contribution
          </span>
          <span className="text-base sm:text-lg font-extrabold text-foreground">
            {formatINR(totalMonthlyInflow)}/mo
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        <strong>Included in plan:</strong>{' '}
        {activeTypes.map((t) => sipSummaries[t]?.label?.split('(')[0]?.trim()).join(', ')}
      </p>
    </div>
  )
}

export function LinkedSipInflowCard() {
  const router = useRouter()
  const { isCleanView } = useCleanView()
  const { assets, categories, setAssets, setResults, profile, members, assumptions, results } =
    useScenarioStore()

  const [config, setConfig] = useState<LinkedCalculatorsConfig>(() => getLinkedCalculatorsConfig())
  const sipSummaries = getSipSummaries()

  const updateConfig = (newConfig: LinkedCalculatorsConfig) => {
    setConfig(newConfig)
    saveLinkedCalculatorsConfig(newConfig)

    // Synchronize into ScenarioStore
    const { updatedAssets, updatedCategories } = applyLinkedDataToStore(
      assets,
      categories,
      newConfig
    )
    setAssets(updatedAssets)

    // Recompute if results already exist
    if (results) {
      const newResults = runScenarios({
        profile,
        members,
        categories: updatedCategories,
        assumptions,
        assets: updatedAssets as any,
      })
      setResults(newResults)
    }
  }

  const sipTypes: SipLinkedType[] = ['sip', 'swp', 'combo']
  const activeSipTypes = config.sip.enabled
    ? sipTypes.filter((t) => config.sip.enabledTypes[t])
    : []
  const activeSipCount = activeSipTypes.length

  // Calculate cumulative impact totals across active SIP/SWP subtypes
  const totalSipCumulativeValue = activeSipTypes.reduce((sum, t) => {
    const s = sipSummaries[t]
    if (t === 'sip') {
      return sum + (s?.maturityAmount || 0)
    } else if (t === 'swp') {
      return sum + (s?.annualAmount || s?.monthlyAmount * 12) * (s?.tenureYears || 1)
    } else if (t === 'combo') {
      const years = Math.max(1, (s?.endYear || 30) - (s?.startYear || 1) + 1)
      return sum + (s?.annualAmount || s?.monthlyAmount * 12) * years
    }
    return sum
  }, 0)

  const totalSipMonthlyInflow = activeSipTypes.reduce((sum, t) => {
    return sum + (sipSummaries[t]?.monthlyAmount || 0)
  }, 0)

  // Master toggle: Include all / Exclude all
  const toggleSipMaster = () => {
    if (config.sip.enabled) {
      // Exclude all
      const next: LinkedCalculatorsConfig = {
        ...config,
        sip: {
          ...config.sip,
          enabled: false,
        },
      }
      updateConfig(next)
    } else {
      // Include all (if none active, enable all)
      const anyActive = Object.values(config.sip.enabledTypes).some(Boolean)
      const next: LinkedCalculatorsConfig = {
        ...config,
        sip: {
          ...config.sip,
          enabled: true,
          enabledTypes: anyActive ? config.sip.enabledTypes : { sip: true, swp: true, combo: true },
        },
      }
      updateConfig(next)
    }
  }

  // Individual subtype toggle
  const toggleSipSubtype = (type: SipLinkedType, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextVal = !config.sip.enabledTypes[type]
    const nextEnabledTypes = {
      ...config.sip.enabledTypes,
      [type]: nextVal,
    }
    const anyActive = Object.values(nextEnabledTypes).some(Boolean)
    const next: LinkedCalculatorsConfig = {
      ...config,
      sip: {
        ...config.sip,
        selectedType: type,
        enabled: anyActive ? true : config.sip.enabled,
        enabledTypes: nextEnabledTypes,
      },
    }
    updateConfig(next)
  }

  const setSipSelectedType = (type: SipLinkedType) => {
    const next: LinkedCalculatorsConfig = {
      ...config,
      sip: {
        ...config.sip,
        selectedType: type,
      },
    }
    updateConfig(next)
  }

  const currentSip = sipSummaries[config.sip.selectedType]
  const isSelectedActive = config.sip.enabled && !!config.sip.enabledTypes[config.sip.selectedType]

  // ─── Clean / Compact View ──────────────────────────────────────────────────
  if (isCleanView) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Linked SIP & SWP Inflows
            </h3>
          </div>

          <button
            type="button"
            onClick={toggleSipMaster}
            className={cn(
              'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5',
              config.sip.enabled && activeSipCount > 0
                ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
            )}
          >
            {config.sip.enabled && activeSipCount > 0 ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Exclude All</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Include All</span>
              </>
            )}
          </button>
        </div>

        {/* Granular Include/Exclude buttons for each type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {sipTypes.map((t) => {
            const s = sipSummaries[t]
            const isSubtypeEnabled = config.sip.enabled && !!config.sip.enabledTypes[t]

            return (
              <button
                key={t}
                type="button"
                onClick={(e) => toggleSipSubtype(t, e)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5',
                  isSubtypeEnabled
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-foreground ring-1 ring-emerald-500/40'
                    : 'border-border/80 hover:border-emerald-300 dark:hover:border-emerald-800 bg-card text-muted-foreground'
                )}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {s.label.split('(')[0].trim()}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formatINR(s.monthlyAmount)}/mo
                  </span>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-[11px] font-bold rounded-md transition-all shrink-0 flex items-center gap-1',
                    isSubtypeEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground border border-border'
                  )}
                >
                  {isSubtypeEnabled ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3 h-3" />
                      <span>Include</span>
                    </>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cumulative Impact Box at bottom of card */}
        <SipCumulativeImpactBox
          activeTypes={activeSipTypes}
          totalCumulativeValue={totalSipCumulativeValue}
          totalMonthlyInflow={totalSipMonthlyInflow}
          sipSummaries={sipSummaries}
        />
      </div>
    )
  }

  // ─── Full View ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Linked SIP & SWP Inflows (SIP Calculator)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Auto Pre-Filled
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Data from your dedicated SIP & SWP calculator is linked here. You can include or exclude
            the entire SIP portfolio or selectively toggle individual sub-types.
          </p>
        </div>

        {/* Master Include / Exclude Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {config.sip.enabled && activeSipCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {activeSipCount} of 3 Sub-types Included
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-lg">
              <XCircle className="w-3.5 h-3.5 text-zinc-500" />
              Excluded from Plan
            </span>
          )}

          <button
            type="button"
            onClick={toggleSipMaster}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              config.sip.enabled
                ? 'border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs'
            }`}
          >
            {config.sip.enabled ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Exclude All</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Include in Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-types Selection & Granular Include/Exclude Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            SIP & SWP Sub-Types (Include / Exclude Individual Types):
          </label>
          <span className="text-[11px] text-muted-foreground">
            Click card to preview details • Toggle button to include/exclude
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {sipTypes.map((t) => {
            const s = sipSummaries[t]
            const isSelected = config.sip.selectedType === t
            const isSubtypeEnabled = config.sip.enabled && !!config.sip.enabledTypes[t]

            return (
              <div
                key={t}
                onClick={() => setSipSelectedType(t)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-foreground ring-1 ring-emerald-500'
                    : 'border-border/80 hover:border-emerald-300 dark:hover:border-emerald-800 bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-foreground">
                      {s.label.split('(')[0].trim()}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {t === 'sip'
                      ? `${formatINR(s.monthlyAmount)}/mo → ${formatCrore(s.maturityAmount || 0)} corpus (${s.tenureYears} yrs)`
                      : t === 'swp'
                        ? `Monthly Payout: ${formatINR(s.monthlyAmount)}/mo (${s.tenureYears} yrs)`
                        : `Combo Pension: ${formatINR(s.monthlyAmount)}/mo (Yrs ${s.startYear} - ${s.endYear})`}
                  </p>
                </div>

                {/* Subtype Include / Exclude Toggle Button */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Plan Inclusion:
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleSipSubtype(t, e)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      isSubtypeEnabled
                        ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-border'
                    }`}
                  >
                    {isSubtypeEnabled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Included</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3 h-3 text-zinc-400" />
                        <span>Include</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Selected Subtype Details & Impact Preview */}
      <div className="rounded-xl bg-muted/40 border border-border/80 p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              Selected Detail: {currentSip.label}
            </span>
            {isSelectedActive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Active in Retirement Plan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3 text-zinc-500" />
                Excluded from Retirement Plan
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Monthly Payout / Inflow</span>
            <span className="font-bold text-foreground text-sm">
              {formatINR(currentSip.monthlyAmount)}/mo
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Duration / Horizon</span>
            <span className="font-bold text-foreground text-sm">
              {currentSip.tenureYears} Years
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Expected Return</span>
            <span className="font-bold text-foreground text-sm">
              {currentSip.ratePercent}% p.a.
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">
              {config.sip.selectedType === 'sip' ? 'Net Post-Tax Corpus' : 'Total Cashflow Value'}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {config.sip.selectedType === 'sip'
                ? formatCrore(currentSip.maturityAmount || 0)
                : formatCrore(currentSip.annualAmount * currentSip.tenureYears)}
            </span>
          </div>
        </div>

        {/* Impact Explanation Callout */}
        <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 p-2.5 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {config.sip.selectedType === 'sip' && (
              <p>
                <strong>Plan Impact:</strong> Injects a{' '}
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {formatCrore(currentSip.maturityAmount || 0)}
                </span>{' '}
                future lump sum into your retirement corpus in Planning Year{' '}
                {currentSip.tenureYears}.
              </p>
            )}
            {config.sip.selectedType === 'swp' && (
              <p>
                <strong>Plan Impact:</strong> Credits regular income of{' '}
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {formatINR(currentSip.monthlyAmount)}/mo ({formatCrore(currentSip.annualAmount)}
                  /yr)
                </span>{' '}
                from Year 1 to Year {currentSip.tenureYears}, directly offsetting living expenses.
              </p>
            )}
            {config.sip.selectedType === 'combo' && (
              <p>
                <strong>Plan Impact:</strong> Phase-2 SWP begins paying{' '}
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {formatINR(currentSip.monthlyAmount)}/mo
                </span>{' '}
                post-SIP accumulation starting from Year {currentSip.startYear} through Year{' '}
                {currentSip.endYear}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cumulative Impact Box in Full View as well */}
      <SipCumulativeImpactBox
        activeTypes={activeSipTypes}
        totalCumulativeValue={totalSipCumulativeValue}
        totalMonthlyInflow={totalSipMonthlyInflow}
        sipSummaries={sipSummaries}
      />

      {/* Edit in SIP Calculator Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-muted-foreground">
          Need to adjust contribution, return rates, step-up, or tenure?
        </span>
        <button
          type="button"
          onClick={() => router.navigateToSIP()}
          className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
        >
          <span>Edit in SIP & SWP Calculator</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── 2. Standalone Fixed Deposit (FD) Inflow Card ─────────────────────────────

function FdCumulativeImpactBox({
  activeTypes,
  totalCumulativeValue,
  totalMonthlyInflow,
  fdSummaries,
}: {
  activeTypes: FdLinkedType[]
  totalCumulativeValue: number
  totalMonthlyInflow: number
  fdSummaries: Record<FdLinkedType, any>
}) {
  if (activeTypes.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-3 sm:p-3.5 text-xs text-muted-foreground flex items-center justify-between gap-2">
        <span>No Fixed Deposit inflows included in plan. Toggle any subtype above to include.</span>
        <span className="font-semibold text-zinc-500 text-[11px] shrink-0">0 of 3 Active</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Total Cumulative FD Inflow Impact
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
          {activeTypes.length} of 3 Types Active
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-blue-200/40 dark:border-blue-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Total Cumulative Maturity & Interest
          </span>
          <span className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">
            {formatCrore(totalCumulativeValue)}
          </span>
        </div>
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-blue-200/40 dark:border-blue-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Active Periodic Interest Payout
          </span>
          <span className="text-base sm:text-lg font-extrabold text-foreground">
            {totalMonthlyInflow > 0
              ? `${formatINR(totalMonthlyInflow)}/mo`
              : 'Cumulative Reinvested'}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        <strong>Included in plan:</strong>{' '}
        {activeTypes.map((t) => fdSummaries[t]?.label?.split('(')[0]?.trim()).join(', ')}
      </p>
    </div>
  )
}

export function LinkedFdInflowCard() {
  const router = useRouter()
  const { isCleanView } = useCleanView()
  const { assets, categories, setAssets, setResults, profile, members, assumptions, results } =
    useScenarioStore()

  const [config, setConfig] = useState<LinkedCalculatorsConfig>(() => getLinkedCalculatorsConfig())
  const fdSummaries = getFdSummaries()

  const updateConfig = (newConfig: LinkedCalculatorsConfig) => {
    setConfig(newConfig)
    saveLinkedCalculatorsConfig(newConfig)

    // Synchronize into ScenarioStore
    const { updatedAssets, updatedCategories } = applyLinkedDataToStore(
      assets,
      categories,
      newConfig
    )
    setAssets(updatedAssets)

    // Recompute if results already exist
    if (results) {
      const newResults = runScenarios({
        profile,
        members,
        categories: updatedCategories,
        assumptions,
        assets: updatedAssets as any,
      })
      setResults(newResults)
    }
  }

  const fdTypes: FdLinkedType[] = ['cumulative', 'monthly', 'quarterly']
  const activeFdTypes = config.fd.enabled ? fdTypes.filter((t) => config.fd.enabledTypes[t]) : []
  const activeFdCount = activeFdTypes.length

  // Calculate cumulative impact totals across active FD subtypes
  const totalFdCumulativeValue = activeFdTypes.reduce((sum, t) => {
    const s = fdSummaries[t]
    if (t === 'cumulative') {
      return sum + (s?.maturityAmount || 0)
    } else {
      return (
        sum + (s?.annualInterestAmount || 0) * (s?.tenureYears || 1) + (s?.principalAmount || 0)
      )
    }
  }, 0)

  const totalFdMonthlyInflow = activeFdTypes.reduce((sum, t) => {
    const s = fdSummaries[t]
    if (t === 'monthly') {
      return sum + (s?.periodicPayoutAmount || 0)
    } else if (t === 'quarterly') {
      return sum + Math.round((s?.periodicPayoutAmount || 0) / 3)
    }
    return sum
  }, 0)

  // Master toggle: Include all / Exclude all
  const toggleFdMaster = () => {
    if (config.fd.enabled) {
      const next: LinkedCalculatorsConfig = {
        ...config,
        fd: {
          ...config.fd,
          enabled: false,
        },
      }
      updateConfig(next)
    } else {
      const anyActive = Object.values(config.fd.enabledTypes).some(Boolean)
      const next: LinkedCalculatorsConfig = {
        ...config,
        fd: {
          ...config.fd,
          enabled: true,
          enabledTypes: anyActive
            ? config.fd.enabledTypes
            : { cumulative: true, monthly: true, quarterly: true },
        },
      }
      updateConfig(next)
    }
  }

  // Individual subtype toggle
  const toggleFdSubtype = (type: FdLinkedType, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextVal = !config.fd.enabledTypes[type]
    const nextEnabledTypes = {
      ...config.fd.enabledTypes,
      [type]: nextVal,
    }
    const anyActive = Object.values(nextEnabledTypes).some(Boolean)
    const next: LinkedCalculatorsConfig = {
      ...config,
      fd: {
        ...config.fd,
        selectedType: type,
        enabled: anyActive ? true : config.fd.enabled,
        enabledTypes: nextEnabledTypes,
      },
    }
    updateConfig(next)
  }

  const setFdSelectedType = (type: FdLinkedType) => {
    const next: LinkedCalculatorsConfig = {
      ...config,
      fd: {
        ...config.fd,
        selectedType: type,
      },
    }
    updateConfig(next)
  }

  const currentFd = fdSummaries[config.fd.selectedType]
  const isSelectedActive = config.fd.enabled && !!config.fd.enabledTypes[config.fd.selectedType]

  // ─── Clean / Compact View ──────────────────────────────────────────────────
  if (isCleanView) {
    return (
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/40 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <Landmark className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Linked Fixed Deposit Inflows
            </h3>
          </div>

          <button
            type="button"
            onClick={toggleFdMaster}
            className={cn(
              'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5',
              config.fd.enabled && activeFdCount > 0
                ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
            )}
          >
            {config.fd.enabled && activeFdCount > 0 ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Exclude All</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Include All</span>
              </>
            )}
          </button>
        </div>

        {/* Granular Include/Exclude buttons for each type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {fdTypes.map((t) => {
            const s = fdSummaries[t]
            const isSubtypeEnabled = config.fd.enabled && !!config.fd.enabledTypes[t]

            return (
              <button
                key={t}
                type="button"
                onClick={(e) => toggleFdSubtype(t, e)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5',
                  isSubtypeEnabled
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-foreground ring-1 ring-blue-500/40'
                    : 'border-border/80 hover:border-blue-300 dark:hover:border-blue-800 bg-card text-muted-foreground'
                )}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {s.label.split('(')[0].trim()}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {t === 'cumulative'
                      ? `${formatCrore(s.maturityAmount)} maturity`
                      : `${formatINR(s.periodicPayoutAmount)}/${t === 'monthly' ? 'mo' : 'qtr'}`}
                  </span>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-[11px] font-bold rounded-md transition-all shrink-0 flex items-center gap-1',
                    isSubtypeEnabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground border border-border'
                  )}
                >
                  {isSubtypeEnabled ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3 h-3" />
                      <span>Include</span>
                    </>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cumulative Impact Box at bottom of card */}
        <FdCumulativeImpactBox
          activeTypes={activeFdTypes}
          totalCumulativeValue={totalFdCumulativeValue}
          totalMonthlyInflow={totalFdMonthlyInflow}
          fdSummaries={fdSummaries}
        />
      </div>
    )
  }

  // ─── Full View ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/40 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <Landmark className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Linked Fixed Deposit Inflows (FD Calculator)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Guaranteed Return
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Data from your Fixed Deposit calculator is linked here. Include cumulative maturity
            proceeds or periodic interest income, with selective sub-type controls.
          </p>
        </div>

        {/* Master Include / Exclude Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {config.fd.enabled && activeFdCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              {activeFdCount} of 3 Sub-types Included
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-lg">
              <XCircle className="w-3.5 h-3.5 text-zinc-500" />
              Excluded from Plan
            </span>
          )}

          <button
            type="button"
            onClick={toggleFdMaster}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              config.fd.enabled
                ? 'border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-xs'
            }`}
          >
            {config.fd.enabled ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Exclude All</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Include in Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-types Selection & Granular Include/Exclude Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            FD Payout Sub-Types (Include / Exclude Individual Types):
          </label>
          <span className="text-[11px] text-muted-foreground">
            Click card to preview details • Toggle button to include/exclude
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {fdTypes.map((t) => {
            const s = fdSummaries[t]
            const isSelected = config.fd.selectedType === t
            const isSubtypeEnabled = config.fd.enabled && !!config.fd.enabledTypes[t]

            return (
              <div
                key={t}
                onClick={() => setFdSelectedType(t)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground ring-1 ring-blue-500'
                    : 'border-border/80 hover:border-blue-300 dark:hover:border-blue-800 bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-foreground">
                      {s.label.split('(')[0].trim()}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-200/70 dark:bg-blue-800/60 text-blue-900 dark:text-blue-100">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {t === 'cumulative'
                      ? `Lump Sum Maturity: ${formatCrore(s.maturityAmount)} at Year ${s.tenureYears}`
                      : t === 'monthly'
                        ? `Monthly Payout: ${formatINR(s.periodicPayoutAmount)}/mo + Principal at Year ${s.tenureYears}`
                        : `Quarterly Payout: ${formatINR(s.periodicPayoutAmount)}/qtr + Principal at Year ${s.tenureYears}`}
                  </p>
                </div>

                {/* Subtype Include / Exclude Toggle Button */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Plan Inclusion:
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleFdSubtype(t, e)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      isSubtypeEnabled
                        ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                        : 'bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-border'
                    }`}
                  >
                    {isSubtypeEnabled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>Included</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3 h-3 text-zinc-400" />
                        <span>Include</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Selected Subtype Details & Impact Preview */}
      <div className="rounded-xl bg-muted/40 border border-border/80 p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              Selected Detail: {currentFd.label}
            </span>
            {isSelectedActive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Active in Retirement Plan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3 text-zinc-500" />
                Excluded from Retirement Plan
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Principal Deposit</span>
            <span className="font-bold text-foreground text-sm">
              {formatINR(currentFd.principalAmount)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Interest Rate</span>
            <span className="font-bold text-foreground text-sm">
              {currentFd.interestRate}% p.a.
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Tenure</span>
            <span className="font-bold text-foreground text-sm">{currentFd.tenureYears} Years</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">
              {config.fd.selectedType === 'cumulative'
                ? 'Net Post-Tax Maturity'
                : 'Periodic Interest'}
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
              {config.fd.selectedType === 'cumulative'
                ? formatCrore(currentFd.maturityAmount)
                : formatINR(currentFd.periodicPayoutAmount)}
            </span>
          </div>
        </div>

        {/* Impact Explanation Callout */}
        <div className="rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 p-2.5 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {config.fd.selectedType === 'cumulative' && (
              <p>
                <strong>Plan Impact:</strong> Adds a{' '}
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  {formatCrore(currentFd.maturityAmount)}
                </span>{' '}
                lump sum maturity into your corpus at Planning Year {currentFd.tenureYears}.
              </p>
            )}
            {config.fd.selectedType === 'monthly' && (
              <p>
                <strong>Plan Impact:</strong> Adds regular monthly income of{' '}
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  {formatINR(currentFd.periodicPayoutAmount)}/mo (
                  {formatCrore(currentFd.annualInterestAmount)}/yr)
                </span>{' '}
                for {currentFd.tenureYears} years, plus full principal repayment of{' '}
                {formatCrore(currentFd.principalAmount)} at Year {currentFd.tenureYears}.
              </p>
            )}
            {config.fd.selectedType === 'quarterly' && (
              <p>
                <strong>Plan Impact:</strong> Adds quarterly interest payouts of{' '}
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  {formatINR(currentFd.periodicPayoutAmount)}/quarter (
                  {formatCrore(currentFd.annualInterestAmount)}/yr)
                </span>{' '}
                for {currentFd.tenureYears} years, plus full principal return of{' '}
                {formatCrore(currentFd.principalAmount)} at Year {currentFd.tenureYears}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cumulative Impact Box in Full View as well */}
      <FdCumulativeImpactBox
        activeTypes={activeFdTypes}
        totalCumulativeValue={totalFdCumulativeValue}
        totalMonthlyInflow={totalFdMonthlyInflow}
        fdSummaries={fdSummaries}
      />

      {/* Edit in FD Calculator Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-muted-foreground">
          Want to adjust deposit amount, compounding frequency, or Form 15G status?
        </span>
        <button
          type="button"
          onClick={() => router.navigateToFD()}
          className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
        >
          <span>Edit in Fixed Deposit Calculator</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── 3. Standalone Public Provident Fund (PPF) Inflow Card ──────────────────

function PpfCumulativeImpactBox({
  isEnabled,
  maturityAmount,
  tenureYears,
  annualDeposit,
}: {
  isEnabled: boolean
  maturityAmount: number
  tenureYears: number
  annualDeposit: number
}) {
  if (!isEnabled) {
    return (
      <div className="rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-3 sm:p-3.5 text-xs text-muted-foreground flex items-center justify-between gap-2">
        <span>
          PPF inflow is currently excluded from plan. Click 'Include in Plan' above to activate.
        </span>
        <span className="font-semibold text-zinc-500 text-[11px] shrink-0">Excluded</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          PPF Tax-Free Corpus Impact
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
          Active · Tax-Free EEE
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-purple-200/40 dark:border-purple-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Total Guaranteed Maturity Corpus (Year {tenureYears})
          </span>
          <span className="text-base sm:text-lg font-extrabold text-purple-600 dark:text-purple-400">
            {formatCrore(maturityAmount)}
          </span>
        </div>
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-purple-200/40 dark:border-purple-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Annual Contribution / 80C Deduction
          </span>
          <span className="text-base sm:text-lg font-extrabold text-foreground">
            {formatINR(annualDeposit)}/yr
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        <strong>Included in plan:</strong> Full maturity amount of {formatCrore(maturityAmount)}{' '}
        injected as tax-free lump sum at Year {tenureYears}.
      </p>
    </div>
  )
}

export function LinkedPpfInflowCard() {
  const router = useRouter()
  const { isCleanView } = useCleanView()
  const { assets, categories, setAssets, setResults, profile, members, assumptions, results } =
    useScenarioStore()

  const [config, setConfig] = useState<LinkedCalculatorsConfig>(() => getLinkedCalculatorsConfig())
  const ppfSummary = getPpfSummary()

  const isEnabled = Boolean(config.ppf?.enabled)

  const updateConfig = (newConfig: LinkedCalculatorsConfig) => {
    setConfig(newConfig)
    saveLinkedCalculatorsConfig(newConfig)

    // Synchronize into ScenarioStore
    const { updatedAssets, updatedCategories } = applyLinkedDataToStore(
      assets,
      categories,
      newConfig
    )
    setAssets(updatedAssets)

    // Recompute if results already exist
    if (results) {
      const newResults = runScenarios({
        profile,
        members,
        categories: updatedCategories,
        assumptions,
        assets: updatedAssets as any,
      })
      setResults(newResults)
    }
  }

  const togglePpf = () => {
    const next: LinkedCalculatorsConfig = {
      ...config,
      ppf: {
        ...config.ppf,
        enabled: !isEnabled,
      },
    }
    updateConfig(next)
  }

  const handleEditInPpf = () => {
    saveStoredFdPageTab('ppf')
    router.navigateToFD()
  }

  // Clean / Compact View
  if (isCleanView) {
    return (
      <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/40 via-background to-background dark:from-purple-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Linked Public Provident Fund (PPF)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {ppfSummary.tenureYears} Years · 7.10% p.a. · 100% Tax-Free (EEE)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={togglePpf}
            className={cn(
              'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5',
              isEnabled
                ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
            )}
          >
            {isEnabled ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Exclude</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Include</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <span className="text-xs font-bold text-foreground block truncate">
              {ppfSummary.label}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {formatINR(ppfSummary.annualDeposit)}/yr · Maturity:{' '}
              {formatCrore(ppfSummary.maturityAmount)}
            </span>
          </div>
          <span
            className={cn(
              'px-2 py-1 text-[11px] font-bold rounded-md shrink-0 flex items-center gap-1',
              isEnabled
                ? 'bg-purple-600 text-white'
                : 'bg-muted text-muted-foreground border border-border'
            )}
          >
            {isEnabled ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Included</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3 h-3" />
                <span>Excluded</span>
              </>
            )}
          </span>
        </div>

        <PpfCumulativeImpactBox
          isEnabled={isEnabled}
          maturityAmount={ppfSummary.maturityAmount}
          tenureYears={ppfSummary.tenureYears}
          annualDeposit={ppfSummary.annualDeposit}
        />
      </div>
    )
  }

  // Full / Detailed View
  return (
    <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/40 via-background to-background dark:from-purple-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>Linked Public Provident Fund (PPF)</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                100% Tax-Free
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Government sovereign scheme with Sec 80C deductions, 7.10% compound interest, and
              tax-free maturity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePpf}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs',
              isEnabled
                ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 bg-background'
                : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
            )}
          >
            {isEnabled ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Exclude from Plan</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Include in Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main PPF Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl border border-border/70 bg-card/70 space-y-0.5">
          <span className="text-[11px] text-muted-foreground block">Maturity Corpus</span>
          <span className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400">
            {formatCrore(ppfSummary.maturityAmount)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            At Year {ppfSummary.tenureYears}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-border/70 bg-card/70 space-y-0.5">
          <span className="text-[11px] text-muted-foreground block">Annual Deposit</span>
          <span className="text-sm sm:text-base font-extrabold text-foreground">
            {formatINR(ppfSummary.annualDeposit)}/yr
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
            Eligible for 80C
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-border/70 bg-card/70 space-y-0.5">
          <span className="text-[11px] text-muted-foreground block">Interest Rate</span>
          <span className="text-sm sm:text-base font-extrabold text-foreground">
            {ppfSummary.annualInterestRate}% p.a.
          </span>
          <span className="text-[10px] text-muted-foreground block">Govt Notified</span>
        </div>

        <div className="p-2.5 rounded-xl border border-border/70 bg-card/70 space-y-0.5">
          <span className="text-[11px] text-muted-foreground block">Tax Status</span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            Exempt (EEE)
          </span>
          <span className="text-[10px] text-muted-foreground block">Sec 10(11) 0% Tax</span>
        </div>
      </div>

      {/* Status banner */}
      <div
        className={cn(
          'p-3 rounded-xl border text-xs flex items-center justify-between gap-3',
          isEnabled
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-200'
            : 'bg-zinc-100/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-muted-foreground'
        )}
      >
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-zinc-400 shrink-0" />
          )}
          <span className="text-[11px] leading-snug">
            {isEnabled ? (
              <>
                <strong>PPF Included:</strong> Injects tax-free maturity corpus of{' '}
                <span className="font-bold">{formatCrore(ppfSummary.maturityAmount)}</span> into
                Year {ppfSummary.tenureYears} future inflows.
              </>
            ) : (
              <>PPF is excluded from retirement planning calculations.</>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={togglePpf}
          className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline shrink-0 cursor-pointer"
        >
          {isEnabled ? 'Exclude' : 'Include'}
        </button>
      </div>

      <PpfCumulativeImpactBox
        isEnabled={isEnabled}
        maturityAmount={ppfSummary.maturityAmount}
        tenureYears={ppfSummary.tenureYears}
        annualDeposit={ppfSummary.annualDeposit}
      />

      {/* Edit in PPF Calculator Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-muted-foreground">
          Want to change annual deposit amount, 15-year tenure, or 5-year extension blocks?
        </span>
        <button
          type="button"
          onClick={handleEditInPpf}
          className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
        >
          <span>Edit in PPF Calculator</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── 4. Combined Wrapper (for backward compatibility if used) ─────────────────

export function LinkedIncomeCalculatorsCard() {
  return (
    <div className="space-y-4">
      <LinkedSipInflowCard />
      <LinkedFdInflowCard />
      <LinkedPpfInflowCard />
    </div>
  )
}
