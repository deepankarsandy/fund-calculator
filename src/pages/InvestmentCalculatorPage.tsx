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
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { CalculatorsDropdown } from '@/components/ui/CalculatorsDropdown'
import { ProfileHeaderButton } from '@/components/profile/ProfileHeaderButton'
import { getUserProfile, deriveInvestmentInputsFromProfile } from '@/lib/userProfileStorage'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  InvestmentCalculationInputs,
  DEFAULT_INVESTMENT_INPUTS,
  calculateInvestment,
} from '@/domain/calculations/investment'
import {
  CustomPlanInputs,
  DEFAULT_CUSTOM_PLAN_INPUTS,
  calculateCustomPlan,
} from '@/domain/calculations/customPlan'
import {
  InvestmentTab,
  getStoredInvestmentInputs,
  saveStoredInvestmentInputs,
  saveStoredInvestmentResults,
  getStoredCustomPlanInputs,
  saveStoredCustomPlanInputs,
  saveStoredCustomPlanResults,
  getStoredInvestmentTab,
  saveStoredInvestmentTab,
} from '@/lib/investmentStorage'
import { CustomPlanCalculator } from '@/components/investment/CustomPlanCalculator'

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
  const [activeTab, setActiveTab] = useState<InvestmentTab>(() => getStoredInvestmentTab())
  const [inputs, setInputs] = useState<InvestmentCalculationInputs>(() =>
    getStoredInvestmentInputs()
  )
  const [customPlanInputs, setCustomPlanInputs] = useState<CustomPlanInputs>(() =>
    getStoredCustomPlanInputs()
  )

  const [showScheduleTable, setShowScheduleTable] = useState(false)

  // Calculate results reactively
  const results = useMemo(() => {
    return calculateInvestment(inputs)
  }, [inputs])

  const customPlanResults = useMemo(() => {
    return calculateCustomPlan(customPlanInputs)
  }, [customPlanInputs])

  // Persist standard investment inputs and results
  useEffect(() => {
    saveStoredInvestmentInputs(inputs)
    saveStoredInvestmentResults(results)
  }, [inputs, results])

  // Persist custom plan inputs and results
  useEffect(() => {
    saveStoredCustomPlanInputs(customPlanInputs)
    saveStoredCustomPlanResults(customPlanResults)
  }, [customPlanInputs, customPlanResults])

  // Persist active tab selection
  useEffect(() => {
    saveStoredInvestmentTab(activeTab)
  }, [activeTab])

  const handleTabChange = (tab: InvestmentTab) => {
    setActiveTab(tab)
    if (tab === 'multi_asset' || tab === 'simple') {
      setInputs((prev) => ({ ...prev, mode: tab }))
    }
  }

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
    if (activeTab === 'custom_plan') {
      setCustomPlanInputs(DEFAULT_CUSTOM_PLAN_INPUTS)
    } else {
      setInputs(DEFAULT_INVESTMENT_INPUTS)
    }
  }

  const handleApplyProfileDefaults = () => {
    const profile = getUserProfile()
    const derived = deriveInvestmentInputsFromProfile(profile)
    setInputs(derived)
  }

  // Ratio percentages for the visual bar (standard investment)
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
                Financial Planning Suite · Investment & Policy Returns
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

            {/* Profile Button - Right Most Side */}
            <ProfileHeaderButton />
          </div>
        </div>
      </header>

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
                title="Populate baseline values from your saved User Profile (Corpus, Horizon, LTCG, Inflation)"
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
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${
                  activeTab === "custom_plan"
                    ? "bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                    : "bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                }`}
              >
                {activeTab === "custom_plan" ? (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Policy & Custom Cash Flow XIRR</span>
                  </>
                ) : (
                  <>
                    <PiggyBank className="w-3.5 h-3.5" />
                    <span>Compound Returns & Asset Allocation</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                {activeTab === "custom_plan"
                  ? "Custom Plan & Policy XIRR Calculator"
                  : "Investment & Returns Calculator"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                {activeTab === "custom_plan"
                  ? "Analyze insurance policies, guaranteed income plans, and deferred annuities. Uncover the real annualized XIRR and inflation-adjusted purchasing power."
                  : "Simulate lump-sum compounding across equities, debt, gold, and liquid funds with Indian capital gains taxation."}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Multi-Asset vs Simple Rate vs Custom Policy XIRR */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border max-w-2xl">
          <button
            type="button"
            onClick={() => handleTabChange("multi_asset")}
            className={`flex-1 min-w-[130px] py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "multi_asset"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Multi-Asset Portfolio</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("simple")}
            className={`flex-1 min-w-[120px] py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "simple"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Single Blended Rate</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("custom_plan")}
            className={`flex-1 min-w-[170px] py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "custom_plan"
                ? "bg-card text-purple-700 dark:text-purple-300 shadow-xs border border-purple-500/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Custom Plan / Policy (XIRR)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 3: CUSTOM PLAN / POLICY (XIRR)                                        */}
        {/* ========================================================================= */}
        {activeTab === "custom_plan" ? (
          <CustomPlanCalculator
            inputs={customPlanInputs}
            onChange={setCustomPlanInputs}
            results={customPlanResults}
          />
        ) : (
          /* ========================================================================= */
          /* TABS 1 & 2: STANDARD LUMP-SUM INVESTMENT CALCULATOR                        */
          /* ========================================================================= */
          <>
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
                      onChange={(e) =>
                        handlePrincipalChange(Number(e.target.value))
                      }
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="relative w-28 sm:w-32 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={1000}
                        step={10000}
                        value={inputs.initialInvestment}
                        onChange={(e) =>
                          handlePrincipalChange(Number(e.target.value))
                        }
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Quick preset chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[100000, 250000, 500000, 1000000, 2500000, 5000000].map(
                      (amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handlePrincipalChange(amt)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            inputs.initialInvestment === amt
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          ₹
                          {amt >= 100000
                            ? `${amt / 100000} Lakh`
                            : `${amt / 1000}k`}
                        </button>
                      ),
                    )}
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
                      onChange={(e) =>
                        handleYearsChange(Number(e.target.value))
                      }
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="relative w-28 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        step={1}
                        value={inputs.timeHorizonYears}
                        onChange={(e) =>
                          handleYearsChange(Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[3, 5, 7, 10, 15, 20, 25, 30].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => handleYearsChange(yr)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          inputs.timeHorizonYears === yr
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {yr} Yrs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode: Multi-Asset Breakdown */}
                {inputs.mode === "multi_asset" ? (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Asset Classes & Return Expectations</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Total:{" "}
                        <strong className="text-foreground">
                          {inputs.allocations.reduce(
                            (acc, a) => acc + (a.allocationPercent || 0),
                            0,
                          )}
                          %
                        </strong>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {inputs.allocations.map((asset) => (
                        <div
                          key={asset.id}
                          className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              {asset.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-medium">
                                Share:{" "}
                                <strong className="text-foreground">
                                  {asset.allocationPercent}%
                                </strong>
                              </span>
                              <span className="text-muted-foreground font-medium">
                                Return:{" "}
                                <strong className="text-emerald-600 dark:text-emerald-400">
                                  {asset.expectedReturnRate}%
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 items-center">
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-1">
                                Allocation %
                              </label>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={asset.allocationPercent}
                                onChange={(e) =>
                                  handleAssetWeightChange(
                                    asset.id,
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-1">
                                Expected Return (% p.a.)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={40}
                                step={0.5}
                                value={asset.expectedReturnRate}
                                onChange={(e) =>
                                  handleAssetReturnChange(
                                    asset.id,
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full px-2 py-1 text-xs font-bold bg-background border border-border rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Mode: Simple Blended Return Rate */
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Expected Blended Rate of Return</span>
                      </label>
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {inputs.simpleReturnRate}% p.a.
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={30}
                        step={0.5}
                        value={inputs.simpleReturnRate}
                        onChange={(e) =>
                          handleSimpleRateChange(Number(e.target.value))
                        }
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative w-28 shrink-0">
                        <input
                          type="number"
                          min={1}
                          max={40}
                          step={0.5}
                          value={inputs.simpleReturnRate}
                          onChange={(e) =>
                            handleSimpleRateChange(Number(e.target.value))
                          }
                          className="w-full px-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[7.0, 8.5, 10.0, 11.5, 12.0, 14.0, 15.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleSimpleRateChange(rate)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            inputs.simpleReturnRate === rate
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inflation & Indian Tax Settings */}
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Long-Term Inflation Assumption</span>
                    </label>
                    <span className="text-xs font-extrabold text-foreground">
                      {inputs.inflationRatePercent ?? 6}% p.a.
                    </span>
                  </div>

                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={0.5}
                    value={inputs.inflationRatePercent ?? 6}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        inflationRatePercent: Number(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  {/* Tax Deduction Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-foreground block">
                        Apply Indian Capital Gains Taxation
                      </label>
                      <p className="text-[11px] text-muted-foreground">
                        Includes ₹1.25L equity exemption and 12.5% LTCG / slab
                        rates
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={inputs.enableTax !== false}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          enableTax: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Results & Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Expected Maturity Corpus
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                        {formatCrore(results.grossCorpus)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        ({inputs.timeHorizonYears} Yrs)
                      </span>
                    </div>
                  </div>

                  {/* Ratio bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-blue-600 dark:text-blue-400">
                        Principal: {investedPct.toFixed(0)}%
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Returns: {returnsPct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${investedPct}%` }}
                        title="Invested Principal"
                      />
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${returnsPct}%` }}
                        title="Compound Growth"
                      />
                    </div>
                  </div>

                  {/* Results Breakdown Table */}
                  <div className="space-y-3 pt-2 text-xs border-t border-border/70">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground font-medium">
                        Total Invested (Principal)
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {formatINR(results.totalInvested)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground font-medium">
                        Estimated Wealth Gain
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        +{formatINR(results.estimatedReturns)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground font-medium">
                        Blended Annual Return (CAGR)
                      </span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        {results.blendedReturnRate}% p.a.
                      </span>
                    </div>

                    {inputs.enableTax !== false && (
                      <>
                        <div className="flex items-center justify-between py-1 text-amber-700 dark:text-amber-400">
                          <span className="font-medium">
                            Estimated Capital Gains Tax
                          </span>
                          <span className="font-bold text-sm">
                            -{formatINR(results.estimatedTax)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 font-bold text-foreground">
                          <span>Post-Tax Net Maturity Corpus</span>
                          <span className="font-extrabold text-sm text-foreground">
                            {formatINR(results.netCorpus)}
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
                          Today's purchasing power @{" "}
                          {inputs.inflationRatePercent ?? 6}%
                        </span>
                      </div>
                      <span className="font-extrabold text-foreground text-sm">
                        {formatCrore(results.realPurchasingPower)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Asset Allocation Breakdown Cards */}
                {inputs.mode === "multi_asset" && (
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
                            <div className="font-semibold text-foreground">
                              {asset.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Invested: {formatINR(asset.invested)} · Gain: +
                              {formatINR(asset.gains)}
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

                {/* Nudge to Custom Plan (XIRR) Mode */}
                <button
                  type="button"
                  onClick={() => handleTabChange("custom_plan")}
                  className="w-full p-4 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/30 text-left hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Analyzing an Insurance or Fixed Income Plan?</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Calculate actual annualized XIRR returns and
                    inflation-adjusted purchasing power for staggered insurance
                    policies and deferred annuities.
                  </p>
                </button>

                {/* Privacy Note */}
                <div className="p-3.5 rounded-xl border border-border bg-card text-xs space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-foreground font-bold">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Automatic Browser Persistence</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Your portfolio allocations and projection models are saved
                    privately in your local browser storage.
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
                    Review compound growth trajectories over your{" "}
                    {inputs.timeHorizonYears}-year horizon
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScheduleTable((prev) => !prev)}
                  className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>
                    {showScheduleTable
                      ? "Collapse Schedule"
                      : "View Full Schedule"}
                  </span>
                  {showScheduleTable ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
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
                        <th className="py-2.5 px-3 text-right">
                          Cumulative Gain
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Portfolio Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {results.yearlySchedule.map((row) => (
                        <tr
                          key={row.year}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-2 px-3 font-bold text-foreground">
                            Year {row.year}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatINR(row.invested)}
                          </td>
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
          </>
        )}
      </main>
    </div>
  );
}
