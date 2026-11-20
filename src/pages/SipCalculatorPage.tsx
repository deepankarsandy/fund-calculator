import { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp,
  ArrowLeft,
  RotateCcw,
  Percent,
  Calendar,
  IndianRupee,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowDownCircle,
  AlertTriangle,
  Repeat,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { getUserProfile, deriveSipInputsFromProfile } from '@/lib/userProfileStorage'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  DEFAULT_SIP_INPUTS,
  DEFAULT_SWP_INPUTS,
  DEFAULT_SIP_TO_SWP_INPUTS,
  calculateSip,
  calculateSwp,
  calculateSipToSwp,
} from '@/domain/calculations/sip'
import {
  StoredSipData,
  SipMode,
  getStoredSipInputs,
  saveStoredSipInputs,
  saveStoredSipResults,
} from '@/lib/sipStorage'

interface SipCalculatorPageProps {
  onBackToHome: () => void
}

export default function SipCalculatorPage({ onBackToHome }: SipCalculatorPageProps) {
  const [data, setData] = useState<StoredSipData>(() => getStoredSipInputs())
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  const [showScheduleTable, setShowScheduleTable] = useState(false)
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'sip' | 'swp'>('all')

  const mode = data.mode
  const sipInputs = data.sip
  const swpInputs = data.swp
  const comboInputs = data.combo || DEFAULT_SIP_TO_SWP_INPUTS

  // Calculate results reactively
  const sipResults = useMemo(() => calculateSip(sipInputs), [sipInputs])
  const swpResults = useMemo(() => calculateSwp(swpInputs), [swpInputs])
  const comboResults = useMemo(() => calculateSipToSwp(comboInputs), [comboInputs])

  // Persist both inputs and results to distinct local storage keys
  useEffect(() => {
    saveStoredSipInputs(data)
    saveStoredSipResults({
      mode,
      sip: sipResults,
      swp: swpResults,
      combo: comboResults,
    })
  }, [data, mode, sipResults, swpResults, comboResults])

  const setMode = (newMode: SipMode) => {
    setData((prev) => ({ ...prev, mode: newMode }))
  }

  // SIP input handlers
  const handleSipMonthlyChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      sip: { ...prev.sip, monthlyInvestment: Math.max(0, val) },
    }))
  }

  const handleSipReturnChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      sip: { ...prev.sip, annualReturnRate: Math.max(0, Math.min(50, val)) },
    }))
  }

  const handleSipYearsChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      sip: { ...prev.sip, timeHorizonYears: Math.max(1, Math.min(50, val)) },
    }))
  }

  // SWP input handlers
  const handleSwpCorpusChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      swp: { ...prev.swp, initialInvestment: Math.max(0, val) },
    }))
  }

  const handleSwpMonthlyChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      swp: { ...prev.swp, monthlyWithdrawal: Math.max(0, val) },
    }))
  }

  const handleSwpReturnChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      swp: { ...prev.swp, annualReturnRate: Math.max(0, Math.min(50, val)) },
    }))
  }

  const handleSwpYearsChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      swp: { ...prev.swp, timeHorizonYears: Math.max(1, Math.min(50, val)) },
    }))
  }

  // COMBO (SIP to SWP) input handlers
  const handleComboAgeChange = (
    field: 'currentAge' | 'retirementAge' | 'targetAge',
    val: number
  ) => {
    setData((prev) => {
      const current = prev.combo || DEFAULT_SIP_TO_SWP_INPUTS
      let newCurrent = current.currentAge
      let newRetirement = current.retirementAge
      let newTarget = current.targetAge

      if (field === 'currentAge') {
        newCurrent = Math.max(18, Math.min(75, val))
        if (newRetirement <= newCurrent) newRetirement = newCurrent + 5
        if (newTarget <= newRetirement) newTarget = newRetirement + 10
      } else if (field === 'retirementAge') {
        newRetirement = Math.max(newCurrent + 1, Math.min(85, val))
        if (newTarget <= newRetirement) newTarget = newRetirement + 5
      } else if (field === 'targetAge') {
        newTarget = Math.max(newRetirement + 1, Math.min(100, val))
      }

      return {
        ...prev,
        combo: {
          ...current,
          currentAge: newCurrent,
          retirementAge: newRetirement,
          targetAge: newTarget,
        },
      }
    })
  }

  const handleComboSipMonthlyChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      combo: { ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS), monthlySip: Math.max(0, val) },
    }))
  }

  const handleComboSipReturnChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      combo: {
        ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
        sipReturnRate: Math.max(0, Math.min(40, val)),
      },
    }))
  }

  const handleComboSwpMonthlyChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      combo: { ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS), monthlySwp: Math.max(0, val) },
    }))
  }

  const handleComboSwpReturnChange = (val: number) => {
    setData((prev) => ({
      ...prev,
      combo: {
        ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
        swpReturnRate: Math.max(0, Math.min(40, val)),
      },
    }))
  }

  const handleReset = () => {
    if (mode === 'sip') {
      setData((prev) => ({ ...prev, sip: DEFAULT_SIP_INPUTS }))
    } else if (mode === 'swp') {
      setData((prev) => ({ ...prev, swp: DEFAULT_SWP_INPUTS }))
    } else {
      setData((prev) => ({ ...prev, combo: DEFAULT_SIP_TO_SWP_INPUTS }))
    }
  }

  const handleApplyProfileDefaults = () => {
    const profile = getUserProfile()
    const updated = deriveSipInputsFromProfile(profile, data)
    setData(updated)
  }

  // SIP Visual Bar Ratios
  const sipTotal = sipResults.grossCorpus > 0 ? sipResults.grossCorpus : 1
  const sipInvestedPct = Math.min(100, (sipResults.totalInvested / sipTotal) * 100)
  const sipReturnsPct = Math.max(0, 100 - sipInvestedPct)

  // SWP Visual Bar Ratios
  const swpTotalGenerated = swpResults.totalWithdrawn + swpResults.finalBalance || 1
  const swpWithdrawnPct = Math.min(100, (swpResults.totalWithdrawn / swpTotalGenerated) * 100)
  const swpBalancePct = Math.max(0, 100 - swpWithdrawnPct)

  // Combo Visual Bar Ratios
  const comboPeak = comboResults.sipAccumulatedCorpus > 0 ? comboResults.sipAccumulatedCorpus : 1
  const comboInvestedPct = Math.min(100, (comboResults.totalSipInvested / comboPeak) * 100)
  const comboGainPct = Math.max(0, 100 - comboInvestedPct)

  const filteredComboSchedule = useMemo(() => {
    if (scheduleFilter === 'sip') {
      return comboResults.yearlySchedule.filter((row) => row.phase === 'sip')
    }
    if (scheduleFilter === 'swp') {
      return comboResults.yearlySchedule.filter((row) => row.phase === 'swp')
    }
    return comboResults.yearlySchedule
  }, [comboResults.yearlySchedule, scheduleFilter])

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-4 space-y-8 w-full">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyProfileDefaults}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
                title="Populate baseline values from your saved User Profile (Age, Retirement, LTCG, Inflation)"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Auto-set from Profile</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
                title="Reset all inputs to Indian defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
                {mode === 'sip' ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : mode === 'swp' ? (
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                ) : (
                  <Repeat className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                )}
                <span>
                  {mode === 'sip'
                    ? 'Systematic Investment Plan'
                    : mode === 'swp'
                      ? 'Systematic Withdrawal Plan'
                      : 'Lifecycle Journey · SIP to SWP'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                {mode === 'sip'
                  ? 'SIP Calculator'
                  : mode === 'swp'
                    ? 'SWP Calculator'
                    : 'SIP to SWP Retirement Journey'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                {mode === 'sip'
                  ? 'Simulate monthly mutual fund compounding, annual step-up top-ups, and post-Budget 2024 LTCG tax impact.'
                  : mode === 'swp'
                    ? 'Model monthly retirement withdrawals from your investment corpus with regular compounding and tax estimates.'
                    : 'Plan your complete life path: invest via SIP (e.g. Age 30 to 60), then withdraw via SWP (Age 60 to 90). Verify corpus sustainability and leftover estate.'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher: SIP vs SWP vs Combo */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border max-w-xl">
          <button
            type="button"
            onClick={() => setMode('sip')}
            className={`flex-1 min-w-[120px] py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'sip'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>SIP (Investment)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('swp')}
            className={`flex-1 min-w-[120px] py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'swp'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>SWP (Withdrawal)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('combo')}
            className={`flex-1 min-w-[150px] py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'combo'
                ? 'bg-card text-foreground shadow-xs border border-purple-500/40 text-purple-700 dark:text-purple-300'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>SIP + SWP (Journey)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SIP MODE INTERFACE                                                        */}
        {/* ========================================================================= */}
        {mode === 'sip' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: SIP Inputs Form (7 cols) */}
            <div className="lg:col-span-7 space-y-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
              {/* Monthly Investment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Monthly Investment Amount</span>
                  </label>
                  <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {formatINR(sipInputs.monthlyInvestment)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={500}
                    max={200000}
                    step={500}
                    value={sipInputs.monthlyInvestment}
                    onChange={(e) => handleSipMonthlyChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="relative w-28 sm:w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={500}
                      step={500}
                      value={sipInputs.monthlyInvestment}
                      onChange={(e) => handleSipMonthlyChange(Number(e.target.value))}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[2500, 5000, 10000, 25000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSipMonthlyChange(amt)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        sipInputs.monthlyInvestment === amt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Return Rate */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Expected Return Rate (p.a.)</span>
                  </label>
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {sipInputs.annualReturnRate}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={sipInputs.annualReturnRate}
                    onChange={(e) => handleSipReturnChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step={0.5}
                      value={sipInputs.annualReturnRate}
                      onChange={(e) => handleSipReturnChange(Number(e.target.value))}
                      className="w-full pl-2.5 pr-7 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '8% (Debt/Hybrid)', rate: 8 },
                    { label: '10% (Conservative)', rate: 10 },
                    { label: '12% (Nifty Index Base)', rate: 12 },
                    { label: '15% (Aggressive Equity)', rate: 15 },
                  ].map((item) => (
                    <button
                      key={item.rate}
                      type="button"
                      onClick={() => handleSipReturnChange(item.rate)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        sipInputs.annualReturnRate === item.rate
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Horizon */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Investment Time Horizon</span>
                  </label>
                  <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {sipInputs.timeHorizonYears} Years ({sipInputs.timeHorizonYears * 12} Months)
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={40}
                    step={1}
                    value={sipInputs.timeHorizonYears}
                    onChange={(e) => handleSipYearsChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step={1}
                      value={sipInputs.timeHorizonYears}
                      onChange={(e) => handleSipYearsChange(Number(e.target.value))}
                      className="w-full pl-2.5 pr-8 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      Yr
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[3, 5, 10, 15, 20, 25].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleSipYearsChange(yr)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        sipInputs.timeHorizonYears === yr
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {yr} Yr
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Step-Up Option */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(sipInputs.enableStepUp)}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          sip: { ...prev.sip, enableStepUp: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        Annual Step-Up (Top-Up SIP)
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Automatically increase monthly investment each year with salary hikes
                      </p>
                    </div>
                  </div>
                  {sipInputs.enableStepUp && (
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      +{sipInputs.stepUpPercentage}% / yr
                    </span>
                  )}
                </label>

                {sipInputs.enableStepUp && (
                  <div className="pt-2 border-t border-border/60 flex items-center gap-3">
                    <input
                      type="range"
                      min={2}
                      max={30}
                      step={1}
                      value={sipInputs.stepUpPercentage || 10}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          sip: {
                            ...prev.sip,
                            stepUpPercentage: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="text-xs font-bold text-foreground w-12 text-right">
                      {sipInputs.stepUpPercentage}%
                    </div>
                  </div>
                )}
              </div>

              {/* Indian Tax & Inflation Section */}
              <div className="rounded-xl border border-border/80 bg-card">
                <button
                  type="button"
                  onClick={() => setShowTaxDetails((prev) => !prev)}
                  className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Indian Tax & Inflation Assumptions</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Budget 2024 LTCG (12.5%)
                    </span>
                  </div>
                  {showTaxDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showTaxDetails && (
                  <div className="p-3.5 pt-0 border-t border-border/60 space-y-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={sipInputs.enableTax !== false}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            sip: { ...prev.sip, enableTax: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                      <span className="font-semibold text-foreground">
                        Apply Indian Mutual Fund Capital Gains Tax (LTCG)
                      </span>
                    </label>

                    {sipInputs.enableTax !== false && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            LTCG Tax Rate (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step={0.5}
                              value={sipInputs.taxRatePercent ?? 12.5}
                              onChange={(e) =>
                                setData((prev) => ({
                                  ...prev,
                                  sip: {
                                    ...prev.sip,
                                    taxRatePercent: Number(e.target.value),
                                  },
                                }))
                              }
                              className="w-full pl-2.5 pr-7 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-right"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                              %
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            Post Budget 2024: 12.5%
                          </span>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Annual Exemption Limit (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                              ₹
                            </span>
                            <input
                              type="number"
                              step={5000}
                              value={sipInputs.taxExemptionAmount ?? 125000}
                              onChange={(e) =>
                                setData((prev) => ({
                                  ...prev,
                                  sip: {
                                    ...prev.sip,
                                    taxExemptionAmount: Number(e.target.value),
                                  },
                                }))
                              }
                              className="w-full pl-6 pr-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-right"
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            ₹1,25,000 exempt p.a.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border/60">
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Inflation Rate for Real Value Discounting (% p.a.)
                      </label>
                      <div className="relative w-32">
                        <input
                          type="number"
                          step={0.5}
                          value={sipInputs.inflationRatePercent ?? 6.0}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              sip: {
                                ...prev.sip,
                                inflationRatePercent: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full pl-2.5 pr-7 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-right"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          %
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        Historical Indian CPI ~ 6.0%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: SIP Output Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-50/60 via-card to-card dark:from-blue-950/40 dark:via-card dark:to-card shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Projected Wealth
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {sipInputs.timeHorizonYears} Years Compounding
                  </span>
                </div>

                {/* Big Corpus Display */}
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    {formatCrore(sipResults.grossCorpus)}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                    Gross Corpus ({formatINR(sipResults.grossCorpus)})
                  </div>
                </div>

                {/* Visual Proportion Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${sipInvestedPct}%` }}
                      className="h-full bg-blue-600 transition-all duration-300"
                      title={`Invested: ${sipInvestedPct.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${sipReturnsPct}%` }}
                      className="h-full bg-emerald-500 transition-all duration-300"
                      title={`Returns: ${sipReturnsPct.toFixed(1)}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      Invested: {sipInvestedPct.toFixed(0)}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Gain: {sipReturnsPct.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Detail Metrics Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-border/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">
                      Total Invested Amount:
                    </span>
                    <span className="font-bold text-foreground">
                      {formatINR(sipResults.totalInvested)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">
                      Estimated Wealth Gain:
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(sipResults.estimatedReturns)}
                    </span>
                  </div>

                  {sipInputs.enableTax !== false && (
                    <>
                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                        <span className="font-medium">Estimated LTCG Tax (12.5%):</span>
                        <span className="font-bold">-{formatINR(sipResults.estimatedTax)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <span className="font-bold text-foreground">Post-Tax In-Hand Corpus:</span>
                        <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                          {formatINR(sipResults.netCorpus)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 bg-muted/30 p-2 rounded-lg">
                    <div>
                      <span className="font-bold text-foreground block">
                        Inflation-Adjusted Value
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Today's purchasing power @ {sipInputs.inflationRatePercent ?? 6}%
                      </span>
                    </div>
                    <span className="font-extrabold text-foreground text-sm">
                      {formatCrore(sipResults.realPurchasingPower)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nudge to Combo Mode */}
              <button
                type="button"
                onClick={() => setMode('combo')}
                className="w-full p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 text-left hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Retirement Lifecycle: SIP ➔ SWP</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Wondering if your SIP is enough to fund monthly expenses from Age 60 to 90?
                  Simulate both accumulation and retirement decumulation together.
                </p>
              </button>

              {/* Privacy Note */}
              <div className="p-3.5 rounded-xl border border-border bg-card text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground font-bold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Automatic Browser Persistence</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your parameters and calculated breakdowns are stored in your private browser
                  storage. No financial data ever leaves your computer.
                </p>
              </div>
            </div>
          </div>
        ) : mode === 'swp' ? (
          /* ========================================================================= */
          /* SWP MODE INTERFACE                                                        */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: SWP Inputs Form (7 cols) */}
            <div className="lg:col-span-7 space-y-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
              {/* Initial Investment Corpus */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Total Initial Corpus (Investment)</span>
                  </label>
                  <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    {formatINR(swpInputs.initialInvestment)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={500000}
                    max={20000000}
                    step={100000}
                    value={swpInputs.initialInvestment}
                    onChange={(e) => handleSwpCorpusChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="relative w-28 sm:w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={100000}
                      step={100000}
                      value={swpInputs.initialInvestment}
                      onChange={(e) => handleSwpCorpusChange(Number(e.target.value))}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[1000000, 2500000, 5000000, 7500000, 10000000, 20000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSwpCorpusChange(amt)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        swpInputs.initialInvestment === amt
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ₹{amt >= 10000000 ? `${amt / 10000000} Cr` : `${amt / 100000} L`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Withdrawal */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Monthly Withdrawal Amount</span>
                  </label>
                  <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {formatINR(swpInputs.monthlyWithdrawal)} / month
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5000}
                    max={200000}
                    step={1000}
                    value={swpInputs.monthlyWithdrawal}
                    onChange={(e) => handleSwpMonthlyChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="relative w-28 sm:w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={swpInputs.monthlyWithdrawal}
                      onChange={(e) => handleSwpMonthlyChange(Number(e.target.value))}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[15000, 25000, 35000, 50000, 75000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSwpMonthlyChange(amt)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        swpInputs.monthlyWithdrawal === amt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ₹{amt / 1000}k / mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Return Rate */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Expected Return Rate on Remaining Corpus</span>
                  </label>
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {swpInputs.annualReturnRate}% p.a.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={swpInputs.annualReturnRate}
                    onChange={(e) => handleSwpReturnChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={0.5}
                      value={swpInputs.annualReturnRate}
                      onChange={(e) => handleSwpReturnChange(Number(e.target.value))}
                      className="w-full pl-2.5 pr-7 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '7% (Debt / FD)', rate: 7 },
                    { label: '8.5% (Balanced Advantage)', rate: 8.5 },
                    { label: '10% (Hybrid Equity)', rate: 10 },
                    { label: '12% (Pure Equity)', rate: 12 },
                  ].map((item) => (
                    <button
                      key={item.rate}
                      type="button"
                      onClick={() => handleSwpReturnChange(item.rate)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        swpInputs.annualReturnRate === item.rate
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdrawal Time Horizon */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Withdrawal Time Horizon</span>
                  </label>
                  <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {swpInputs.timeHorizonYears} Years ({swpInputs.timeHorizonYears * 12} Months)
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={40}
                    step={1}
                    value={swpInputs.timeHorizonYears}
                    onChange={(e) => handleSwpYearsChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="relative w-28 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step={1}
                      value={swpInputs.timeHorizonYears}
                      onChange={(e) => handleSwpYearsChange(Number(e.target.value))}
                      className="w-full pl-2.5 pr-8 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      Yr
                    </span>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[5, 10, 15, 20, 25, 30].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleSwpYearsChange(yr)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        swpInputs.timeHorizonYears === yr
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {yr} Yr
                    </button>
                  ))}
                </div>
              </div>

              {/* Inflation Indexed Withdrawal (Step-Up) */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(swpInputs.enableStepUpWithdrawal)}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          swp: {
                            ...prev.swp,
                            enableStepUpWithdrawal: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        Annual Withdrawal Increase
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Increase monthly withdrawal amount annually to match cost of living
                        inflation
                      </p>
                    </div>
                  </div>
                  {swpInputs.enableStepUpWithdrawal && (
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      +{swpInputs.stepUpWithdrawalPercent}% / yr
                    </span>
                  )}
                </label>

                {swpInputs.enableStepUpWithdrawal && (
                  <div className="pt-2 border-t border-border/60 flex items-center gap-3">
                    <input
                      type="range"
                      min={2}
                      max={15}
                      step={0.5}
                      value={swpInputs.stepUpWithdrawalPercent || 5}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          swp: {
                            ...prev.swp,
                            stepUpWithdrawalPercent: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="text-xs font-bold text-foreground w-12 text-right">
                      {swpInputs.stepUpWithdrawalPercent}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: SWP Output Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-50/60 via-card to-card dark:from-amber-950/40 dark:via-card dark:to-card shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Total Withdrawn
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    {swpInputs.timeHorizonYears} Years Plan
                  </span>
                </div>

                {/* Big Display */}
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    {formatCrore(swpResults.totalWithdrawn)}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                    Cumulative Cashflow ({formatINR(swpResults.totalWithdrawn)})
                  </div>
                </div>

                {/* Depletion Alert if depleted */}
                {swpResults.isDepleted ? (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs space-y-1 text-red-800 dark:text-red-300">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Corpus Depleted in Year {swpResults.depletionYear}!</span>
                    </div>
                    <p className="text-[11px] leading-snug">
                      Withdrawals exceeded return compounding at month {swpResults.depletionMonth}.
                      Consider reducing monthly withdrawal or increasing return.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                    <div className="font-bold">Corpus Fully Sustainable</div>
                    <p className="text-[11px] leading-snug">
                      Your balance of {formatCrore(swpResults.finalBalance)} remains intact after
                      funding all withdrawals.
                    </p>
                  </div>
                )}

                {/* Visual Proportion Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${swpWithdrawnPct}%` }}
                      className="h-full bg-amber-500 transition-all duration-300"
                      title={`Withdrawn: ${swpWithdrawnPct.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${swpBalancePct}%` }}
                      className="h-full bg-blue-600 transition-all duration-300"
                      title={`Remaining: ${swpBalancePct.toFixed(1)}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      Withdrawn: {swpWithdrawnPct.toFixed(0)}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      Remaining: {swpBalancePct.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Detail Metrics Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-border/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Initial Corpus:</span>
                    <span className="font-bold text-foreground">
                      {formatINR(swpResults.initialInvestment)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">
                      Growth Generated During Tenure:
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(swpResults.totalGrowthEarned)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">
                      Final Remaining Balance:
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatINR(swpResults.finalBalance)}
                    </span>
                  </div>

                  {swpInputs.enableTax && swpResults.estimatedTax > 0 && (
                    <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                      <span className="font-medium">Estimated Capital Gains Tax (12.5%):</span>
                      <span className="font-bold">-{formatINR(swpResults.estimatedTax)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 bg-muted/30 p-2 rounded-lg">
                    <div>
                      <span className="font-bold text-foreground block">
                        Inflation-Adjusted Remaining
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Today's value @ {swpInputs.inflationRatePercent ?? 6}%
                      </span>
                    </div>
                    <span className="font-extrabold text-foreground text-sm">
                      {formatCrore(swpResults.realPurchasingPowerRemaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nudge to Combo Mode */}
              <button
                type="button"
                onClick={() => setMode('combo')}
                className="w-full p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 text-left hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>How to Build This Corpus? SIP ➔ SWP</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Plan how much monthly SIP from Age 30 to 60 you need to accumulate this corpus and
                  sustain your retirement withdrawals.
                </p>
              </button>

              {/* Privacy Note */}
              <div className="p-3.5 rounded-xl border border-border bg-card text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground font-bold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Automatic Browser Persistence</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your withdrawal parameters and balances are persisted locally in your browser.
                  Absolute confidentiality guaranteed.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* SIP + SWP LIFECYCLE JOURNEY INTERFACE                                     */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Interactive Lifecycle Roadmap Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-emerald-50/80 dark:from-blue-950/40 dark:via-purple-950/30 dark:to-emerald-950/40 border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Milestone 1: Start Age */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    {comboInputs.currentAge}
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Phase 1: Start SIP
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      Age {comboInputs.currentAge} · {formatINR(comboInputs.monthlySip)}/mo
                    </div>
                  </div>
                </div>

                {/* Transition Arrow 1 */}
                <div className="hidden sm:flex flex-col items-center text-center px-2">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {comboResults.sipYears} Yrs Accumulation @ {comboInputs.sipReturnRate}%
                  </span>
                  <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full my-0.5" />
                  <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400">
                    Invests {formatCrore(comboResults.totalSipInvested)}
                  </span>
                </div>

                {/* Milestone 2: Retirement Age */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    {comboInputs.retirementAge}
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Phase 2: Retirement SWP
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      Peak Corpus {formatCrore(comboResults.sipAccumulatedCorpus)}
                    </div>
                  </div>
                </div>

                {/* Transition Arrow 2 */}
                <div className="hidden sm:flex flex-col items-center text-center px-2">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {comboResults.swpYears} Yrs SWP @ {comboInputs.swpReturnRate}%
                  </span>
                  <div className="w-24 h-0.5 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full my-0.5" />
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                    Pulls {formatINR(comboInputs.monthlySwp)}/mo
                  </span>
                </div>

                {/* Milestone 3: Target Age */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div
                    className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                      comboResults.isEnough ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  >
                    {comboInputs.targetAge}
                  </div>
                  <div>
                    <div
                      className={`text-[10px] font-extrabold uppercase tracking-wide ${
                        comboResults.isEnough
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {comboResults.isEnough ? 'Remaining Legacy' : 'Depletion'}
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {comboResults.isEnough
                        ? `${formatCrore(comboResults.finalRemainingBalance)} Left`
                        : `Empty at Age ${comboResults.depletionAge}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Lifecycle Inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Age & Lifecycle Planning Horizon */}
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Life Stages & Age Horizons</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold">
                      <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                        {comboResults.sipYears} Yrs SIP
                      </span>
                      <span className="bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                        {comboResults.swpYears} Yrs SWP
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Current Age */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/70">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Current Age</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                          {comboInputs.currentAge} Yrs
                        </span>
                      </div>
                      <input
                        type="range"
                        min={18}
                        max={70}
                        step={1}
                        value={comboInputs.currentAge}
                        onChange={(e) => handleComboAgeChange('currentAge', Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="text-[10px] text-muted-foreground">Start investing today</div>
                    </div>

                    {/* Retirement Age */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/70">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Retirement Age</span>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">
                          {comboInputs.retirementAge} Yrs
                        </span>
                      </div>
                      <input
                        type="range"
                        min={comboInputs.currentAge + 1}
                        max={80}
                        step={1}
                        value={comboInputs.retirementAge}
                        onChange={(e) =>
                          handleComboAgeChange('retirementAge', Number(e.target.value))
                        }
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <div className="text-[10px] text-muted-foreground">
                        SIP stops & SWP starts
                      </div>
                    </div>

                    {/* Target Age */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/70">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">
                          Target / Life Age
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {comboInputs.targetAge} Yrs
                        </span>
                      </div>
                      <input
                        type="range"
                        min={comboInputs.retirementAge + 1}
                        max={100}
                        step={1}
                        value={comboInputs.targetAge}
                        onChange={(e) => handleComboAgeChange('targetAge', Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="text-[10px] text-muted-foreground">Planning horizon end</div>
                    </div>
                  </div>
                </div>

                {/* 2. Phase 1: SIP Accumulation Inputs */}
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          Phase 1: SIP Accumulation
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Age {comboInputs.currentAge} to {comboInputs.retirementAge} (
                          {comboResults.sipYears} years)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      {formatINR(comboInputs.monthlySip)} / mo
                    </span>
                  </div>

                  {/* Monthly SIP Amount */}
                  <div className="space-y-2 pt-1 border-t border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Monthly Investment (SIP)</span>
                      </label>
                      <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        {formatINR(comboInputs.monthlySip)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1000}
                        max={200000}
                        step={500}
                        value={comboInputs.monthlySip}
                        onChange={(e) => handleComboSipMonthlyChange(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={500}
                          step={500}
                          value={comboInputs.monthlySip}
                          onChange={(e) => handleComboSipMonthlyChange(Number(e.target.value))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[5000, 10000, 15000, 25000, 50000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleComboSipMonthlyChange(amt)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            comboInputs.monthlySip === amt
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          ₹{amt / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expected SIP Return */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Expected Return During SIP (p.a.)</span>
                      </label>
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {comboInputs.sipReturnRate}%
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={30}
                        step={0.5}
                        value={comboInputs.sipReturnRate}
                        onChange={(e) => handleComboSipReturnChange(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative w-28 shrink-0">
                        <input
                          type="number"
                          min={1}
                          max={35}
                          step={0.5}
                          value={comboInputs.sipReturnRate}
                          onChange={(e) => handleComboSipReturnChange(Number(e.target.value))}
                          className="w-full pl-2.5 pr-7 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[10, 12, 14, 15].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleComboSipReturnChange(rate)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            comboInputs.sipReturnRate === rate
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Annual Step-Up */}
                  <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(comboInputs.enableSipStepUp)}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              combo: {
                                ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
                                enableSipStepUp: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground">
                            Annual Top-Up (Step-Up SIP)
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            Increase monthly contribution each year
                          </p>
                        </div>
                      </div>
                      {comboInputs.enableSipStepUp && (
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                          +{comboInputs.sipStepUpPercent || 10}% / yr
                        </span>
                      )}
                    </label>

                    {comboInputs.enableSipStepUp && (
                      <div className="pt-2 border-t border-border/60 flex items-center gap-3">
                        <input
                          type="range"
                          min={2}
                          max={25}
                          step={1}
                          value={comboInputs.sipStepUpPercent || 10}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              combo: {
                                ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
                                sipStepUpPercent: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="text-xs font-bold text-foreground w-12 text-right">
                          {comboInputs.sipStepUpPercent || 10}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Phase 2: SWP Decumulation Inputs */}
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          Phase 2: Retirement SWP
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Age {comboInputs.retirementAge} to {comboInputs.targetAge} (
                          {comboResults.swpYears} years)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      {formatINR(comboInputs.monthlySwp)} / mo
                    </span>
                  </div>

                  {/* Monthly SWP Withdrawal */}
                  <div className="space-y-2 pt-1 border-t border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Desired Monthly Retirement Withdrawal</span>
                      </label>
                      <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                        {formatINR(comboInputs.monthlySwp)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={5000}
                        max={300000}
                        step={1000}
                        value={comboInputs.monthlySwp}
                        onChange={(e) => handleComboSwpMonthlyChange(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={1000}
                          step={1000}
                          value={comboInputs.monthlySwp}
                          onChange={(e) => handleComboSwpMonthlyChange(Number(e.target.value))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[35000, 50000, 60000, 75000, 100000, 150000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleComboSwpMonthlyChange(amt)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            comboInputs.monthlySwp === amt
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          ₹{amt / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expected Post-Retirement Return */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Expected Return in Retirement (p.a.)</span>
                      </label>
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {comboInputs.swpReturnRate}%
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        step={0.5}
                        value={comboInputs.swpReturnRate}
                        onChange={(e) => handleComboSwpReturnChange(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative w-28 shrink-0">
                        <input
                          type="number"
                          min={1}
                          max={25}
                          step={0.5}
                          value={comboInputs.swpReturnRate}
                          onChange={(e) => handleComboSwpReturnChange(Number(e.target.value))}
                          className="w-full pl-2.5 pr-7 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[7, 8, 9, 10].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleComboSwpReturnChange(rate)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            comboInputs.swpReturnRate === rate
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {rate}% (Conservative)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inflation indexed withdrawal */}
                  <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(comboInputs.enableSwpStepUp)}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              combo: {
                                ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
                                enableSwpStepUp: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground">
                            Annual Inflation Indexing
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            Increase withdrawal annually to match living costs
                          </p>
                        </div>
                      </div>
                      {comboInputs.enableSwpStepUp && (
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          +{comboInputs.swpStepUpPercent || 5}% / yr
                        </span>
                      )}
                    </label>

                    {comboInputs.enableSwpStepUp && (
                      <div className="pt-2 border-t border-border/60 flex items-center gap-3">
                        <input
                          type="range"
                          min={2}
                          max={15}
                          step={0.5}
                          value={comboInputs.swpStepUpPercent || 5}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              combo: {
                                ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
                                swpStepUpPercent: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <div className="text-xs font-bold text-foreground w-12 text-right">
                          {comboInputs.swpStepUpPercent || 5}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Assumptions (Tax & Inflation) */}
                <div className="rounded-xl border border-border/80 bg-card">
                  <button
                    type="button"
                    onClick={() => setShowTaxDetails((prev) => !prev)}
                    className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Indian Tax & Inflation Assumptions</span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        Budget 2024 LTCG (12.5%)
                      </span>
                    </div>
                    {showTaxDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showTaxDetails && (
                    <div className="p-3.5 pt-0 border-t border-border/60 space-y-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={comboInputs.enableTax !== false}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              combo: {
                                ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
                                enableTax: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                        />
                        <span className="font-semibold text-foreground">
                          Apply Indian LTCG Tax (12.5%) with ₹1.25 Lakh exemption
                        </span>
                      </label>

                      <div className="pt-2 border-t border-border/60">
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Inflation Discounting Rate (% p.a.)
                        </label>
                        <div className="relative w-32">
                          <input
                            type="number"
                            step={0.5}
                            value={comboInputs.inflationRatePercent ?? 6.0}
                            onChange={(e) =>
                              setData((prev) => ({
                                ...prev,
                                combo: {
                                  ...(prev.combo || DEFAULT_SIP_TO_SWP_INPUTS),
                                  inflationRatePercent: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full pl-2.5 pr-7 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-right"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                            %
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          Used to show purchasing power in today's money
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sustainability Verdict & Results (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Hero Sustainability Verdict Card */}
                <div
                  className={`p-5 sm:p-6 rounded-2xl border-2 shadow-sm space-y-5 ${
                    comboResults.isEnough
                      ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-50/70 via-card to-card dark:from-emerald-950/40 dark:via-card dark:to-card'
                      : 'border-red-500/50 bg-gradient-to-b from-red-50/70 via-card to-card dark:from-red-950/40 dark:via-card dark:to-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        comboResults.isEnough
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {comboResults.isEnough ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>SIP is Sufficient & Sustainable</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>Shortfall: Depletes Early</span>
                        </>
                      )}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        comboResults.isEnough
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200'
                      }`}
                    >
                      Age {comboInputs.currentAge} ➔ {comboInputs.targetAge}
                    </span>
                  </div>

                  {/* Primary Large Number: Leftover Balance at Target Age */}
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                      {comboResults.isEnough
                        ? formatCrore(comboResults.finalRemainingBalance)
                        : '₹0 (Depleted)'}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                      {comboResults.isEnough
                        ? `Leftover Balance at Age ${comboInputs.targetAge} (${formatINR(comboResults.finalRemainingBalance)})`
                        : `Corpus runs out at Age ${comboResults.depletionAge} (leaving ${comboResults.unfundedYears} yrs unfunded)`}
                    </div>
                  </div>

                  {/* Sustainability Message */}
                  {comboResults.isEnough ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>All {comboResults.swpYears} Years of Retirement Fully Funded!</span>
                      </div>
                      <p className="text-[11px] leading-snug">
                        Your ₹{formatINR(comboInputs.monthlySip)}/mo SIP will support ₹
                        {formatINR(comboInputs.monthlySwp)}/mo withdrawals without exhausting your
                        capital, leaving {formatCrore(comboResults.finalRemainingBalance)} as your
                        estate.
                      </p>
                      {comboResults.sustainableMonthlySwp > comboInputs.monthlySwp && (
                        <div className="pt-1 mt-1 border-t border-emerald-500/20 text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
                          💡 You could safely withdraw up to{' '}
                          {formatINR(comboResults.sustainableMonthlySwp)}/month if needed!
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Depletion and Actionable Remedies */
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-3 text-red-900 dark:text-red-200">
                      <div className="space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-red-700 dark:text-red-300">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Corpus Runs Out at Age {comboResults.depletionAge}</span>
                        </div>
                        <p className="text-[11px] leading-snug text-muted-foreground">
                          Your withdrawals outpace growth {comboResults.depletionYearOfSwp} years
                          into retirement, leaving {comboResults.unfundedYears} years of retirement
                          unfunded.
                        </p>
                      </div>

                      {/* Smart Recommendations */}
                      <div className="pt-2 border-t border-red-500/20 space-y-2">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>How to Fix This:</span>
                        </div>

                        {/* Option 1: Increase SIP */}
                        <div className="p-2.5 rounded-lg bg-background/80 border border-border space-y-1.5">
                          <div className="text-[11px] font-bold text-foreground">
                            Option 1: Increase Monthly SIP
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            Invest{' '}
                            <strong className="text-blue-600 dark:text-blue-400">
                              {formatINR(comboResults.requiredMonthlySip)} / mo
                            </strong>{' '}
                            (+
                            {formatINR(
                              Math.max(0, comboResults.requiredMonthlySip - comboInputs.monthlySip)
                            )}
                            ) from Age {comboInputs.currentAge} to sustain ₹
                            {formatINR(comboInputs.monthlySwp)}/mo till Age {comboInputs.targetAge}.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              handleComboSipMonthlyChange(comboResults.requiredMonthlySip)
                            }
                            className="w-full text-center py-1 px-2 rounded-md bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            Apply Recommended SIP ({formatINR(comboResults.requiredMonthlySip)})
                          </button>
                        </div>

                        {/* Option 2: Cap SWP */}
                        <div className="p-2.5 rounded-lg bg-background/80 border border-border space-y-1.5">
                          <div className="text-[11px] font-bold text-foreground">
                            Option 2: Cap Monthly SWP
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            Or keep your current ₹{formatINR(comboInputs.monthlySip)}/mo SIP and
                            limit withdrawals to{' '}
                            <strong className="text-amber-600 dark:text-amber-400">
                              {formatINR(comboResults.sustainableMonthlySwp)} / mo
                            </strong>
                            .
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              handleComboSwpMonthlyChange(comboResults.sustainableMonthlySwp)
                            }
                            className="w-full text-center py-1 px-2 rounded-md bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 transition-colors cursor-pointer"
                          >
                            Apply Sustainable SWP ({formatINR(comboResults.sustainableMonthlySwp)})
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Proportion Bar (SIP Peak Corpus) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${comboInvestedPct}%` }}
                        className="h-full bg-blue-600 transition-all duration-300"
                        title={`Invested: ${comboInvestedPct.toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${comboGainPct}%` }}
                        className="h-full bg-purple-500 transition-all duration-300"
                        title={`SIP Gains: ${comboGainPct.toFixed(1)}%`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        Invested: {comboInvestedPct.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                        Gain at Ret.: {comboGainPct.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* 3 Key Milestones Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/70 text-center">
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        Age {comboInputs.retirementAge} Peak
                      </span>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                        {formatCrore(comboResults.sipAccumulatedCorpus)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        Total Withdrawn
                      </span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        {formatCrore(comboResults.totalSwpWithdrawn)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        Age {comboInputs.targetAge} Left
                      </span>
                      <span
                        className={`text-xs font-black ${
                          comboResults.isEnough
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600'
                        }`}
                      >
                        {comboResults.isEnough
                          ? formatCrore(comboResults.finalRemainingBalance)
                          : '₹0'}
                      </span>
                    </div>
                  </div>

                  {/* Detail Metrics Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">
                        Total SIP Invested (Age {comboInputs.currentAge}–{comboInputs.retirementAge}
                        ):
                      </span>
                      <span className="font-bold text-foreground">
                        {formatINR(comboResults.totalSipInvested)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">
                        Accumulated at Retirement (Age {comboInputs.retirementAge}):
                      </span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">
                        {formatINR(comboResults.sipAccumulatedCorpus)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">
                        Returns Generated During SWP:
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        +{formatINR(comboResults.totalGrowthDuringSwp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">
                        Total Withdrawn Across Retirement:
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {formatINR(comboResults.totalSwpWithdrawn)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="font-bold text-foreground">
                        Final Remaining Corpus (Age {comboInputs.targetAge}):
                      </span>
                      <span
                        className={`font-black text-sm ${comboResults.isEnough ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}
                      >
                        {comboResults.isEnough
                          ? formatINR(comboResults.finalRemainingBalance)
                          : '₹0'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 bg-muted/30 p-2 rounded-lg">
                      <div>
                        <span className="font-bold text-foreground block">
                          Inflation-Adjusted Remaining
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Today's purchasing power @ {comboInputs.inflationRatePercent ?? 6}%
                        </span>
                      </div>
                      <span className="font-extrabold text-foreground text-sm">
                        {formatCrore(comboResults.realRemainingBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy Note */}
                <div className="p-3.5 rounded-xl border border-border bg-card text-xs space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-foreground font-bold">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Automatic Browser Persistence</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Your complete retirement lifecycle inputs and schedules are safely preserved in
                    your browser. Complete confidentiality assured.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Table (Works for SIP, SWP, and Combo) */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                {mode === 'sip'
                  ? 'Year-by-Year Wealth Schedule'
                  : mode === 'swp'
                    ? 'Year-by-Year Withdrawal & Balance Schedule'
                    : `Complete Lifecycle Schedule (Age ${comboInputs.currentAge} to ${comboInputs.targetAge})`}
              </h3>
              <p className="text-xs text-muted-foreground">
                {mode === 'sip'
                  ? 'Track how principal and compounding interest accumulate year over year'
                  : mode === 'swp'
                    ? 'Track monthly cashflows, annual returns earned, and remaining corpus balance'
                    : 'Track monthly investments during accumulation (SIP) followed by monthly payouts and balances in retirement (SWP)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduleTable((prev) => !prev)}
              className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{showScheduleTable ? 'Collapse Schedule' : 'View Full Schedule'}</span>
              {showScheduleTable ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {showScheduleTable && (
            <div className="space-y-3 pt-2">
              {/* Filter Tabs for Combo mode */}
              {mode === 'combo' && (
                <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border max-w-sm text-xs">
                  <button
                    type="button"
                    onClick={() => setScheduleFilter('all')}
                    className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleFilter === 'all'
                        ? 'bg-card text-foreground shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All ({comboResults.totalYears} Yrs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleFilter('sip')}
                    className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleFilter === 'sip'
                        ? 'bg-card text-blue-600 dark:text-blue-400 shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    SIP ({comboResults.sipYears} Yrs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleFilter('swp')}
                    className={`flex-1 py-1 px-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleFilter === 'swp'
                        ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    SWP ({comboResults.swpYears} Yrs)
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                {mode === 'sip' ? (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3 text-right">Monthly (₹)</th>
                        <th className="py-2.5 px-3 text-right">Invested (Year)</th>
                        <th className="py-2.5 px-3 text-right">Cumulative Invested</th>
                        <th className="py-2.5 px-3 text-right">Interest (Year)</th>
                        <th className="py-2.5 px-3 text-right">End Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {sipResults.yearlySchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3 font-bold text-foreground">Year {row.year}</td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatINR(row.monthlyContribution)}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatINR(row.yearlyInvested)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                            {formatINR(row.cumulativeInvested)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            +{formatINR(row.interestEarnedYear)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-foreground">
                            {formatINR(row.endBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : mode === 'swp' ? (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3 text-right">Start Balance</th>
                        <th className="py-2.5 px-3 text-right">Monthly Payout</th>
                        <th className="py-2.5 px-3 text-right">Withdrawn (Year)</th>
                        <th className="py-2.5 px-3 text-right">Returns (Year)</th>
                        <th className="py-2.5 px-3 text-right">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {swpResults.yearlySchedule.map((row) => (
                        <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3 font-bold text-foreground">Year {row.year}</td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatINR(row.startingBalance)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                            {formatINR(row.monthlyWithdrawal)}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatINR(row.yearlyWithdrawn)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            +{formatINR(row.interestEarnedYear)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-foreground">
                            {row.endingBalance > 0 ? formatINR(row.endingBalance) : '₹0 (Depleted)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3">Timeline</th>
                        <th className="py-2.5 px-3">Phase</th>
                        <th className="py-2.5 px-3 text-right">Monthly Flow</th>
                        <th className="py-2.5 px-3 text-right">Annual Cashflow</th>
                        <th className="py-2.5 px-3 text-right">Returns / Growth</th>
                        <th className="py-2.5 px-3 text-right">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredComboSchedule.map((row) => (
                        <tr
                          key={`${row.phase}-${row.year}`}
                          className={`hover:bg-muted/30 transition-colors ${
                            row.isDepleted ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-bold text-foreground">
                            Year {row.year}{' '}
                            <span className="text-[11px] font-medium text-muted-foreground">
                              ({row.age} yrs)
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                row.phase === 'sip'
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {row.phase === 'sip' ? 'SIP Accumulation' : 'SWP Decumulation'}
                            </span>
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-semibold ${
                              row.phase === 'sip'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {row.phase === 'sip'
                              ? `+${formatINR(row.monthlyAmount)}`
                              : `-${formatINR(row.monthlyAmount)}`}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatINR(row.yearlyCashflow)}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            +{formatINR(row.interestEarnedYear)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-foreground">
                            {row.isDepleted ? (
                              <span className="text-red-600 dark:text-red-400">₹0 (Depleted)</span>
                            ) : (
                              formatINR(row.endBalance)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
