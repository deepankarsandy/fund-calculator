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
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { CalculatorsDropdown } from '@/components/ui/CalculatorsDropdown'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  SipCalculationInputs,
  DEFAULT_SIP_INPUTS,
  calculateSip,
} from '@/domain/calculations/sip'
import {
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
  const [inputs, setInputs] = useState<SipCalculationInputs>(() => getStoredSipInputs())
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  const [showScheduleTable, setShowScheduleTable] = useState(false)

  // Calculate results reactively
  const results = useMemo(() => {
    return calculateSip(inputs)
  }, [inputs])

  // Persist both inputs and results to distinct local storage keys
  useEffect(() => {
    saveStoredSipInputs(inputs)
    saveStoredSipResults(results)
  }, [inputs, results])

  const handleMonthlyChange = (val: number) => {
    setInputs(prev => ({ ...prev, monthlyInvestment: Math.max(0, val) }))
  }

  const handleReturnChange = (val: number) => {
    setInputs(prev => ({ ...prev, annualReturnRate: Math.max(0, Math.min(50, val)) }))
  }

  const handleYearsChange = (val: number) => {
    setInputs(prev => ({ ...prev, timeHorizonYears: Math.max(1, Math.min(50, val)) }))
  }

  const handleReset = () => {
    setInputs(DEFAULT_SIP_INPUTS)
  }

  // Ratio percentages for the visual bar
  const totalAmount = results.grossCorpus > 0 ? results.grossCorpus : 1
  const investedPct = Math.min(100, (results.totalInvested / totalAmount) * 100)
  const returnsPct = Math.max(0, 100 - investedPct)

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
                Financial Planning Suite · SIP Compounding
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Local & Private</span>
            </div>

            <CalculatorsDropdown
              currentActive="fund"
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
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Systematic Investment Plan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                SIP Calculator
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                Simulate monthly mutual fund compounding, annual step-up top-ups, and post-Budget 2024 LTCG tax impact.
              </p>
            </div>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Inputs Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Monthly Investment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Monthly Investment Amount</span>
                </label>
                <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {formatINR(inputs.monthlyInvestment)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={500}
                  max={200000}
                  step={500}
                  value={inputs.monthlyInvestment}
                  onChange={(e) => handleMonthlyChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="relative w-28 sm:w-32 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={inputs.monthlyInvestment}
                    onChange={(e) => handleMonthlyChange(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick preset chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[2500, 5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleMonthlyChange(amt)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.monthlyInvestment === amt
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
                  {inputs.annualReturnRate}%
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={0.5}
                  value={inputs.annualReturnRate}
                  onChange={(e) => handleReturnChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="relative w-24 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={0.5}
                    value={inputs.annualReturnRate}
                    onChange={(e) => handleReturnChange(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    onClick={() => handleReturnChange(item.rate)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.annualReturnRate === item.rate
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
                  {inputs.timeHorizonYears} Years ({inputs.timeHorizonYears * 12} Months)
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={inputs.timeHorizonYears}
                  onChange={(e) => handleYearsChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="relative w-24 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={1}
                    value={inputs.timeHorizonYears}
                    onChange={(e) => handleYearsChange(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    onClick={() => handleYearsChange(yr)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.timeHorizonYears === yr
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
                    checked={Boolean(inputs.enableStepUp)}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, enableStepUp: e.target.checked }))
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
                {inputs.enableStepUp && (
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    +{inputs.stepUpPercentage}% / yr
                  </span>
                )}
              </label>

              {inputs.enableStepUp && (
                <div className="pt-2 border-t border-border/60 flex items-center gap-3">
                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={1}
                    value={inputs.stepUpPercentage || 10}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        stepUpPercentage: Number(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-xs font-bold text-foreground w-12 text-right">
                    {inputs.stepUpPercentage}%
                  </div>
                </div>
              )}
            </div>

            {/* Indian Tax & Inflation Section (Collapsible) */}
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
                      checked={inputs.enableTax !== false}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, enableTax: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                    <span className="font-semibold text-foreground">
                      Apply Indian Mutual Fund Capital Gains Tax (LTCG)
                    </span>
                  </label>

                  {inputs.enableTax !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          LTCG Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          step={0.5}
                          value={inputs.taxRatePercent ?? 12.5}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              taxRatePercent: Number(e.target.value),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                        />
                        <span className="text-[10px] text-muted-foreground">Post Budget 2024: 12.5%</span>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Annual Exemption Limit (₹)
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={inputs.taxExemptionAmount ?? 125000}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              taxExemptionAmount: Number(e.target.value),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                        />
                        <span className="text-[10px] text-muted-foreground">₹1,25,000 exempt p.a.</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/60">
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Inflation Rate for Real Value Discounting (% p.a.)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={inputs.inflationRatePercent ?? 6.0}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          inflationRatePercent: Number(e.target.value),
                        }))
                      }
                      className="w-32 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground ml-2">Historical Indian CPI ~ 6.0%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output Summary & Metrics (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-50/60 via-card to-card dark:from-blue-950/40 dark:via-card dark:to-card shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Projected Wealth
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {inputs.timeHorizonYears} Years Compounding
                </span>
              </div>

              {/* Big Corpus Display */}
              <div>
                <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  {formatCrore(results.grossCorpus)}
                </div>
                <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                  Gross Corpus ({formatINR(results.grossCorpus)})
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${investedPct}%` }}
                    className="h-full bg-blue-600 transition-all duration-300"
                    title={`Invested: ${investedPct.toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${returnsPct}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                    title={`Returns: ${returnsPct.toFixed(1)}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    Invested: {investedPct.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Gain: {returnsPct.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Detail Metrics Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-border/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Total Invested Amount:</span>
                  <span className="font-bold text-foreground">{formatINR(results.totalInvested)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Estimated Wealth Gain:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{formatINR(results.estimatedReturns)}
                  </span>
                </div>

                {inputs.enableTax !== false && (
                  <>
                    <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                      <span className="font-medium">Estimated LTCG Tax (12.5%):</span>
                      <span className="font-bold">-{formatINR(results.estimatedTax)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="font-bold text-foreground">Post-Tax In-Hand Corpus:</span>
                      <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                        {formatINR(results.netCorpus)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/50 bg-muted/30 p-2 rounded-lg">
                  <div>
                    <span className="font-bold text-foreground block">Inflation-Adjusted Value</span>
                    <span className="text-[10px] text-muted-foreground">Today's purchasing power @ {inputs.inflationRatePercent ?? 6}%</span>
                  </div>
                  <span className="font-extrabold text-foreground text-sm">
                    {formatCrore(results.realPurchasingPower)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Privacy Note */}
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

        {/* Year-by-Year Schedule Table */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Year-by-Year Growth Schedule
              </h3>
              <p className="text-xs text-muted-foreground">
                Track how principal and compounding interest accumulate year over year
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
                  {results.yearlySchedule.map((row) => (
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
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
