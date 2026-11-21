import React, { useState } from 'react'
import {
  Percent,
  Building,
  Car,
  UserCheck,
  Sliders,
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
  getLoanSummaries,
  LoanLinkedType,
  applyLinkedDataToStore,
} from '@/lib/linkedCalculatorsStorage'
import { runScenarios } from '@/domain/calculations/runScenarios'

function LoanCumulativeImpactBox({
  activeTypes,
  totalCumulativePayment,
  totalMonthlyEmi,
  loanSummaries,
}: {
  activeTypes: LoanLinkedType[]
  totalCumulativePayment: number
  totalMonthlyEmi: number
  loanSummaries: Record<LoanLinkedType, any>
}) {
  if (activeTypes.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-3 sm:p-3.5 text-xs text-muted-foreground flex items-center justify-between gap-2">
        <span>No loans linked to living expenses. Toggle any loan type above to include.</span>
        <span className="font-semibold text-zinc-500 text-[11px] shrink-0">0 of 4 Active</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Percent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Total Cumulative Loan Liability Impact
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
          {activeTypes.length} of 4 Loans Active
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-amber-200/40 dark:border-amber-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Total Cumulative Payments (Payoff)
          </span>
          <span className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400">
            {formatCrore(totalCumulativePayment)}
          </span>
        </div>
        <div className="bg-background/80 dark:bg-background/50 rounded-lg p-2.5 border border-amber-200/40 dark:border-amber-800/40">
          <span className="text-muted-foreground block text-[11px]">
            Total Active Monthly EMI (0% Inflation)
          </span>
          <span className="text-base sm:text-lg font-extrabold text-foreground">
            {formatINR(totalMonthlyEmi)}/mo ({formatCrore(totalMonthlyEmi * 12)}/yr)
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        <strong>Included in living expenses:</strong>{' '}
        {activeTypes.map((t) => loanSummaries[t]?.label).join(', ')}
      </p>
    </div>
  )
}

export function LinkedLoanExpenseCard() {
  const router = useRouter()
  const { isCleanView } = useCleanView()
  const {
    assets,
    categories,
    setAssets,
    updateCategory,
    setResults,
    profile,
    members,
    assumptions,
    results,
  } = useScenarioStore()

  const [config, setConfig] = useState<LinkedCalculatorsConfig>(() => getLinkedCalculatorsConfig())
  const loanSummaries = getLoanSummaries()

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

    // Update categories in store
    const finCat = updatedCategories.find((c) => c.id === 'financial')
    if (finCat) {
      updateCategory('financial', { items: finCat.items })
    }

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

  const loanTypes: LoanLinkedType[] = ['home', 'car', 'personal', 'custom']
  const activeLoanTypes = config.loan.enabled
    ? loanTypes.filter((t) => config.loan.enabledTypes[t])
    : []
  const activeLoanCount = activeLoanTypes.length

  // Calculate cumulative impact totals across active loan subtypes
  const totalLoanCumulativePayment = activeLoanTypes.reduce((sum, t) => {
    const s = loanSummaries[t]
    return sum + (s?.monthlyEmi || 0) * 12 * (s?.actualPayoffYears || 1)
  }, 0)

  const totalLoanMonthlyEmi = activeLoanTypes.reduce((sum, t) => {
    return sum + (loanSummaries[t]?.monthlyEmi || 0)
  }, 0)

  // Master toggle: Include all / Exclude all
  const toggleLoanMaster = () => {
    if (config.loan.enabled) {
      const next: LinkedCalculatorsConfig = {
        ...config,
        loan: {
          ...config.loan,
          enabled: false,
        },
      }
      updateConfig(next)
    } else {
      const anyActive = Object.values(config.loan.enabledTypes).some(Boolean)
      const next: LinkedCalculatorsConfig = {
        ...config,
        loan: {
          ...config.loan,
          enabled: true,
          enabledTypes: anyActive
            ? config.loan.enabledTypes
            : { home: true, car: false, personal: false, custom: false },
        },
      }
      updateConfig(next)
    }
  }

  // Individual loan subtype toggle
  const toggleLoanSubtype = (type: LoanLinkedType, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextVal = !config.loan.enabledTypes[type]
    const nextEnabledTypes = {
      ...config.loan.enabledTypes,
      [type]: nextVal,
    }
    const anyActive = Object.values(nextEnabledTypes).some(Boolean)
    const next: LinkedCalculatorsConfig = {
      ...config,
      loan: {
        ...config.loan,
        selectedType: type,
        enabled: anyActive ? true : config.loan.enabled,
        enabledTypes: nextEnabledTypes,
      },
    }
    updateConfig(next)
  }

  const setLoanSelectedType = (type: LoanLinkedType) => {
    const next: LinkedCalculatorsConfig = {
      ...config,
      loan: {
        ...config.loan,
        selectedType: type,
      },
    }
    updateConfig(next)
  }

  const currentLoan = loanSummaries[config.loan.selectedType]
  const isSelectedActive =
    config.loan.enabled && !!config.loan.enabledTypes[config.loan.selectedType]

  const typeIcons: Record<LoanLinkedType, any> = {
    home: Building,
    car: Car,
    personal: UserCheck,
    custom: Sliders,
  }

  // ─── Clean / Compact View ──────────────────────────────────────────────────
  if (isCleanView) {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/40 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <Percent className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Linked Loan Liability
            </h3>
          </div>

          <button
            type="button"
            onClick={toggleLoanMaster}
            className={cn(
              'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5',
              config.loan.enabled && activeLoanCount > 0
                ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'
            )}
          >
            {config.loan.enabled && activeLoanCount > 0 ? (
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

        {/* Granular Include/Exclude buttons for each loan type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {loanTypes.map((t) => {
            const s = loanSummaries[t]
            const isSubtypeEnabled = config.loan.enabled && !!config.loan.enabledTypes[t]
            const Icon = typeIcons[t]

            return (
              <button
                key={t}
                type="button"
                onClick={(e) => toggleLoanSubtype(t, e)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2',
                  isSubtypeEnabled
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-foreground ring-1 ring-amber-500/40'
                    : 'border-border/80 hover:border-amber-300 dark:hover:border-amber-800 bg-card text-muted-foreground'
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-foreground truncate">{s.label}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono block">
                    {formatINR(s.monthlyEmi)}/mo
                  </span>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-[11px] font-bold rounded-md transition-all shrink-0 flex items-center gap-1',
                    isSubtypeEnabled
                      ? 'bg-amber-600 text-white'
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
        <LoanCumulativeImpactBox
          activeTypes={activeLoanTypes}
          totalCumulativePayment={totalLoanCumulativePayment}
          totalMonthlyEmi={totalLoanMonthlyEmi}
          loanSummaries={loanSummaries}
        />
      </div>
    )
  }

  // ─── Full View ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/40 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <Percent className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Linked Loan Liability (Loan EMI Calculator)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Fixed 0% Inflation
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pre-fills your contractual loan EMI into living expenses. Loan EMIs are fixed nominal
            payments (0% inflation rate) and drop off after payoff. You can include or exclude
            individual loan obligations below.
          </p>
        </div>

        {/* Master Include / Exclude Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {config.loan.enabled && activeLoanCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              {activeLoanCount} of 4 Loans Included
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-lg">
              <XCircle className="w-3.5 h-3.5 text-zinc-500" />
              Excluded from Expenses
            </span>
          )}

          <button
            type="button"
            onClick={toggleLoanMaster}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              config.loan.enabled
                ? 'border-red-200 dark:border-red-800/80 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-xs'
            }`}
          >
            {config.loan.enabled ? (
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

      {/* Main Card Content */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-4">
        {/* Status Indicator & Total Active Monthly EMI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground">Contractual Loan Obligations</h4>
            {config.loan.enabled && activeLoanCount > 0 ? (
              <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                Total Linked EMI:{' '}
                <span className="font-bold">{formatINR(totalLoanMonthlyEmi)}/mo</span> (
                {formatCrore(totalLoanMonthlyEmi * 12)}/yr)
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                No active loans linked to living expenses
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Click card to preview • Toggle button to include/exclude
          </span>
        </div>

        {/* Sub-types Selector & Granular Include/Exclude Controls */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Loan Obligations (Include / Exclude Individual Sub-Types):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {loanTypes.map((t) => {
              const s = loanSummaries[t]
              const isSelected = config.loan.selectedType === t
              const isSubtypeEnabled = config.loan.enabled && !!config.loan.enabledTypes[t]
              const Icon = typeIcons[t]

              return (
                <div
                  key={t}
                  onClick={() => setLoanSelectedType(t)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-foreground ring-1 ring-amber-500'
                      : 'border-border/80 hover:border-amber-300 dark:hover:border-amber-800 bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-foreground">{s.label}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {formatINR(s.monthlyEmi)}/mo • {s.actualPayoffYears} yrs
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {s.shortDescription}
                    </p>
                  </div>

                  {/* Subtype Include / Exclude Toggle Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Living Expense:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleLoanSubtype(t, e)}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        isSubtypeEnabled
                          ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                          : 'bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-border'
                      }`}
                    >
                      {isSubtypeEnabled ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
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

        {/* Active Loan Details Grid */}
        <div className="rounded-xl bg-muted/40 border border-border/80 p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground">
              Selected Detail: {currentLoan.label}
            </span>
            {isSelectedActive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                Active in Living Expenses
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3 text-zinc-500" />
                Excluded from Living Expenses
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Loan Principal</span>
              <span className="font-bold text-foreground text-sm">
                {formatCrore(currentLoan.loanAmount)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Interest Rate</span>
              <span className="font-bold text-foreground text-sm">
                {currentLoan.annualInterestRate}% p.a.
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Payoff Timeline</span>
              <span className="font-bold text-foreground text-sm">
                Years 1 to {currentLoan.actualPayoffYears}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Monthly EMI Payment</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                {formatINR(currentLoan.monthlyEmi)}/mo
              </span>
            </div>
          </div>

          {/* Impact Note */}
          <div className="rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-2.5 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p>
                <strong>Plan Impact:</strong> Adds an annual liability of{' '}
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  {formatCrore(currentLoan.annualPayment)}/year ({formatINR(currentLoan.monthlyEmi)}
                  /mo)
                </span>{' '}
                from Planning Year 1 to Year {currentLoan.actualPayoffYears}. Because loans have
                fixed nominal EMIs, this amount is <strong>exempt from inflation (0% rate)</strong>{' '}
                and drops off your expenses completely after Year {currentLoan.actualPayoffYears}.
              </p>
            </div>
          </div>
        </div>

        {/* Cumulative Impact Box in Full View as well */}
        <LoanCumulativeImpactBox
          activeTypes={activeLoanTypes}
          totalCumulativePayment={totalLoanCumulativePayment}
          totalMonthlyEmi={totalLoanMonthlyEmi}
          loanSummaries={loanSummaries}
        />

        {/* Edit in Loan EMI Calculator Link */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-muted-foreground">
            Want to test prepayment schedules, extra prepayments, or interest rate changes?
          </span>
          <button
            type="button"
            onClick={() => router.navigateToLoanEMI()}
            className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
          >
            <span>Edit in Loan EMI Calculator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
