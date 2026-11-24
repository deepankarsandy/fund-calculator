import { useState, useMemo, useEffect } from 'react'
import {
  Percent,
  ArrowLeft,
  RotateCcw,
  Calendar,
  IndianRupee,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Lock,
  Building,
  Car,
  UserCheck,
} from 'lucide-react'
import { getUserProfile, deriveLoanEmiInputsFromProfile } from '@/lib/userProfileStorage'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  LoanEmiCalculationInputs,
  LoanTypePreset,
  DEFAULT_LOAN_EMI_INPUTS,
  calculateLoanEmi,
} from '@/domain/calculations/loanEmi'
import {
  getStoredLoanEmiInputs,
  saveStoredLoanEmiInputs,
  saveStoredLoanEmiResults,
} from '@/lib/loanEmiStorage'
import { NumberInput } from '@/components/ui/NumberInput'

interface LoanEmiCalculatorPageProps {
  onBackToHome: () => void
}

export default function LoanEmiCalculatorPage({ onBackToHome }: LoanEmiCalculatorPageProps) {
  const [inputs, setInputs] = useState<LoanEmiCalculationInputs>(() => getStoredLoanEmiInputs())
  const [showPrepayment, setShowPrepayment] = useState(false)
  const [showTaxDetails, setShowTaxDetails] = useState(false)
  const [showScheduleTable, setShowScheduleTable] = useState(false)

  // Calculate results reactively
  const results = useMemo(() => {
    return calculateLoanEmi(inputs)
  }, [inputs])

  // Persist both inputs and results to distinct local storage keys
  useEffect(() => {
    saveStoredLoanEmiInputs(inputs)
    saveStoredLoanEmiResults(results)
  }, [inputs, results])

  const handleAmountChange = (val: number | undefined) => {
    if (val !== undefined) {
      setInputs((prev) => ({ ...prev, loanAmount: val }))
    }
  }

  const handleRateChange = (val: number | undefined) => {
    if (val !== undefined) {
      setInputs((prev) => ({
        ...prev,
        annualInterestRate: val,
      }))
    }
  }

  const handleYearsChange = (val: number | undefined) => {
    if (val !== undefined) {
      setInputs((prev) => ({
        ...prev,
        tenureYears: val,
      }))
    }
  }

  const handleLoanTypePreset = (type: LoanTypePreset) => {
    if (type === 'home') {
      setInputs((prev) => ({
        ...prev,
        loanType: 'home',
        loanAmount: 4000000,
        annualInterestRate: 8.5,
        tenureYears: 20,
        tenureMonths: 0,
      }))
    } else if (type === 'car') {
      setInputs((prev) => ({
        ...prev,
        loanType: 'car',
        loanAmount: 800000,
        annualInterestRate: 9.0,
        tenureYears: 5,
        tenureMonths: 0,
      }))
    } else if (type === 'personal') {
      setInputs((prev) => ({
        ...prev,
        loanType: 'personal',
        loanAmount: 300000,
        annualInterestRate: 13.0,
        tenureYears: 3,
        tenureMonths: 0,
      }))
    }
  }

  const handleReset = () => {
    setInputs(DEFAULT_LOAN_EMI_INPUTS)
  }

  const handleApplyProfileDefaults = () => {
    const profile = getUserProfile()
    const derived = deriveLoanEmiInputsFromProfile(profile)
    setInputs(derived)
  }

  const totalAmount = results.actualTotalPayment > 0 ? results.actualTotalPayment : 1
  const principalPct = Math.min(100, (inputs.loanAmount / totalAmount) * 100)
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
                title="Populate baseline values from your saved User Profile (Loan Rate, Tax Slab, Regime, Inflation)"
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
                <Percent className="w-3.5 h-3.5" />
                <span>Reducing Balance Amortization</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                Loan & Interest EMI Calculator
              </h2>
              <p className="calc-helper-text calc-clean-hide text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                Calculate monthly EMI, prepayment interest savings, and Section 24(b) / 80C tax
                relief for Indian loans.
              </p>
            </div>
          </div>
        </div>

        {/* Loan Type Presets */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border max-w-lg">
          <button
            type="button"
            onClick={() => handleLoanTypePreset('home')}
            className={`flex-1 min-w-28 py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputs.loanType === 'home'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Home Loan</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoanTypePreset('car')}
            className={`flex-1 min-w-28 py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputs.loanType === 'car'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Car Loan</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoanTypePreset('personal')}
            className={`flex-1 min-w-28 py-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              inputs.loanType === 'personal'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Personal Loan</span>
          </button>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Inputs Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Loan Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Principal Loan Amount</span>
                </label>
                <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {formatINR(inputs.loanAmount)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50000}
                  max={10000000}
                  step={50000}
                  value={inputs.loanAmount}
                  onChange={(e) => handleAmountChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="relative w-28 sm:w-32 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    ₹
                  </span>
                  <NumberInput
                    min={10000}
                    max={100000000}
                    step={50000}
                    fallbackValue={10000}
                    value={inputs.loanAmount}
                    onChange={handleAmountChange}
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick preset chips */}
              <div className="calc-presets calc-clean-hide flex flex-wrap gap-1.5 pt-1">
                {[1000000, 2500000, 4000000, 6000000, 8000000, 10000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountChange(amt)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.loanAmount === amt
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ₹{amt >= 10000000 ? `${amt / 10000000} Cr` : `${amt / 100000} Lakh`}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Annual Interest Rate</span>
                </label>
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {inputs.annualInterestRate}% p.a.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={20}
                  step={0.1}
                  value={inputs.annualInterestRate}
                  onChange={(e) => handleRateChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="relative w-28 shrink-0">
                  <NumberInput
                    min={1}
                    max={30}
                    step={0.1}
                    fallbackValue={8.5}
                    value={inputs.annualInterestRate}
                    onChange={handleRateChange}
                    className="w-full pl-2.5 pr-7 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="calc-presets calc-clean-hide flex flex-wrap gap-1.5 pt-1">
                {[8.25, 8.5, 8.75, 9.0, 9.5, 12.0].map((rate) => (
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

            {/* Interest Method Switch: Reducing vs Flat */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground">Interest Method</label>
                {inputs.interestMethod === 'flat' ? (
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Equiv. Reducing APR: ~{results.equivalentReducingApr}%
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Reducing Balance (Standard)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() =>
                    setInputs((prev) => ({
                      ...prev,
                      interestMethod: 'reducing',
                    }))
                  }
                  className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    (inputs.interestMethod || 'reducing') === 'reducing'
                      ? 'bg-card text-foreground shadow-xs border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Reducing Balance
                </button>
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, interestMethod: 'flat' }))}
                  className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    inputs.interestMethod === 'flat'
                      ? 'bg-card text-foreground shadow-xs border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Flat Rate
                </button>
              </div>

              {inputs.interestMethod === 'flat' && (
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800/80 leading-relaxed">
                  <strong>Notice on Flat Rate:</strong> Interest is charged on the initial principal
                  throughout the tenure. A {inputs.annualInterestRate}% flat rate corresponds to an
                  effective ~{results.equivalentReducingApr}% reducing APR.
                </div>
              )}
            </div>

            {/* Loan Tenure */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Loan Tenure</span>
                </label>
                <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {inputs.tenureYears} Years ({inputs.tenureYears * 12} Months)
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={inputs.tenureYears}
                  onChange={(e) => handleYearsChange(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="relative w-28 shrink-0">
                  <NumberInput
                    min={1}
                    max={40}
                    step={1}
                    integerOnly={true}
                    fallbackValue={20}
                    value={inputs.tenureYears}
                    onChange={handleYearsChange}
                    className="w-full pl-2.5 pr-8 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    Yr
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="calc-presets calc-clean-hide flex flex-wrap gap-1.5 pt-1">
                {[3, 5, 10, 15, 20, 25, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleYearsChange(yr)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      inputs.tenureYears === yr
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {yr} Yr
                  </button>
                ))}
              </div>
            </div>

            {/* Prepayment Acceleration Options */}
            <div className="rounded-xl border border-border/80 bg-card">
              <button
                type="button"
                onClick={() => setShowPrepayment((prev) => !prev)}
                className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pre-Payment & Tenure Reduction Calculator</span>
                  {results.interestSaved > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Saves {formatINR(results.interestSaved)}
                    </span>
                  )}
                </div>
                {showPrepayment ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showPrepayment && (
                <div className="p-3.5 pt-0 border-t border-border/60 space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                      <span>Extra Monthly Pre-Payment (₹)</span>
                      <span className="font-bold text-foreground">
                        {formatINR(inputs.monthlyExtraPrepayment)} / mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50000}
                      step={1000}
                      value={inputs.monthlyExtraPrepayment}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          monthlyExtraPrepayment: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                      <span>Annual Lump-Sum Pre-Payment (₹ per year)</span>
                      <span className="font-bold text-foreground">
                        {formatINR(inputs.annualLumpSumPrepayment)} / yr
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={500000}
                      step={10000}
                      value={inputs.annualLumpSumPrepayment}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          annualLumpSumPrepayment: Number(e.target.value),
                        }))
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Indian Tax Deductions Section (Home Loans) */}
            {inputs.loanType === 'home' && (
              <div className="rounded-xl border border-border/80 bg-card">
                <button
                  type="button"
                  onClick={() => setShowTaxDetails((prev) => !prev)}
                  className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Indian Home Loan Tax Deductions</span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                      Sec 24(b) & 80C
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
                        checked={inputs.enableTaxDeduction}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            enableTaxDeduction: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                      <span className="font-semibold text-foreground">
                        Calculate Tax Savings on Principal (80C) & Interest (24b)
                      </span>
                    </label>

                    {inputs.enableTaxDeduction && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Tax Regime
                          </label>
                          <select
                            value={inputs.taxRegime}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                taxRegime: e.target.value as 'old' | 'new',
                              }))
                            }
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                          >
                            <option value="old">Old Tax Regime (Eligible)</option>
                            <option value="new">New Tax Regime (No Deductions)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Your Tax Slab Rate (%)
                          </label>
                          <select
                            value={inputs.taxSlabPercent}
                            onChange={(e) =>
                              setInputs((prev) => ({
                                ...prev,
                                taxSlabPercent: Number(e.target.value),
                              }))
                            }
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-bold"
                          >
                            <option value={20}>20% Slab</option>
                            <option value={30}>30% Slab (Standard)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                      Under the Old Regime, claim up to ₹2 Lakh/yr under Sec 24(b) on interest and
                      up to ₹1.5 Lakh/yr under Sec 80C on principal repayment.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Output Summary & Metrics (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-50/60 via-card to-card dark:from-blue-950/40 dark:via-card dark:to-card shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Monthly Installment (EMI)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {inputs.annualInterestRate}% Reducing
                </span>
              </div>

              {/* Big Monthly EMI Display */}
              <div>
                <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  {formatINR(results.monthlyEmi)}
                  <span className="text-xs font-semibold text-muted-foreground ml-1">/ month</span>
                </div>
                <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                  Total Repayment: {formatCrore(results.actualTotalPayment)} (
                  {formatINR(results.actualTotalPayment)})
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
                    className="h-full bg-amber-500 transition-all duration-300"
                    title={`Interest: ${interestPct.toFixed(1)}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    Principal: {principalPct.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Interest: {interestPct.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Detail Metrics Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-border/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Principal Borrowed:</span>
                  <span className="font-bold text-foreground">{formatINR(inputs.loanAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Total Interest Payable:</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">
                    +{formatINR(results.actualTotalInterest)}
                  </span>
                </div>

                {/* Prepayment Savings Highlight */}
                {results.interestSaved > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1 text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center justify-between font-bold">
                      <span>Interest Saved via Prepayment:</span>
                      <span>{formatINR(results.interestSaved)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Tenure Reduced:</span>
                      <span className="font-bold">
                        {Math.floor(results.tenureMonthsSaved / 12)} Yrs{' '}
                        {results.tenureMonthsSaved % 12} Mos early
                      </span>
                    </div>
                  </div>
                )}

                {/* Tax Savings Display */}
                {results.totalTaxSavings > 0 && (
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                    <span className="font-medium">Total Income Tax Relief (24b + 80C):</span>
                    <span className="font-bold">-{formatINR(results.totalTaxSavings)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="font-bold text-foreground">Net Effective Loan Cost:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                    {formatINR(results.netEffectiveCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 bg-muted/30 p-2 rounded-lg">
                  <div>
                    <span className="font-bold text-foreground block">
                      Inflation-Adjusted Real Cost
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Today's discounted cash outflows @ {inputs.inflationRatePercent}%
                    </span>
                  </div>
                  <span className="font-extrabold text-foreground text-sm">
                    {formatCrore(results.realPurchasingPowerCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="calc-info-box calc-clean-hide p-3.5 rounded-xl border border-border bg-card text-xs space-y-2 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>100% Local & Private In-Browser</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                All amortization schedules and loan parameters remain local to your browser. No debt
                figures are shared or tracked.
              </p>
            </div>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        <div className="calc-schedule-table calc-clean-hide bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Annual Loan Amortization Schedule
              </h3>
              <p className="text-xs text-muted-foreground">
                Track annual principal reduction, interest breakdown, and remaining loan balance
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
                    <th className="py-2.5 px-3 text-right">Opening Balance</th>
                    <th className="py-2.5 px-3 text-right">Principal Paid</th>
                    <th className="py-2.5 px-3 text-right">Interest Paid</th>
                    <th className="py-2.5 px-3 text-right">Total Payment</th>
                    <th className="py-2.5 px-3 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {results.yearlyAmortization.map((row) => (
                    <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3 font-bold text-foreground">Year {row.year}</td>
                      <td className="py-2 px-3 text-right font-medium">
                        {formatINR(row.startingBalance)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                        {formatINR(row.principalPaid + row.extraPrepaymentPaid)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                        {formatINR(row.interestPaid)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {formatINR(row.totalPaymentYear)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-foreground">
                        {formatINR(row.endingBalance)}
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
