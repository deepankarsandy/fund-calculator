import React, { useState } from 'react'
import {
  IndianRupee,
  Percent,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  SlidersHorizontal,
  Plus,
  Trash2,
  BarChart2,
} from 'lucide-react'
import { formatINR, formatCrore } from '@/lib/currency'
import {
  CustomPlanInputs,
  CustomPlanResult,
  PLAN_PRESETS,
  DEFAULT_CUSTOM_PLAN_INPUTS,
  buildScheduleFromInputs,
} from '@/domain/calculations/customPlan'
import { NumberInput } from '@/components/ui/NumberInput'

interface CustomPlanCalculatorProps {
  inputs: CustomPlanInputs
  onChange: (inputs: CustomPlanInputs) => void
  results: CustomPlanResult
}

export const CustomPlanCalculator: React.FC<CustomPlanCalculatorProps> = ({
  inputs,
  onChange,
  results,
}) => {
  const [copied, setCopied] = useState(false)
  const [showFullSchedule, setShowFullSchedule] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('guaranteed_income')

  // Helper updates
  const updateInputs = (patch: Partial<CustomPlanInputs>) => {
    onChange({
      ...inputs,
      ...patch,
    })
  }

  const handleApplyPreset = (presetId: string) => {
    const preset = PLAN_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setSelectedPresetId(presetId)
    onChange({
      ...DEFAULT_CUSTOM_PLAN_INPUTS,
      ...preset.inputs,
    })
  }

  const handleReset = () => {
    setSelectedPresetId('guaranteed_income')
    onChange(DEFAULT_CUSTOM_PLAN_INPUTS)
  }

  // Schedule customization handlers
  const handleToggleCustomSchedule = () => {
    if (!inputs.useCustomSchedule) {
      // Transition from structured to custom: initialize schedule from current inputs
      const currentBuilt = buildScheduleFromInputs(inputs)
      updateInputs({
        useCustomSchedule: true,
        customSchedule: currentBuilt,
      })
    } else {
      updateInputs({
        useCustomSchedule: false,
      })
    }
  }

  const handleCustomRowChange = (
    year: number,
    field: 'invested' | 'received' | 'note',
    value: number | string
  ) => {
    const schedule = (
      inputs.customSchedule && inputs.customSchedule.length > 0
        ? inputs.customSchedule
        : buildScheduleFromInputs(inputs)
    ).map((row) => {
      if (row.year === year) {
        return {
          ...row,
          [field]: field === 'note' ? value : Math.max(0, Number(value) || 0),
        }
      }
      return row
    })
    updateInputs({
      useCustomSchedule: true,
      customSchedule: schedule,
    })
  }

  const handleAddYear = () => {
    const schedule = (
      inputs.customSchedule && inputs.customSchedule.length > 0
        ? inputs.customSchedule
        : buildScheduleFromInputs(inputs)
    ).slice()
    const nextYear = schedule.length > 0 ? schedule[schedule.length - 1].year + 1 : 1
    schedule.push({
      year: nextYear,
      invested: 0,
      received: 0,
      note: `Year ${nextYear}`,
    })
    updateInputs({
      useCustomSchedule: true,
      customSchedule: schedule,
    })
  }

  const handleRemoveYear = (year: number) => {
    const schedule = (
      inputs.customSchedule && inputs.customSchedule.length > 0
        ? inputs.customSchedule
        : buildScheduleFromInputs(inputs)
    ).filter((r) => r.year !== year)
    updateInputs({
      useCustomSchedule: true,
      customSchedule: schedule,
    })
  }

  const handleCopyReport = () => {
    const text = `
=== ${inputs.planName || 'Custom Financial Plan'} Analysis Report ===
• Actual Annualized XIRR: ${results.xirrPercent}% p.a.
• Real Return (Inflation Adjusted): ${results.realXirrPercent}% p.a. (Inflation: ${inputs.inflationRatePercent}%)
• Total Invested (Premiums): ${formatINR(results.totalInvested)}
• Total Nominal Received: ${formatINR(results.totalReceived)} (${results.gainMultiplier}x multiplier)
• Net Nominal Profit: +${formatINR(results.netProfit)}
• Real Purchasing Power of Returns: ${formatINR(results.totalRealPurchasingPower)}
• Purchasing Power Eroded by Inflation: ${results.purchasingPowerLossPercent}%
• PPF Alternative (7.1%): ${formatINR(results.benchmarkPpfCorpus)}
• Nifty Index Alternative (12%): ${formatINR(results.benchmarkEquityCorpus)}
Verdict: ${results.verdict.tag}
${results.verdict.summary}
${results.verdict.explanation}
Generated via Fund Calculator (100% Private & Open Source)
`.trim()

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handlePrint = () => {
    window.print()
  }

  // Derived display stats
  const investEndYear =
    (inputs.investmentStartYear || 1) + (inputs.investmentDurationYears || 1) - 1
  const payoutEndYear =
    inputs.payoutType === 'lumpsum_only'
      ? inputs.payoutStartYear
      : (inputs.payoutStartYear || 1) + (inputs.payoutDurationYears || 1) - 1

  return (
    <div className="space-y-8">
      {/* Plan Presets Carousel / Quick Picks */}
      <div className="calc-presets calc-clean-hide bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-foreground">
              Quick Policy & Plan Presets
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Click any template to auto-populate cash flows
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PLAN_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 shadow-xs ring-1 ring-purple-500'
                    : 'border-border bg-card/60 hover:bg-muted/50 hover:border-purple-300 dark:hover:border-purple-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground leading-snug">{preset.name}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {preset.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Form & Live Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Inputs (7 Columns) */}
        <div className="lg:col-span-7 space-y-6 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
          {/* Header of Form */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">Plan Setup & Cash Flows</h3>
              <p className="text-[11px] text-muted-foreground">
                Configure your annual investments and payout timeline
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Plan Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-foreground">Plan / Policy Name</label>
              <input
                type="text"
                value={inputs.planName}
                onChange={(e) => updateInputs({ planName: e.target.value })}
                placeholder="e.g. Guaranteed Income Life Plan"
                className="w-full px-3 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Starting Age</label>
              <NumberInput
                min={0}
                max={90}
                integerOnly={true}
                fallbackValue={30}
                value={inputs.startAge}
                onChange={(val) => updateInputs({ startAge: val ?? 30 })}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: INVESTMENT PHASE (OUTFLOWS)                                     */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2 border-t border-border/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Investment Phase (Cash Outflows)
                </h4>
              </div>

              {/* Mode Toggle: Annual vs Total */}
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/50 text-[11px]">
                <button
                  type="button"
                  onClick={() => updateInputs({ investmentInputType: 'per_year' })}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    inputs.investmentInputType === 'per_year'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Per Year
                </button>
                <button
                  type="button"
                  onClick={() => updateInputs({ investmentInputType: 'total' })}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    inputs.investmentInputType === 'total'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Total Investment
                </button>
              </div>
            </div>

            {inputs.investmentInputType === 'per_year' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Annual Investment (Premium Paid / Year)</span>
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {formatINR(inputs.annualInvestment)}/yr
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10000}
                    max={2000000}
                    step={10000}
                    value={inputs.annualInvestment}
                    onChange={(e) => updateInputs({ annualInvestment: Number(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <NumberInput
                      min={1000}
                      step={5000}
                      fallbackValue={1000}
                      value={inputs.annualInvestment}
                      onChange={(val) => updateInputs({ annualInvestment: val ?? 1000 })}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="calc-presets calc-clean-hide flex flex-wrap gap-1.5 pt-1">
                  {[50000, 100000, 150000, 200000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => updateInputs({ annualInvestment: amt })}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        inputs.annualInvestment === amt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Total Investment (Distributed Evenly Across Tenure)</span>
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {formatINR(inputs.totalInvestment)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={50000}
                    max={20000000}
                    step={50000}
                    value={inputs.totalInvestment}
                    onChange={(e) => updateInputs({ totalInvestment: Number(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <NumberInput
                      min={10000}
                      step={50000}
                      fallbackValue={10000}
                      value={inputs.totalInvestment}
                      onChange={(val) => updateInputs({ totalInvestment: val ?? 10000 })}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Investment Duration & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Investment Duration</span>
                  </label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {inputs.investmentDurationYears} Years (Yr {inputs.investmentStartYear || 1}–
                    {investEndYear})
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={inputs.investmentDurationYears}
                  onChange={(e) =>
                    updateInputs({
                      investmentDurationYears: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Payment Timing</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateInputs({ investmentTiming: 'start_of_year' })}
                    className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                      inputs.investmentTiming === 'start_of_year'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Start of Year (Policy Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateInputs({ investmentTiming: 'end_of_year' })}
                    className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                      inputs.investmentTiming === 'end_of_year'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    End of Year
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: RETURN / PAYOUT PHASE (INFLOWS)                                 */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-4 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Return & Payout Phase (Cash Inflows)
                </h4>
              </div>

              {/* Payout Structure Selection */}
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/50 text-[11px]">
                <button
                  type="button"
                  onClick={() => updateInputs({ payoutType: 'regular_and_lumpsum' })}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    inputs.payoutType === 'regular_and_lumpsum'
                      ? 'bg-card text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Income + Lump Sum
                </button>
                <button
                  type="button"
                  onClick={() => updateInputs({ payoutType: 'regular_only' })}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    inputs.payoutType === 'regular_only'
                      ? 'bg-card text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Income Only
                </button>
                <button
                  type="button"
                  onClick={() => updateInputs({ payoutType: 'lumpsum_only' })}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    inputs.payoutType === 'lumpsum_only'
                      ? 'bg-card text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Single Lump Sum
                </button>
              </div>
            </div>

            {/* Payout Start Year & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Payout Begins At</label>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    Year {inputs.payoutStartYear} (Age{' '}
                    {(inputs.startAge || 30) + inputs.payoutStartYear - 1})
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={inputs.payoutStartYear}
                  onChange={(e) =>
                    updateInputs({ payoutStartYear: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <p className="text-[10px] text-muted-foreground">
                  {inputs.payoutStartYear > investEndYear
                    ? `Gap of ${inputs.payoutStartYear - investEndYear - 1} waiting year(s) after payment completes.`
                    : 'Payout starts immediately or overlaps with investment.'}
                </p>
              </div>

              {inputs.payoutType !== 'lumpsum_only' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Payout Duration</label>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {inputs.payoutDurationYears} Years (Till Yr {payoutEndYear})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={inputs.payoutDurationYears}
                    onChange={(e) =>
                      updateInputs({
                        payoutDurationYears: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Receives payout annually from Year {inputs.payoutStartYear} to {payoutEndYear}.
                  </p>
                </div>
              )}
            </div>

            {/* Annual Payout Amount (if applicable) */}
            {inputs.payoutType !== 'lumpsum_only' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Annual Income Received Each Year</span>
                  </label>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatINR(inputs.annualPayout)}/yr
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10000}
                    max={3000000}
                    step={10000}
                    value={inputs.annualPayout}
                    onChange={(e) => updateInputs({ annualPayout: Number(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <NumberInput
                      min={1000}
                      step={10000}
                      fallbackValue={1000}
                      value={inputs.annualPayout}
                      onChange={(val) => updateInputs({ annualPayout: val ?? 1000 })}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[60000, 100000, 120000, 150000, 200000, 300000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => updateInputs({ annualPayout: amt })}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        inputs.annualPayout === amt
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Maturity Lump Sum (if applicable) */}
            {(inputs.payoutType === 'lumpsum_only' ||
              inputs.payoutType === 'regular_and_lumpsum') && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>
                      {inputs.payoutType === 'lumpsum_only'
                        ? `Maturity Lump Sum at Year ${inputs.payoutStartYear}`
                        : `Final Maturity Return of Premium / Lump Sum at Year ${payoutEndYear}`}
                    </span>
                  </label>
                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                    {formatINR(inputs.maturityLumpSum)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={20000000}
                    step={100000}
                    value={inputs.maturityLumpSum}
                    onChange={(e) => updateInputs({ maturityLumpSum: Number(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ₹
                    </span>
                    <NumberInput
                      min={0}
                      step={50000}
                      fallbackValue={0}
                      value={inputs.maturityLumpSum}
                      onChange={(val) => updateInputs({ maturityLumpSum: val ?? 0 })}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 500000, 1000000, 2000000, 3600000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => updateInputs({ maturityLumpSum: amt })}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        inputs.maturityLumpSum === amt
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {amt === 0
                        ? 'None (₹0)'
                        : `₹${amt >= 10000000 ? `${amt / 10000000} Cr` : `${amt / 100000}L`}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: INFLATION & BENCHMARKS                                         */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-4 border-t border-border/70">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                Inflation & Benchmark Assumptions
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Inflation Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Expected Inflation Rate</span>
                  </label>
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    {inputs.inflationRatePercent}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={0.5}
                  value={inputs.inflationRatePercent}
                  onChange={(e) => updateInputs({ inflationRatePercent: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <p className="text-[10px] text-muted-foreground">
                  India historical average is ~6.0%. Discounted to determine today's purchasing
                  power.
                </p>
              </div>

              {/* Opportunity Benchmark Return */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Opportunity Benchmark</span>
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {inputs.benchmarkReturnRatePercent}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={18}
                  step={0.5}
                  value={inputs.benchmarkReturnRatePercent}
                  onChange={(e) =>
                    updateInputs({
                      benchmarkReturnRatePercent: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[10px] text-muted-foreground">
                  Benchmark rate (e.g. 7.1% PPF or 12.0% Nifty Index) for comparison.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: CUSTOM YEAR-BY-YEAR SCHEDULE OVERRIDES                         */}
          {/* ========================================================================= */}
          <div className="space-y-3 pt-4 border-t border-border/70">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Custom Cash Flow Overrides</span>
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Need non-uniform cash flows? Customize individual years (e.g. money-back bonuses).
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleCustomSchedule}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  inputs.useCustomSchedule
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {inputs.useCustomSchedule ? 'Custom Schedule Active' : 'Customize Individual Years'}
              </button>
            </div>

            {inputs.useCustomSchedule && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  <span>
                    Editing individual year rows directly overrides the formula inputs above.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddYear}
                    className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Year</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto border border-border rounded-xl divide-y divide-border/60">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/70 text-muted-foreground font-semibold sticky top-0">
                      <tr>
                        <th className="p-2 w-16">Year</th>
                        <th className="p-2">Investment (₹)</th>
                        <th className="p-2">Payout (₹)</th>
                        <th className="p-2">Note / Milestone</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {(inputs.customSchedule && inputs.customSchedule.length > 0
                        ? inputs.customSchedule
                        : buildScheduleFromInputs(inputs)
                      ).map((row) => (
                        <tr key={row.year} className="hover:bg-muted/30">
                          <td className="p-2 font-bold text-foreground">Yr {row.year}</td>
                          <td className="p-2">
                            <NumberInput
                              min={0}
                              fallbackValue={0}
                              value={row.invested}
                              onChange={(val) =>
                                handleCustomRowChange(row.year, 'invested', val ?? 0)
                              }
                              className="w-24 px-1.5 py-1 text-xs border border-border rounded bg-background text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                          <td className="p-2">
                            <NumberInput
                              min={0}
                              fallbackValue={0}
                              value={row.received}
                              onChange={(val) =>
                                handleCustomRowChange(row.year, 'received', val ?? 0)
                              }
                              className="w-24 px-1.5 py-1 text-xs border border-border rounded bg-background text-right focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-emerald-600 dark:text-emerald-400"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.note || ''}
                              placeholder="e.g. Bonus / Premium"
                              onChange={(e) =>
                                handleCustomRowChange(row.year, 'note', e.target.value)
                              }
                              className="w-full px-1.5 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveYear(row.year)}
                              title="Delete Year"
                              className="text-muted-foreground hover:text-red-500 cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Results & Executive Report (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Top Hero Card: Actual XIRR & Inflation Verdict */}
          <div className="bg-gradient-to-br from-card to-muted/40 border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                True Annualized Return (XIRR)
              </span>
              <div
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  results.verdict.rating === 'poor' || results.verdict.rating === 'negative'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                    : results.verdict.rating === 'fair'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                }`}
              >
                {results.verdict.tag}
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                  {results.xirrPercent}%
                </span>
                <span className="text-sm font-bold text-muted-foreground">p.a. XIRR</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-semibold text-muted-foreground">
                  Real Return (after {inputs.inflationRatePercent}% inflation):
                </span>
                <span
                  className={`font-black ${
                    results.realXirrPercent < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {results.realXirrPercent > 0
                    ? `+${results.realXirrPercent}%`
                    : `${results.realXirrPercent}%`}
                </span>
              </div>
            </div>

            {/* Verdict Explanation Box */}
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                results.verdict.rating === 'poor' || results.verdict.rating === 'negative'
                  ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                  : 'bg-card border-border'
              }`}
            >
              <div className="font-bold text-foreground flex items-center gap-1.5">
                {results.verdict.rating === 'poor' || results.verdict.rating === 'negative' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <span>{results.verdict.summary}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {results.verdict.explanation}
              </p>
            </div>
          </div>

          {/* Cash Flow Summary & Purchasing Power Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
              Cash Flow & Inflation Impact
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-medium">Total Invested (Outflows)</span>
                <span className="font-bold text-foreground text-sm">
                  {formatINR(results.totalInvested)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-medium">
                  Total Nominal Received ({results.gainMultiplier}x)
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatINR(results.totalReceived)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                <span className="text-muted-foreground font-medium">Net Nominal Gain</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  +{formatINR(results.netProfit)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-foreground block">Real Purchasing Power</span>
                    <span className="text-[10px] text-muted-foreground">
                      Value of all payouts in today's money
                    </span>
                  </div>
                  <span className="font-black text-foreground text-sm">
                    {formatINR(results.totalRealPurchasingPower)}
                  </span>
                </div>

                <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-purple-600 h-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (results.totalRealPurchasingPower / (results.totalReceived || 1)) * 100
                      )}%`,
                    }}
                    title="Real Purchasing Power"
                  />
                  <div
                    className="bg-amber-500/80 h-full"
                    style={{
                      width: `${Math.max(
                        0,
                        100 -
                          Math.min(
                            100,
                            (results.totalRealPurchasingPower / (results.totalReceived || 1)) * 100
                          )
                      )}%`,
                    }}
                    title="Eroded by Inflation"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    Purchasing power retained: {100 - results.purchasingPowerLossPercent}%
                  </span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">
                    Eroded by inflation: -{results.purchasingPowerLossPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunity Cost Benchmark Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Opportunity Cost Benchmark</span>
              </h4>
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug">
              If the exact same investment amounts were put in alternatives instead:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20">
                <div>
                  <div className="font-bold text-foreground">PPF / Sovereign Debt (7.1% p.a.)</div>
                  <div className="text-[10px] text-muted-foreground">
                    Risk-free sovereign guaranteed
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-foreground text-sm">
                    {formatCrore(results.benchmarkPpfCorpus)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
                <div>
                  <div className="font-bold text-blue-900 dark:text-blue-300">
                    Nifty Index Mutual Fund (12.0% p.a.)
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Historical broad equity market CAGR
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                    {formatCrore(results.benchmarkEquityCorpus)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-border hover:bg-muted text-foreground transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Report Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-3 text-xs font-bold rounded-xl border border-border hover:bg-muted text-foreground transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cash Flow Timeline & Phase Visualizer */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-foreground">
              Cash Flow Timeline Overview
            </h3>
            <p className="text-xs text-muted-foreground">
              Visualizing the {results.schedule.length}-year journey from investment to maturity
            </p>
          </div>
          {results.breakEvenYear && (
            <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Break-Even at Year {results.breakEvenYear} (Age{' '}
              {(inputs.startAge || 30) + results.breakEvenYear - 1})
            </div>
          )}
        </div>

        {/* Visual Phases Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 space-y-1">
            <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span>Phase 1: Investment</span>
              <span>Yrs 1 to {investEndYear}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {inputs.investmentDurationYears} annual payments totaling{' '}
              {formatINR(results.totalInvested)}.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1">
            <div className="font-bold text-foreground flex items-center justify-between">
              <span>Phase 2: Accumulation & Deferment</span>
              <span>
                {inputs.payoutStartYear > investEndYear
                  ? `Yrs ${investEndYear + 1} to ${inputs.payoutStartYear - 1}`
                  : 'No Deferment Gap'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {inputs.payoutStartYear > investEndYear
                ? `${inputs.payoutStartYear - investEndYear - 1} waiting year(s) of compounding.`
                : 'Payouts commence immediately.'}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-1">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
              <span>Phase 3: Payouts & Maturity</span>
              <span>
                Yrs {inputs.payoutStartYear} to {payoutEndYear}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Receives total {formatINR(results.totalReceived)} in payouts and maturity benefits.
            </p>
          </div>
        </div>
      </div>

      {/* Year-by-Year Cash Flow Schedule Table */}
      <div className="calc-schedule-table calc-clean-hide bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-foreground">
              Complete Year-by-Year Cash Flow Schedule
            </h3>
            <p className="text-xs text-muted-foreground">
              Review every single rupee invested, received, and discounted for inflation
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFullSchedule((prev) => !prev)}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>{showFullSchedule ? 'Collapse Table' : 'Expand Full Table'}</span>
            {showFullSchedule ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showFullSchedule && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Year (Age)</th>
                  <th className="py-2.5 px-3 text-right">Investment Outflow</th>
                  <th className="py-2.5 px-3 text-right">Payout Inflow</th>
                  <th className="py-2.5 px-3 text-right">Net Cash Flow</th>
                  <th className="py-2.5 px-3 text-right">Inflation PV Factor</th>
                  <th className="py-2.5 px-3 text-right">Real Purchasing Power</th>
                  <th className="py-2.5 px-3 text-right">Cumulative Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {results.schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-foreground">
                      Yr {row.year}{' '}
                      <span className="text-muted-foreground font-normal">(Age {row.age})</span>
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-amber-700 dark:text-amber-400">
                      {row.invested > 0 ? `-${formatINR(row.invested)}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {row.received > 0 ? `+${formatINR(row.received)}` : '—'}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-semibold ${
                        row.netCashFlow > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : row.netCashFlow < 0
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {row.netCashFlow !== 0 ? formatINR(row.netCashFlow) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground font-mono">
                      {row.inflationDiscountFactor.toFixed(3)}x
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-purple-700 dark:text-purple-300">
                      {row.realPurchasingPower > 0 ? formatINR(row.realPurchasingPower) : '—'}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-extrabold ${
                        row.cumulativeReceived >= row.cumulativeInvested
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatINR(row.cumulativeReceived - row.cumulativeInvested)}
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
