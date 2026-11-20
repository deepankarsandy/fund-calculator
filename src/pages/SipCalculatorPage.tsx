import { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Percent,
  Calendar,
  IndianRupee,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowDownCircle,
  AlertTriangle,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { CalculatorsDropdown } from '@/components/ui/CalculatorsDropdown'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  DEFAULT_SIP_INPUTS,
  DEFAULT_SWP_INPUTS,
  calculateSip,
  calculateSwp,
} from '@/domain/calculations/sip'
import {
  StoredSipData,
  getStoredSipInputs,
  saveStoredSipInputs,
  saveStoredSipResults,
} from '@/lib/sipStorage'

interface SipCalculatorPageProps {
  onBackToHome: () => void
  onSelectCalculator?: (id: string) => void
  onViewLogic?: () => void
}

export default function SipCalculatorPage({
  onBackToHome,
  onSelectCalculator,
  onViewLogic,
}: SipCalculatorPageProps) {
  const [data, setData] = useState<StoredSipData>(() => getStoredSipInputs())
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  const [showScheduleTable, setShowScheduleTable] = useState(false)

  const mode = data.mode
  const sipInputs = data.sip
  const swpInputs = data.swp

  // Calculate results reactively
  const sipResults = useMemo(() => calculateSip(sipInputs), [sipInputs])
  const swpResults = useMemo(() => calculateSwp(swpInputs), [swpInputs])

  // Persist both inputs and results to distinct local storage keys
  useEffect(() => {
    saveStoredSipInputs(data)
    saveStoredSipResults({
      mode,
      sip: sipResults,
      swp: swpResults,
    })
  }, [data, mode, sipResults, swpResults])

  const setMode = (newMode: 'sip' | 'swp') => {
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

  const handleReset = () => {
    if (mode === 'sip') {
      setData((prev) => ({ ...prev, sip: DEFAULT_SIP_INPUTS }))
    } else {
      setData((prev) => ({ ...prev, swp: DEFAULT_SWP_INPUTS }))
    }
  }

  // SIP Visual Bar Ratios
  const sipTotal = sipResults.grossCorpus > 0 ? sipResults.grossCorpus : 1
  const sipInvestedPct = Math.min(100, (sipResults.totalInvested / sipTotal) * 100)
  const sipReturnsPct = Math.max(0, 100 - sipInvestedPct)

  // SWP Visual Bar Ratios
  const swpTotalGenerated = swpResults.totalWithdrawn + swpResults.finalBalance || 1
  const swpWithdrawnPct = Math.min(100, (swpResults.totalWithdrawn / swpTotalGenerated) * 100)
  const swpBalancePct = Math.max(0, 100 - swpWithdrawnPct)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="Fund Calculator Home"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              ₹
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-extrabold text-foreground leading-tight tracking-tight">
                Fund Calculator
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">
                Financial Planning Suite · SIP & SWP Plans
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Local & Private</span>
            </div>

            <CalculatorsDropdown
              currentActive="sip"
              onSelectCalculator={onSelectCalculator}
              onViewLogic={onViewLogic}
            />

            <SocialLinks />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-8 w-full">
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
                {mode === 'sip' ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowDownCircle className="w-3.5 h-3.5" />}
                <span>{mode === 'sip' ? 'Systematic Investment Plan' : 'Systematic Withdrawal Plan'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                {mode === 'sip' ? 'SIP Calculator' : 'SWP Calculator'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                {mode === 'sip'
                  ? 'Simulate monthly mutual fund compounding, annual step-up top-ups, and post-Budget 2024 LTCG tax impact.'
                  : 'Model monthly retirement withdrawals from your investment corpus with regular compounding and tax estimates.'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher: SIP vs SWP */}
        <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border max-w-md">
          <button
            type="button"
            onClick={() => setMode('sip')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'swp'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>SWP (Withdrawal)</span>
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
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
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
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
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
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Yr</span>
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
                      <span className="text-xs font-bold text-foreground">Annual Step-Up (Top-Up SIP)</span>
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
                          sip: { ...prev.sip, stepUpPercentage: Number(e.target.value) },
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
                  {showTaxDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                                  sip: { ...prev.sip, taxRatePercent: Number(e.target.value) },
                                }))
                              }
                              className="w-full pl-2.5 pr-7 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-right"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Post Budget 2024: 12.5%</span>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Annual Exemption Limit (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                            <input
                              type="number"
                              step={5000}
                              value={sipInputs.taxExemptionAmount ?? 125000}
                              onChange={(e) =>
                                setData((prev) => ({
                                  ...prev,
                                  sip: { ...prev.sip, taxExemptionAmount: Number(e.target.value) },
                                }))
                              }
                              className="w-full pl-6 pr-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-right"
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">₹1,25,000 exempt p.a.</span>
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
                              sip: { ...prev.sip, inflationRatePercent: Number(e.target.value) },
                            }))
                          }
                          className="w-full pl-2.5 pr-7 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-right"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">Historical Indian CPI ~ 6.0%</span>
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
                    <span className="text-muted-foreground font-medium">Total Invested Amount:</span>
                    <span className="font-bold text-foreground">{formatINR(sipResults.totalInvested)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Estimated Wealth Gain:</span>
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
                      <span className="font-bold text-foreground block">Inflation-Adjusted Value</span>
                      <span className="text-[10px] text-muted-foreground">Today's purchasing power @ {sipInputs.inflationRatePercent ?? 6}%</span>
                    </div>
                    <span className="font-extrabold text-foreground text-sm">
                      {formatCrore(sipResults.realPurchasingPower)}
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
                  Your parameters and calculated breakdowns are stored in your private browser storage. No financial data ever leaves your computer.
                </p>
              </div>
            </div>
          </div>
        ) : (
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
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
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
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
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
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
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
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Yr</span>
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
                          swp: { ...prev.swp, enableStepUpWithdrawal: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground">Annual Withdrawal Increase</span>
                      <p className="text-[11px] text-muted-foreground">
                        Increase monthly withdrawal amount annually to match cost of living inflation
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
                          swp: { ...prev.swp, stepUpWithdrawalPercent: Number(e.target.value) },
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
                      Withdrawals exceeded return compounding at month {swpResults.depletionMonth}. Consider reducing monthly withdrawal or increasing return.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                    <div className="font-bold">Corpus Fully Sustainable</div>
                    <p className="text-[11px] leading-snug">
                      Your balance of {formatCrore(swpResults.finalBalance)} remains intact after funding all withdrawals.
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
                    <span className="font-bold text-foreground">{formatINR(swpResults.initialInvestment)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Growth Generated During Tenure:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(swpResults.totalGrowthEarned)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Final Remaining Balance:</span>
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
                      <span className="font-bold text-foreground block">Inflation-Adjusted Remaining</span>
                      <span className="text-[10px] text-muted-foreground">Today's value @ {swpInputs.inflationRatePercent ?? 6}%</span>
                    </div>
                    <span className="font-extrabold text-foreground text-sm">
                      {formatCrore(swpResults.realPurchasingPowerRemaining)}
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
                  Your withdrawal parameters and balances are persisted locally in your browser. Absolute confidentiality guaranteed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Table (Works for both SIP and SWP) */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                {mode === 'sip' ? 'Year-by-Year Wealth Schedule' : 'Year-by-Year Withdrawal & Balance Schedule'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {mode === 'sip'
                  ? 'Track how principal and compounding interest accumulate year over year'
                  : 'Track monthly cashflows, annual returns earned, and remaining corpus balance'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduleTable((prev) => !prev)}
              className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{showScheduleTable ? 'Collapse Schedule' : 'View Full Schedule'}</span>
              {showScheduleTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showScheduleTable && (
            <div className="overflow-x-auto pt-2">
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
                        <td className="py-2 px-3 text-right font-medium">{formatINR(row.monthlyContribution)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatINR(row.yearlyInvested)}</td>
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
              ) : (
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
                        <td className="py-2 px-3 text-right font-medium">{formatINR(row.startingBalance)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {formatINR(row.monthlyWithdrawal)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">{formatINR(row.yearlyWithdrawn)}</td>
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
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
