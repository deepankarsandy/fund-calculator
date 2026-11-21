import { useState, useMemo, useEffect } from 'react'
import {
  Landmark,
  ArrowLeft,
  RotateCcw,
  Percent,
  Calendar,
  IndianRupee,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  Lock,
} from 'lucide-react'
import { getUserProfile, deriveFdInputsFromProfile } from '@/lib/userProfileStorage'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  FdCalculationInputs,
  FdPayoutType,
  FdCompoundingFrequency,
  DEFAULT_FD_INPUTS,
  calculateFd,
} from '@/domain/calculations/fd'
import { getStoredFdInputs, saveStoredFdInputs, saveStoredFdResults } from '@/lib/fdStorage'

interface FdCalculatorPageProps {
  onBackToHome: () => void
}

export default function FdCalculatorPage({ onBackToHome }: FdCalculatorPageProps) {
  const [inputs, setInputs] = useState<FdCalculationInputs>(() => getStoredFdInputs())
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  const [showScheduleTable, setShowScheduleTable] = useState(false)

  // Calculate results reactively
  const results = useMemo(() => {
    return calculateFd(inputs)
  }, [inputs])

  // Persist both inputs and results to distinct local storage keys
  useEffect(() => {
    saveStoredFdInputs(inputs)
    saveStoredFdResults(results)
  }, [inputs, results])

  const handlePrincipalChange = (val: number) => {
    setInputs((prev) => ({ ...prev, principalAmount: Math.max(0, val) }))
  }

  const handleRateChange = (val: number) => {
    setInputs((prev) => ({
      ...prev,
      annualInterestRate: Math.max(0, Math.min(20, val)),
    }))
  }

  const handleYearsChange = (val: number) => {
    setInputs((prev) => ({
      ...prev,
      tenureYears: Math.max(0, Math.min(30, val)),
    }))
  }

  const handleMonthsChange = (val: number) => {
    setInputs((prev) => ({
      ...prev,
      tenureMonths: Math.max(0, Math.min(11, val)),
    }))
  }

  const handlePayoutTypeChange = (payoutType: FdPayoutType) => {
    setInputs((prev) => ({ ...prev, payoutType }))
  }

  const handleCompoundingChange = (compoundingFrequency: FdCompoundingFrequency) => {
    setInputs((prev) => ({ ...prev, compoundingFrequency }))
  }

  const handleReset = () => {
    setInputs(DEFAULT_FD_INPUTS)
  }

  const handleApplyProfileDefaults = () => {
    const profile = getUserProfile()
    const derived = deriveFdInputsFromProfile(profile)
    setInputs(derived)
  }

  const totalAmount = results.maturityAmount > 0 ? results.maturityAmount : 1
  const principalPct = Math.min(100, (results.principalAmount / totalAmount) * 100)
  const interestPct = Math.max(0, 100 - principalPct)

  return (
    <div className="flex-1 flex flex-col calculator-page">
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
                title="Populate baseline values from your saved User Profile (FD Rate, Senior Citizen, Tax Slab, Inflation)"
              >
                <Percent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
                <Landmark className="w-3.5 h-3.5" />
                <span>Bank Deposit Compounding</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                Fixed Deposit (FD) Calculator
              </h2>
              <p className="calc-helper-text calc-clean-hide text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                Calculate maturity values, quarterly compounding yield, senior citizen rates, and
                Section 194A TDS deductions.
              </p>
            </div>
          </div>
        </div>

        {/* Payout Type Tabs */}
        <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border max-w-lg">
          <button
            type="button"
            onClick={() => handlePayoutTypeChange('cumulative')}
            className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              inputs.payoutType === 'cumulative'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cumulative (Reinvestment)
          </button>
          <button
            type="button"
            onClick={() => handlePayoutTypeChange('quarterly')}
            className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              inputs.payoutType === 'quarterly'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Quarterly Payout
          </button>
          <button
            type="button"
            onClick={() => handlePayoutTypeChange('monthly')}
            className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              inputs.payoutType === 'monthly'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly Payout
          </button>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Inputs Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Principal Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Total Deposit Principal</span>
                </label>
                <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {formatINR(inputs.principalAmount)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10000}
                  max={2500000}
                  step={10000}
                  value={inputs.principalAmount}
                  onChange={(e) => handlePrincipalChange(Number(e.target.value))}
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
                    value={inputs.principalAmount}
                    onChange={(e) => handlePrincipalChange(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick preset chips */}
              <div className="calc-presets calc-clean-hide flex flex-wrap gap-1.5 pt-1">
                {[50000, 100000, 200000, 500000, 1000000, 2500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handlePrincipalChange(amt)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.principalAmount === amt
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ₹{amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate & Senior Citizen Bonus */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Annual Interest Rate</span>
                </label>
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {results.effectiveAnnualRate}% p.a.
                  {inputs.isSeniorCitizen && (
                    <span className="text-[10px] ml-1 font-semibold text-amber-600 dark:text-amber-400">
                      (+0.5% Senior)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={0.1}
                  value={inputs.annualInterestRate}
                  onChange={(e) => handleRateChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="relative w-28 shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={0.1}
                    value={inputs.annualInterestRate}
                    onChange={(e) => handleRateChange(Number(e.target.value))}
                    className="w-full pl-2.5 pr-7 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Senior Citizen Checkbox */}
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/20 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inputs.isSeniorCitizen}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        isSeniorCitizen: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Senior Citizen Deposit (+0.50% extra interest)</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Age 60+
                </span>
              </label>

              {/* Standard Bank Presets */}
              <div className="calc-presets calc-clean-hide flex flex-wrap gap-1.5 pt-1">
                {[6.5, 7.0, 7.25, 7.5, 8.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleRateChange(rate)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.annualInterestRate === rate
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Tenure */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Deposit Tenure</span>
                </label>
                <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {inputs.tenureYears} Years{' '}
                  {inputs.tenureMonths > 0 ? `${inputs.tenureMonths} Months` : ''}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Years</span>
                    <span className="font-bold text-foreground">{inputs.tenureYears} Yrs</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={inputs.tenureYears}
                    onChange={(e) => handleYearsChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Months</span>
                    <span className="font-bold text-foreground">{inputs.tenureMonths} Mos</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={11}
                    step={1}
                    value={inputs.tenureMonths}
                    onChange={(e) => handleMonthsChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="calc-presets calc-clean-hide flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '1 Year', y: 1, m: 0 },
                  { label: '2 Years', y: 2, m: 0 },
                  { label: '3 Years', y: 3, m: 0 },
                  { label: '5 Years (Tax Saver)', y: 5, m: 0 },
                  { label: '10 Years', y: 10, m: 0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      handleYearsChange(item.y)
                      handleMonthsChange(item.m)
                    }}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.tenureYears === item.y && inputs.tenureMonths === item.m
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compounding Frequency */}
            {inputs.payoutType === 'cumulative' && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="text-xs font-bold text-foreground block">
                  Compounding Frequency (Indian RBI Default: Quarterly)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'quarterly', label: 'Quarterly (RBI Std)' },
                    { id: 'monthly', label: 'Monthly' },
                    { id: 'half_yearly', label: 'Half-Yearly' },
                    { id: 'annually', label: 'Annually' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => handleCompoundingChange(freq.id as FdCompoundingFrequency)}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        inputs.compoundingFrequency === freq.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Indian Tax & TDS Section (Collapsible) */}
            <div className="rounded-xl border border-border/80 bg-card">
              <button
                type="button"
                onClick={() => setShowTaxDetails((prev) => !prev)}
                className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Indian TDS & Income Tax Slab Details</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Section 194A (10% TDS)
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
                      checked={inputs.enableTax}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          enableTax: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                    <span className="font-semibold text-foreground">
                      Calculate Income Tax Slab & Section 194A TDS
                    </span>
                  </label>

                  {inputs.enableTax && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Your Income Tax Slab Rate (%)
                        </label>
                        <select
                          value={inputs.taxSlabRatePercent}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              taxSlabRatePercent: Number(e.target.value),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                        >
                          <option value={0}>0% (Nil / Under Exemption)</option>
                          <option value={5}>5% Slab</option>
                          <option value={10}>10% Slab</option>
                          <option value={15}>15% Slab</option>
                          <option value={20}>20% Slab (Standard)</option>
                          <option value={30}>30% Slab (Highest)</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inputs.hasSubmittedForm15G}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                hasSubmittedForm15G: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                          />
                          <span className="text-[11px] font-medium text-foreground">
                            Submitted Form 15G / 15H (Zero TDS)
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/60">
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      General Inflation Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={inputs.inflationRatePercent}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          inflationRatePercent: Number(e.target.value),
                        }))
                      }
                      className="w-32 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground ml-2">
                      Indian CPI benchmark ~ 6.0%
                    </span>
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
                  {inputs.payoutType === 'cumulative' ? 'Maturity Amount' : 'Total Value Received'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {results.effectiveYieldPercent}% Annual Yield
                </span>
              </div>

              {/* Big Maturity Display */}
              <div>
                <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  {formatCrore(
                    inputs.payoutType === 'cumulative'
                      ? results.maturityAmount
                      : results.principalAmount + results.totalInterestEarned
                  )}
                </div>
                <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                  {inputs.payoutType === 'cumulative'
                    ? `Gross Maturity (${formatINR(results.maturityAmount)})`
                    : `Principal (${formatINR(results.principalAmount)}) + Total Interest (${formatINR(results.totalInterestEarned)})`}
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${principalPct}%` }}
                    className="h-full bg-blue-600 transition-all duration-300"
                    title={`Principal: ${principalPct.toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${interestPct}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                    title={`Interest: ${interestPct.toFixed(1)}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    Principal: {principalPct.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Interest: {interestPct.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Detail Metrics Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-border/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Principal Deposited:</span>
                  <span className="font-bold text-foreground">
                    {formatINR(results.principalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Total Interest Earned:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{formatINR(results.totalInterestEarned)}
                  </span>
                </div>

                {/* Non-cumulative payout display */}
                {inputs.payoutType !== 'cumulative' && (
                  <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 p-2 rounded-lg">
                    <span className="font-semibold">
                      Periodic {inputs.payoutType === 'monthly' ? 'Monthly' : 'Quarterly'} Payout:
                    </span>
                    <span className="font-black text-sm">
                      {formatINR(results.periodicPayoutAmount)}
                    </span>
                  </div>
                )}

                {inputs.enableTax && (
                  <>
                    {results.estimatedTds > 0 && (
                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                        <span className="font-medium">Bank TDS Deducted (10% Sec 194A):</span>
                        <span className="font-bold">-{formatINR(results.estimatedTds)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
                      <span className="font-medium">
                        Total Tax Liability ({inputs.taxSlabRatePercent}% slab):
                      </span>
                      <span className="font-bold">-{formatINR(results.estimatedTaxLiability)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="font-bold text-foreground">Net Post-Tax In-Hand:</span>
                      <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                        {formatINR(results.netPostTaxMaturity)}
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
                      Today's purchasing power @ {inputs.inflationRatePercent}%
                    </span>
                  </div>
                  <span className="font-extrabold text-foreground text-sm">
                    {formatCrore(results.realPurchasingPower)}
                  </span>
                </div>
              </div>
            </div>

            {/* Indian Banking Rules Insight Note */}
            <div className="calc-info-box calc-clean-hide p-3.5 rounded-xl border border-border bg-card text-xs space-y-2 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Indian Banking & Privacy Note</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                TDS is deducted by banks under Section 194A if total interest exceeds ₹40,000
                (₹50,000 for Senior Citizens under Sec 80TTB). All calculations remain local to your
                browser.
              </p>
            </div>
          </div>
        </div>

        {/* Year-by-Year Schedule Table */}
        <div className="calc-schedule-table calc-clean-hide bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Year-by-Year Balance & Interest Schedule
              </h3>
              <p className="text-xs text-muted-foreground">
                Review annual interest accumulations across your {inputs.tenureYears}-year deposit
                tenure
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
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3 text-right">Principal</th>
                    <th className="py-2.5 px-3 text-right">Interest (Year)</th>
                    <th className="py-2.5 px-3 text-right">Cumulative Interest</th>
                    <th className="py-2.5 px-3 text-right">End Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {results.yearlySchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3 font-bold text-foreground">Year {row.year}</td>
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
