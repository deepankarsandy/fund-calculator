import { useState, useMemo, useEffect } from 'react'
import {
  ShieldCheck,
  RotateCcw,
  Percent,
  Calendar,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react'
import { getUserProfile } from '@/lib/userProfileStorage'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  PpfCalculationInputs,
  PpfCalculationResult,
  PpfDepositFrequency,
  PpfExtensionMode,
  PpfStartMode,
  DEFAULT_PPF_INPUTS,
  MAX_PPF_ANNUAL_DEPOSIT,
  calculatePpf,
  calculateEstimatedPpfBalance,
} from '@/domain/calculations/ppf'
import { getStoredPpfInputs, saveStoredPpfInputs, saveStoredPpfResults } from '@/lib/ppfStorage'
import { cn } from '@/lib/cn'

export function PpfCalculatorSection() {
  const [inputs, setInputs] = useState<PpfCalculationInputs>(() => getStoredPpfInputs())
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  const [showScheduleTable, setShowScheduleTable] = useState(false)

  // Calculate results reactively
  const results: PpfCalculationResult = useMemo(() => {
    return calculatePpf(inputs)
  }, [inputs])

  // Persist inputs and results
  useEffect(() => {
    saveStoredPpfInputs(inputs)
    saveStoredPpfResults(results)
  }, [inputs, results])

  const handleDepositFrequencyChange = (freq: PpfDepositFrequency) => {
    setInputs((prev) => ({
      ...prev,
      depositFrequency: freq,
      // If switching to monthly, set monthly to annual/12 capped at 12500
      monthlyDeposit: Math.min(12500, Math.round(prev.annualDeposit / 12)),
    }))
  }

  const handleAnnualDepositChange = (val: number) => {
    const capped = Math.max(0, Math.min(MAX_PPF_ANNUAL_DEPOSIT, val))
    setInputs((prev) => ({
      ...prev,
      annualDeposit: capped,
      monthlyDeposit: Math.min(12500, Math.round(capped / 12)),
    }))
  }

  const handleMonthlyDepositChange = (val: number) => {
    const capped = Math.max(0, Math.min(12500, val))
    setInputs((prev) => ({
      ...prev,
      monthlyDeposit: capped,
      annualDeposit: Math.min(MAX_PPF_ANNUAL_DEPOSIT, capped * 12),
    }))
  }

  const handleStartModeChange = (mode: PpfStartMode) => {
    setInputs((prev) => {
      const years = mode === 'existing' ? Math.max(1, prev.yearsAlreadyInvested || 5) : 0
      const autoCorpus =
        mode === 'existing'
          ? calculateEstimatedPpfBalance(
              years,
              prev.annualDeposit,
              prev.annualInterestRate,
              prev.depositFrequency,
              prev.monthlyDeposit
            )
          : 0

      return {
        ...prev,
        startMode: mode,
        yearsAlreadyInvested: years,
        existingCorpus: autoCorpus,
      }
    })
  }

  const handleYearsAlreadyChange = (years: number) => {
    const validYears = Math.max(0, Math.min(29, years))
    setInputs((prev) => {
      const autoCorpus = calculateEstimatedPpfBalance(
        validYears,
        prev.annualDeposit,
        prev.annualInterestRate,
        prev.depositFrequency,
        prev.monthlyDeposit
      )
      return {
        ...prev,
        yearsAlreadyInvested: validYears,
        existingCorpus: autoCorpus,
      }
    })
  }

  const handleExistingCorpusChange = (corpus: number) => {
    setInputs((prev) => ({
      ...prev,
      existingCorpus: Math.max(0, corpus),
    }))
  }

  const handleTenureChange = (tenureYears: number) => {
    setInputs((prev) => {
      const nextTenure = Math.max(15, Math.min(40, tenureYears))
      return {
        ...prev,
        tenureYears: nextTenure,
        contributionYears:
          prev.extensionMode === 'without_contributions'
            ? Math.min(15, nextTenure)
            : Math.min(prev.contributionYears, nextTenure),
      }
    })
  }

  const handleExtensionModeChange = (mode: PpfExtensionMode) => {
    setInputs((prev) => ({
      ...prev,
      extensionMode: mode,
      contributionYears: mode === 'without_contributions' ? 15 : prev.tenureYears,
    }))
  }

  const handleContributionYearsChange = (years: number) => {
    setInputs((prev) => ({
      ...prev,
      contributionYears: Math.max(1, Math.min(prev.tenureYears, years)),
    }))
  }

  const handleRateChange = (rate: number) => {
    setInputs((prev) => ({
      ...prev,
      annualInterestRate: Math.max(0, Math.min(20, rate)),
    }))
  }

  const handleTaxSlabChange = (rate: number) => {
    setInputs((prev) => ({
      ...prev,
      taxSlabRatePercent: Math.max(0, Math.min(50, rate)),
    }))
  }

  const handleInflationChange = (rate: number) => {
    setInputs((prev) => ({
      ...prev,
      inflationRatePercent: Math.max(0, Math.min(20, rate)),
    }))
  }

  const handleReset = () => {
    setInputs(DEFAULT_PPF_INPUTS)
  }

  const handleApplyProfileDefaults = () => {
    const profile = getUserProfile()
    setInputs((prev) => ({
      ...prev,
      taxSlabRatePercent: profile.incomeTaxBracket ?? 20.0,
      inflationRatePercent: profile.overallInflationRate ?? 6.0,
    }))
  }

  const totalAmount = results.maturityAmount > 0 ? results.maturityAmount : 1
  const principalPct = Math.min(100, (results.totalPrincipalDeposited / totalAmount) * 100)
  const interestPct = Math.max(0, 100 - principalPct)

  return (
    <div className="space-y-6">
      {/* PPF Header & Actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sovereign Government Scheme · 100% Tax-Free (EEE)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Public Provident Fund (PPF) Calculator
            </h2>
            <p className="calc-helper-text text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
              Govt-backed 15-year wealth builder: ₹1.5L annual Section 80C tax deduction, 7.10%
              compound interest, and 5-year block extensions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyProfileDefaults}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors cursor-pointer shadow-2xs"
              title="Populate tax slab and inflation from your saved User Profile"
            >
              <Percent className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Auto-set from Profile</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
              title="Reset PPF inputs to Indian defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* EEE Tax Exemption Pill */}
        <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Triple Tax Advantage (EEE Category)</p>
            <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
              <strong>Investment:</strong> Deductible up to ₹1,50,000/yr under Section 80C ·{' '}
              <strong>Interest Earned:</strong> 100% Tax-Free under Section 10(11) ·{' '}
              <strong>Maturity Corpus:</strong> 100% Tax-Free upon withdrawal.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs Form (7 cols) + Results (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
          {/* Deposit Frequency Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Deposit Frequency</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Max ₹1,50,000 / financial year
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => handleDepositFrequencyChange('yearly')}
                className={cn(
                  'py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center',
                  inputs.depositFrequency === 'yearly'
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Yearly (Lump Sum Deposit)
              </button>
              <button
                type="button"
                onClick={() => handleDepositFrequencyChange('monthly')}
                className={cn(
                  'py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center',
                  inputs.depositFrequency === 'monthly'
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Monthly (SIP-Style Deposit)
              </button>
            </div>
          </div>

          {/* Deposit Amount Control */}
          {inputs.depositFrequency === 'yearly' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Annual Deposit Amount</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                    {formatINR(inputs.annualDeposit)}
                  </span>
                  {inputs.annualDeposit === MAX_PPF_ANNUAL_DEPOSIT && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      Max 80C Cap
                    </span>
                  )}
                </div>
              </div>

              <input
                type="range"
                min="500"
                max={MAX_PPF_ANNUAL_DEPOSIT}
                step="500"
                value={inputs.annualDeposit}
                onChange={(e) => handleAnnualDepositChange(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
              />

              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '₹1.5L (Max)', val: 150000 },
                    { label: '₹1 Lakh', val: 100000 },
                    { label: '₹50,000', val: 50000 },
                    { label: '₹25,000', val: 25000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleAnnualDepositChange(p.val)}
                      className={cn(
                        'px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer',
                        inputs.annualDeposit === p.val
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-border text-muted-foreground hover:border-purple-300'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="500"
                    max={MAX_PPF_ANNUAL_DEPOSIT}
                    step="500"
                    value={inputs.annualDeposit || ''}
                    onChange={(e) => handleAnnualDepositChange(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1 text-xs font-bold rounded-lg border border-border bg-background text-right"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Monthly Deposit (SIP)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                    {formatINR(inputs.monthlyDeposit)}/mo
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({formatINR(inputs.monthlyDeposit * 12)}/yr)
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="500"
                max="12500"
                step="500"
                value={inputs.monthlyDeposit}
                onChange={(e) => handleMonthlyDepositChange(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
              />

              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '₹12,500 (Max)', val: 12500 },
                    { label: '₹10,000', val: 10000 },
                    { label: '₹5,000', val: 5000 },
                    { label: '₹2,500', val: 2500 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleMonthlyDepositChange(p.val)}
                      className={cn(
                        'px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer',
                        inputs.monthlyDeposit === p.val
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-border text-muted-foreground hover:border-purple-300'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="500"
                    max="12500"
                    step="500"
                    value={inputs.monthlyDeposit || ''}
                    onChange={(e) => handleMonthlyDepositChange(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1 text-xs font-bold rounded-lg border border-border bg-background text-right"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tip: Deposit on or before the 5th of each month to maximize monthly interest credit.
              </p>
            </div>
          )}

          {/* Section: Since When Are You Investing? */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Account Timeline & Starting Point</span>
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Since when are you investing?
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleStartModeChange('new')}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                  inputs.startMode === 'new'
                    ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500/40 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-purple-300'
                )}
              >
                <span className="text-xs font-bold block text-foreground">
                  Starting New Account
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Full 15-year statutory tenure from Year 1
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleStartModeChange('existing')}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                  inputs.startMode === 'existing'
                    ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500/40 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-purple-300'
                )}
              >
                <span className="text-xs font-bold block text-foreground">
                  Existing PPF Account
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Already active with prior deposits
                </span>
              </button>
            </div>

            {inputs.startMode === 'existing' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">
                    Years Already Invested
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="1"
                      value={inputs.yearsAlreadyInvested}
                      onChange={(e) => handleYearsAlreadyChange(Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-xs font-extrabold text-foreground w-12 text-right">
                      {inputs.yearsAlreadyInvested} yrs
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    {Math.max(0, 15 - inputs.yearsAlreadyInvested)} yrs left in initial 15-yr
                    lock-in
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-foreground">
                      Current PPF Balance Today
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoCorpus = calculateEstimatedPpfBalance(
                          inputs.yearsAlreadyInvested,
                          inputs.annualDeposit,
                          inputs.annualInterestRate,
                          inputs.depositFrequency,
                          inputs.monthlyDeposit
                        )
                        handleExistingCorpusChange(autoCorpus)
                      }}
                      className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                      title="Recalculate balance based on investment amount and interest rate"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-fill</span>
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={inputs.existingCorpus || ''}
                      onChange={(e) => handleExistingCorpusChange(Number(e.target.value))}
                      placeholder="e.g. 5,00,000"
                      className="w-full pl-6 pr-2.5 py-1 text-xs font-bold rounded-lg border border-border bg-background"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {formatCrore(inputs.existingCorpus || 0)} (
                      {formatINR(inputs.existingCorpus || 0)})
                    </span>
                    <span className="italic text-purple-700 dark:text-purple-300">
                      Editable if passbook differs
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Till When Do You Want to Invest? (Tenure & Extensions) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Total Account Tenure & 5-Year Extensions</span>
              </label>
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                {inputs.tenureYears} Years Total
              </span>
            </div>

            {/* Quick Extension Block Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '15 Years', years: 15, sub: 'Statutory Base' },
                { label: '20 Years', years: 20, sub: '+1 Block (5 yrs)' },
                { label: '25 Years', years: 25, sub: '+2 Blocks (10 yrs)' },
                { label: '30 Years', years: 30, sub: '+3 Blocks (15 yrs)' },
              ].map((b) => (
                <button
                  key={b.years}
                  type="button"
                  onClick={() => handleTenureChange(b.years)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                    inputs.tenureYears === b.years
                      ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500/40 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-purple-300'
                  )}
                >
                  <span className="text-xs font-bold block text-foreground">{b.label}</span>
                  <span className="text-[10px] text-muted-foreground block">{b.sub}</span>
                </button>
              ))}
            </div>

            {/* Tenure Slider */}
            <input
              type="range"
              min="15"
              max="40"
              step="1"
              value={inputs.tenureYears}
              onChange={(e) => handleTenureChange(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
            />

            {/* Extension / Re-investment Mode Options */}
            {inputs.tenureYears > 15 && (
              <div className="p-3 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20 space-y-2.5">
                <span className="text-xs font-bold text-foreground block">
                  Extension & Re-investment Choice (After 15 Years)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExtensionModeChange('with_contributions')}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                      inputs.extensionMode === 'with_contributions'
                        ? 'border-purple-500 bg-card text-foreground ring-1 ring-purple-500/40'
                        : 'border-border bg-background/50 text-muted-foreground hover:border-purple-300'
                    )}
                  >
                    <span className="text-xs font-bold block text-foreground">
                      Extend With Contributions
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Continue depositing up to ₹1.5L/yr across all {inputs.tenureYears} years
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExtensionModeChange('without_contributions')}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                      inputs.extensionMode === 'without_contributions'
                        ? 'border-purple-500 bg-card text-foreground ring-1 ring-purple-500/40'
                        : 'border-border bg-background/50 text-muted-foreground hover:border-purple-300'
                    )}
                  >
                    <span className="text-xs font-bold block text-foreground">
                      Extend Without Contributions (Re-invest Only)
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Stop deposits at 15 yrs; keep balance compounding at 7.10% tax-free
                    </span>
                  </button>
                </div>

                {inputs.extensionMode === 'with_contributions' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground">
                        Contribution Duration (Years of fresh deposits):
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {inputs.contributionYears} Years
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={inputs.tenureYears}
                      step="1"
                      value={inputs.contributionYears}
                      onChange={(e) => handleContributionYearsChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Depositing for Years 1–{inputs.contributionYears}, then compounding with ₹0
                      fresh deposits for remaining{' '}
                      {Math.max(0, inputs.tenureYears - inputs.contributionYears)} years.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interest Rate & Tax Settings */}
          <div className="space-y-3 pt-1 border-t border-border/70">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Annual Interest Rate (% p.a.)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                  {inputs.annualInterestRate}%
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                  Govt Notified Rate
                </span>
              </div>
            </div>

            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.05"
              value={inputs.annualInterestRate}
              onChange={(e) => handleRateChange(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-[11px] text-muted-foreground">
              Official PPF interest rate is notified quarterly by the Ministry of Finance (currently
              7.10% compounded annually).
            </p>

            {/* Toggle Tax & Inflation settings */}
            <button
              type="button"
              onClick={() => setShowTaxDetails(!showTaxDetails)}
              className="flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline pt-1 cursor-pointer"
            >
              <span>
                {showTaxDetails ? 'Hide Tax Slab & Inflation' : 'Customize Tax Slab & Inflation'}
              </span>
              {showTaxDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showTaxDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Tax Slab (for 80C Savings)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      value={inputs.taxSlabRatePercent}
                      onChange={(e) => handleTaxSlabChange(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg border border-border bg-background text-right font-bold"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Computes annual 80C tax deduction saved
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Inflation Rate</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      step="0.1"
                      value={inputs.inflationRatePercent}
                      onChange={(e) => handleInflationChange(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg border border-border bg-background text-right font-bold"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Calculates real purchasing power at maturity
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Summary Cards & Graph (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Big Maturity Card */}
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/50 via-background to-background dark:from-purple-950/30 dark:via-background dark:to-background p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Maturity Amount (Year {results.tenureYears})
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                100% Tax Free
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {formatCrore(results.maturityAmount)}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                ₹{results.maturityAmount.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${principalPct}%` }}
                  className="bg-purple-500 h-full transition-all duration-300"
                  title={`Principal Deposited: ${principalPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${interestPct}%` }}
                  className="bg-emerald-500 h-full transition-all duration-300"
                  title={`Interest Earned: ${interestPct.toFixed(1)}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Deposited ({principalPct.toFixed(0)}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Interest ({interestPct.toFixed(0)}%)</span>
                </span>
              </div>
            </div>

            {/* Detailed metrics grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/70 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">
                  Total Principal Deposited
                </span>
                <span className="text-sm font-extrabold text-foreground">
                  {formatCrore(results.totalPrincipalDeposited)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">
                  Total Tax-Free Interest
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{formatCrore(results.totalInterestEarned)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">
                  Purchasing Power (Real Value)
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCrore(results.realPurchasingPower)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">Total 80C Tax Saved</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatINR(results.totalTaxSaved80C)}
                </span>
              </div>
            </div>
          </div>

          {/* Scheme Highlights Card */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2.5 text-xs text-muted-foreground">
            <span className="font-bold text-foreground block flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Public Provident Fund (PPF) Rules Summary</span>
            </span>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
              <li>
                <strong>Cap:</strong> ₹1,50,000 maximum deposit per financial year (min ₹500).
              </li>
              <li>
                <strong>Tenure:</strong> 15 financial years initial lock-in period.
              </li>
              <li>
                <strong>Extensions:</strong> Unlimited 5-year block extensions with or without fresh
                contributions.
              </li>
              <li>
                <strong>Safety:</strong> 100% sovereign guarantee backed by the Government of India.
              </li>
              <li>
                <strong>Tax:</strong> Exempt under Section 80C, Section 10(11), zero wealth tax.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Year-by-Year Schedule Table */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
        <button
          type="button"
          onClick={() => setShowScheduleTable(!showScheduleTable)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-foreground group-hover:text-purple-600 transition-colors">
              Year-by-Year Compounding Schedule ({results.yearlySchedule.length} Years)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span>{showScheduleTable ? 'Hide Schedule' : 'View Schedule'}</span>
            {showScheduleTable ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showScheduleTable && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold text-muted-foreground bg-muted/30">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Opening Balance</th>
                  <th className="py-2.5 px-3">Deposit Made</th>
                  <th className="py-2.5 px-3">Interest Earned ({inputs.annualInterestRate}%)</th>
                  <th className="py-2.5 px-3">Closing Balance</th>
                  <th className="py-2.5 px-3">Cumul. Interest</th>
                  <th className="py-2.5 px-3">80C Tax Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {results.yearlySchedule.map((row) => (
                  <tr
                    key={row.year}
                    className={cn(
                      'hover:bg-muted/40 transition-colors',
                      row.isExtended ? 'bg-purple-50/20 dark:bg-purple-950/10' : ''
                    )}
                  >
                    <td className="py-2 px-3 font-bold text-foreground">
                      Year {row.year}
                      {row.isExtended && (
                        <span className="ml-1 text-[9px] font-bold px-1 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          {row.isContributionActive ? 'Ext + Dep' : 'Re-invest'}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">
                      {formatINR(row.openingBalance)}
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold text-foreground">
                      {row.deposit > 0 ? formatINR(row.deposit) : '— (₹0)'}
                    </td>
                    <td className="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      +{formatINR(row.interestEarned)}
                    </td>
                    <td className="py-2 px-3 font-mono font-black text-foreground">
                      {formatINR(row.closingBalance)}
                    </td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">
                      {formatINR(row.cumulativeInterest)}
                    </td>
                    <td className="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                      {row.taxSaved80C > 0 ? formatINR(row.taxSaved80C) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
