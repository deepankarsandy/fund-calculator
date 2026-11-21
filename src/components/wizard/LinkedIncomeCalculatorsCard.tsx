import { useState } from 'react'
import {
  TrendingUp,
  Landmark,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react'
import { useRouter } from '@/lib/router'
import { formatINR, formatCrore } from '@/lib/currency'
import { useScenarioStore } from '@/store/useScenarioStore'
import {
  LinkedCalculatorsConfig,
  getLinkedCalculatorsConfig,
  saveLinkedCalculatorsConfig,
  getSipSummaries,
  getFdSummaries,
  SipLinkedType,
  FdLinkedType,
  applyLinkedDataToStore,
} from '@/lib/linkedCalculatorsStorage'
import { runScenarios } from '@/domain/calculations/runScenarios'

export function LinkedIncomeCalculatorsCard() {
  const router = useRouter()
  const { assets, categories, setAssets, setResults, profile, members, assumptions, results } =
    useScenarioStore()

  const [config, setConfig] = useState<LinkedCalculatorsConfig>(() => getLinkedCalculatorsConfig())
  const [activeTab, setActiveTab] = useState<'sip' | 'fd'>('sip')

  const sipSummaries = getSipSummaries()
  const fdSummaries = getFdSummaries()

  // Save config and trigger store sync whenever config changes
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

  const toggleSipEnabled = () => {
    const next = {
      ...config,
      sip: {
        ...config.sip,
        enabled: !config.sip.enabled,
      },
    }
    updateConfig(next)
  }

  const setSipSelectedType = (type: SipLinkedType) => {
    const next = {
      ...config,
      sip: {
        ...config.sip,
        selectedType: type,
        enabled: true, // Auto-enable when user chooses a type
        enabledTypes: {
          ...config.sip.enabledTypes,
          [type]: true,
        },
      },
    }
    updateConfig(next)
  }

  const toggleFdEnabled = () => {
    const next = {
      ...config,
      fd: {
        ...config.fd,
        enabled: !config.fd.enabled,
      },
    }
    updateConfig(next)
  }

  const setFdSelectedType = (type: FdLinkedType) => {
    const next = {
      ...config,
      fd: {
        ...config.fd,
        selectedType: type,
        enabled: true, // Auto-enable when user chooses a type
        enabledTypes: {
          ...config.fd.enabledTypes,
          [type]: true,
        },
      },
    }
    updateConfig(next)
  }

  const currentSip = sipSummaries[config.sip.selectedType]
  const currentFd = fdSummaries[config.fd.selectedType]

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Linked Calculator Inflows (SIP & Fixed Deposit)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Auto Pre-Filled
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Data from your dedicated SIP and Fixed Deposit calculators is linked here automatically
            to keep your retirement plan synchronized without cluttering manual fields.
          </p>
        </div>

        {/* Quick Tabs to Switch Between SIP and FD cards */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-xl border border-border/70 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sip')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sip'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>SIP / SWP</span>
            {config.sip.enabled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fd'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Fixed Deposit</span>
            {config.fd.enabled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* ─── SIP & SWP Section Card ─────────────────────────────────────── */}
      {activeTab === 'sip' && (
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">SIP & SWP Calculator</h4>
                  {config.sip.enabled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Included in Plan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3 text-zinc-500" />
                      Excluded from Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Synced from your saved SIP & SWP parameters.
                </p>
              </div>
            </div>

            {/* Include / Exclude Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSipEnabled}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  config.sip.enabled
                    ? 'border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs'
                }`}
              >
                {config.sip.enabled ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Exclude from Retirement Calc</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Include in Retirement Calc</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Type Selector Pills (Link all different type of SIP data) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select SIP Inflow Type to Link:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['sip', 'swp', 'combo'] as SipLinkedType[]).map((t) => {
                const s = sipSummaries[t]
                const isSelected = config.sip.selectedType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSipSelectedType(t)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-foreground ring-1 ring-emerald-500'
                        : 'border-border/80 hover:border-emerald-300 dark:hover:border-emerald-800 bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold">{s.label.split('(')[0].trim()}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">
                      {t === 'sip'
                        ? `${formatINR(s.monthlyAmount)}/mo → ${formatCrore(s.maturityAmount || 0)}`
                        : t === 'swp'
                          ? `Payout: ${formatINR(s.monthlyAmount)}/mo`
                          : `Combo: ${formatINR(s.monthlyAmount)}/mo payout`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active SIP Card Details */}
          <div className="rounded-xl bg-muted/40 border border-border/80 p-3.5 sm:p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Monthly Payout / Inflow
                </span>
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
                  {config.sip.selectedType === 'sip'
                    ? 'Net Post-Tax Corpus'
                    : 'Total Cashflow Value'}
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
                      {formatINR(currentSip.monthlyAmount)}/mo (
                      {formatCrore(currentSip.annualAmount)}/yr)
                    </span>{' '}
                    from Year 1 to Year {currentSip.tenureYears}, directly offsetting living
                    expenses.
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
      )}

      {/* ─── Fixed Deposit (FD) Section Card ─────────────────────────────── */}
      {activeTab === 'fd' && (
        <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">
                    Fixed Deposit (FD) Calculator
                  </h4>
                  {config.fd.enabled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Included in Plan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3 text-zinc-500" />
                      Excluded from Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Synced from your saved Fixed Deposit parameters.
                </p>
              </div>
            </div>

            {/* Include / Exclude Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFdEnabled}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  config.fd.enabled
                    ? 'border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs'
                }`}
              >
                {config.fd.enabled ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Exclude from Retirement Calc</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Include in Retirement Calc</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Type Selector Pills (Link all different type of FD data) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select FD Payout Type to Link:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['cumulative', 'monthly', 'quarterly'] as FdLinkedType[]).map((t) => {
                const s = fdSummaries[t]
                const isSelected = config.fd.selectedType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFdSelectedType(t)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground ring-1 ring-blue-500'
                        : 'border-border/80 hover:border-blue-300 dark:hover:border-blue-800 bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold">{s.label.split('(')[0].trim()}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">
                      {t === 'cumulative'
                        ? `Maturity: ${formatCrore(s.maturityAmount)}`
                        : t === 'monthly'
                          ? `Payout: ${formatINR(s.periodicPayoutAmount)}/mo`
                          : `Payout: ${formatINR(s.periodicPayoutAmount)}/qtr`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active FD Card Details */}
          <div className="rounded-xl bg-muted/40 border border-border/80 p-3.5 sm:p-4 space-y-3">
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
                <span className="font-bold text-foreground text-sm">
                  {currentFd.tenureYears} Years
                </span>
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
      )}
    </div>
  )
}
