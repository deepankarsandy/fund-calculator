import { useState, useMemo, useEffect } from 'react'
import {
  PiggyBank,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Percent,
  Calendar,
  IndianRupee,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { CalculatorsDropdown } from '@/components/ui/CalculatorsDropdown'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  InvestmentCalculationInputs,
  DEFAULT_INVESTMENT_INPUTS,
  calculateInvestment,
} from '@/domain/calculations/investment'
import {
  getStoredInvestmentInputs,
  saveStoredInvestmentInputs,
  saveStoredInvestmentResults,
} from '@/lib/investmentStorage'

interface InvestmentCalculatorPageProps {
  onBackToHome: () => void
  onSelectCalculator?: (id: string) => void
  onViewLogic?: () => void
}

export default function InvestmentCalculatorPage({
  onBackToHome,
  onSelectCalculator,
  onViewLogic,
}: InvestmentCalculatorPageProps) {
  const [inputs, setInputs] = useState<InvestmentCalculationInputs>(() =>
    getStoredInvestmentInputs()
  )
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  const [showScheduleTable, setShowScheduleTable] = useState(false)

  // Calculate results reactively
  const results = useMemo(() => {
    return calculateInvestment(inputs)
  }, [inputs])

  // Persist both inputs and results to distinct local storage keys
  useEffect(() => {
    saveStoredInvestmentInputs(inputs)
    saveStoredInvestmentResults(results)
  }, [inputs, results])

  const handlePrincipalChange = (val: number) => {
    setInputs((prev) => ({ ...prev, initialInvestment: Math.max(0, val) }))
  }

  const handleYearsChange = (val: number) => {
    setInputs((prev) => ({
      ...prev,
      timeHorizonYears: Math.max(1, Math.min(50, val)),
    }))
  }

  const handleSimpleRateChange = (val: number) => {
    setInputs((prev) => ({
      ...prev,
      simpleReturnRate: Math.max(0, Math.min(50, val)),
    }))
  }

  const handleAssetWeightChange = (id: string, weight: number) => {
    setInputs((prev) => ({
      ...prev,
      allocations: prev.allocations.map((a) =>
        a.id === id ? { ...a, allocationPercent: Math.max(0, Math.min(100, weight)) } : a
      ),
    }))
  }

  const handleAssetReturnChange = (id: string, rate: number) => {
    setInputs((prev) => ({
      ...prev,
      allocations: prev.allocations.map((a) =>
        a.id === id ? { ...a, expectedReturnRate: Math.max(0, Math.min(50, rate)) } : a
      ),
    }))
  }

  const handleReset = () => {
    setInputs(DEFAULT_INVESTMENT_INPUTS)
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
                Financial Planning Suite · Investment & Returns
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Local & Private</span>
            </div>

            <CalculatorsDropdown
              currentActive="investment"
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
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Compound Returns & Asset Allocation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                Investment & Returns Calculator
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                Simulate lump-sum compounding across equities, debt, gold, and liquid funds with Indian capital gains taxation.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Toggle Bar */}
        <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border max-w-md">
          <button
            type="button"
            onClick={() => setInputs((prev) => ({ ...prev, mode: 'multi_asset' }))}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputs.mode === 'multi_asset'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Multi-Asset Portfolio</span>
          </button>
          <button
            type="button"
            onClick={() => setInputs((prev) => ({ ...prev, mode: 'simple' }))}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputs.mode === 'simple'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Single Blended Rate</span>
          </button>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Inputs Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Lump-Sum Investment Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Initial Lump-Sum Investment (Principal)</span>
                </label>
                <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {formatINR(inputs.initialInvestment)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10000}
                  max={5000000}
                  step={10000}
                  value={inputs.initialInvestment}
                  onChange={(e) => handlePrincipalChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="relative w-28 sm:w-32 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min={1000}
                    step={10000}
                    value={inputs.initialInvestment}
                    onChange={(e) => handlePrincipalChange(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick preset chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[100000, 250000, 500000, 1000000, 2500000, 5000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePrincipalChange(amt)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.initialInvestment === amt
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ₹{amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`}
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
                  {inputs.timeHorizonYears} Years
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

            {/* Mode: Multi-Asset Breakdown */}
            {inputs.mode === 'multi_asset' ? (
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Asset Classes & Return Expectations</span>
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Allocated: {inputs.allocations.reduce((sum, a) => sum + (a.allocationPercent || 0), 0)}%
                  </span>
                </div>

                <div className="space-y-3">
                  {inputs.allocations.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{asset.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-medium">
                            {formatINR((inputs.initialInvestment * asset.allocationPercent) / 100)}
                          </span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {asset.allocationPercent}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div>
                          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                            <span>Portfolio Share</span>
                            <span>{asset.allocationPercent}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={asset.allocationPercent}
                            onChange={(e) =>
                              handleAssetWeightChange(asset.id, Number(e.target.value))
                            }
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                            <span>Expected Return</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {asset.expectedReturnRate}% p.a.
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={30}
                            step={0.5}
                            value={asset.expectedReturnRate}
                            onChange={(e) =>
                              handleAssetReturnChange(asset.id, Number(e.target.value))
                            }
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Mode: Single Blended Rate */
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Expected Annual Return Rate (p.a.)</span>
                  </label>
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {inputs.simpleReturnRate}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={inputs.simpleReturnRate}
                    onChange={(e) => handleSimpleRateChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="relative w-24 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step={0.5}
                      value={inputs.simpleReturnRate}
                      onChange={(e) => handleSimpleRateChange(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[8, 10, 11, 12, 14, 16].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSimpleRateChange(rate)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        inputs.simpleReturnRate === rate
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {rate}% p.a.
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    Budget 2024 LTCG Rules
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
                      Apply Indian Capital Gains & Slab Tax to Returns
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Equity LTCG Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        value={12.5}
                        disabled
                        className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-xs font-bold"
                      />
                      <span className="text-[10px] text-muted-foreground">Budget 2024: 12.5% (&gt; ₹1.25L)</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Inflation Discounting Rate (% p.a.)
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
                        className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                      />
                      <span className="text-[10px] text-muted-foreground">Historical Indian CPI ~ 6.0%</span>
                    </div>
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
                  {results.blendedReturnRate}% CAGR
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
                    Principal: {investedPct.toFixed(0)}%
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
                  <span className="text-muted-foreground font-medium">Initial Principal Invested:</span>
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
                      <span className="font-medium">Estimated Capital Gains / Slab Tax:</span>
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

            {/* Asset Allocation Breakdown Cards */}
            {inputs.mode === 'multi_asset' && (
              <div className="p-4 rounded-xl border border-border bg-card space-y-2.5 text-xs">
                <span className="font-bold text-foreground block">
                  Asset Class Maturity Breakdown
                </span>
                <div className="space-y-1.5">
                  {results.assetResults.map((asset) => (
                    <div
                      key={asset.assetId}
                      className="flex items-center justify-between py-1 border-b border-border/40 last:border-none"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{asset.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Invested: {formatINR(asset.invested)} · Gain: +{formatINR(asset.gains)}
                        </div>
                      </div>
                      <div className="text-right font-extrabold text-foreground">
                        {formatCrore(asset.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Note */}
            <div className="p-3.5 rounded-xl border border-border bg-card text-xs space-y-2 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Automatic Browser Persistence</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your portfolio allocations and projection models are saved privately in your local browser storage.
              </p>
            </div>
          </div>
        </div>

        {/* Year-by-Year Growth Table */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Year-by-Year Growth Schedule
              </h3>
              <p className="text-xs text-muted-foreground">
                Review compound growth trajectories over your {inputs.timeHorizonYears}-year horizon
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
                    <th className="py-2.5 px-3 text-right">Principal</th>
                    <th className="py-2.5 px-3 text-right">Yearly Gain</th>
                    <th className="py-2.5 px-3 text-right">Cumulative Gain</th>
                    <th className="py-2.5 px-3 text-right">Portfolio Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {results.yearlySchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3 font-bold text-foreground">Year {row.year}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatINR(row.invested)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatINR(row.interestEarnedYear)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                        +{formatINR(row.cumulativeInterest)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-foreground">
                        {formatINR(row.grossBalance)}
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
