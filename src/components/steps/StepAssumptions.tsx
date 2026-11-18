import { useScenarioStore } from '@/store/useScenarioStore'
import { StepHeader, FieldGroup } from '@/components/wizard/StepHeader'
import { realReturn } from '@/domain/calculations/corpusFormula'
import { formatPercent } from '@/lib/format'
import { clamp } from '@/lib/format'

export function StepAssumptions() {
  const { assumptions, setAssumptions, nextStep } = useScenarioStore()
  const r = assumptions.annualInvestmentReturn
  const g = assumptions.globalInflationRate
  const real = realReturn(r, g)
  const rEqualG = Math.abs(r - g) < 0.001
  const rBelowG = r < g

  function pct(val: number) { return Math.round(val * 1000) / 10 }
  function dec(pctVal: number) { return pctVal / 100 }

  return (
    <div className="space-y-8 max-w-2xl">
      <StepHeader
        title="Financial Assumptions"
        subtitle="These assumptions drive the corpus calculation. All fields have sensible defaults — you can skip this step and use them."
        onSkip={() => nextStep()}
      />

      {/* Warnings */}
      {rBelowG && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          ⚠️ Your investment return ({formatPercent(r)}) is below inflation ({formatPercent(g)}). The required corpus will be very large.
        </div>
      )}
      {rEqualG && !rBelowG && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          ℹ️ Return equals inflation. A special formula case (r = g) will be used.
        </div>
      )}
      {assumptions.returnBasis === 'gross' && assumptions.investmentFeeRate === 0 && assumptions.taxDragRate === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          ⚠️ Gross return selected but no fees or tax drag entered. The estimate may be optimistic.
        </div>
      )}

      {/* Section 1: Inflation */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Inflation</h3>

        <FieldGroup
          label="Inflation Mode"
          help="Simple: one rate for all expenses. Category: different rates per category (configure in Expenses step)."
        >
          <div className="flex flex-wrap gap-2 mt-1">
            {(['simple', 'category'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setAssumptions({ inflationMode: mode })}
                className={`px-3 py-1.5 rounded-md border text-sm capitalize transition-colors ${
                  assumptions.inflationMode === mode
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup
          label={`Global Inflation Rate — ${formatPercent(g)}`}
          htmlFor="inflation"
          help="Annual rate at which all expenses grow. India's historical average has been 5–6%."
        >
          <div className="flex items-center gap-3">
            <input
              id="inflation"
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={pct(g)}
              onChange={e => setAssumptions({ globalInflationRate: dec(Number(e.target.value)) })}
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={15}
              step={0.1}
              value={pct(g)}
              onChange={e => setAssumptions({ globalInflationRate: dec(clamp(Number(e.target.value), 0, 50)) })}
              className="w-20 border rounded px-2 py-1 text-sm text-right"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </FieldGroup>
      </section>

      {/* Section 2: Investment Return */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Investment Return</h3>

        <FieldGroup
          label={`Annual Investment Return — ${formatPercent(r)}`}
          htmlFor="return"
          help="Expected return on your invested corpus. A diversified portfolio in India historically returns 7–10%, but this is not guaranteed."
        >
          <div className="flex items-center gap-3">
            <input
              id="return"
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={pct(r)}
              onChange={e => setAssumptions({ annualInvestmentReturn: dec(Number(e.target.value)) })}
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={30}
              step={0.1}
              value={pct(r)}
              onChange={e => setAssumptions({ annualInvestmentReturn: dec(clamp(Number(e.target.value), 0, 50)) })}
              className="w-20 border rounded px-2 py-1 text-sm text-right"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </FieldGroup>

        <div className="rounded-lg bg-muted/50 px-4 py-2 text-sm">
          Real return ≈ <span className="font-semibold">{formatPercent(real)}</span>
          <span className="text-muted-foreground ml-2">
            (nominal {formatPercent(r)} − {formatPercent(g)} inflation)
          </span>
        </div>

        <FieldGroup
          label="Return Basis"
          help="Net: you've already accounted for fees and taxes. Gross: enter fees and taxes separately below."
        >
          <div className="flex gap-2 mt-1">
            {(['net', 'gross'] as const).map(basis => (
              <button
                key={basis}
                type="button"
                onClick={() => setAssumptions({ returnBasis: basis })}
                className={`px-3 py-1.5 rounded-md border text-sm capitalize transition-colors ${
                  assumptions.returnBasis === basis
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {basis}
              </button>
            ))}
          </div>
        </FieldGroup>

        {assumptions.returnBasis === 'gross' && (
          <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
            <FieldGroup
              label="Investment Fee Rate (%)"
              htmlFor="fees"
              help="Annual management or advisory fee (e.g. 0.5% for index funds)."
            >
              <input
                id="fees"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={pct(assumptions.investmentFeeRate)}
                onChange={e => setAssumptions({ investmentFeeRate: dec(Number(e.target.value)) })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </FieldGroup>
            <FieldGroup
              label="Tax Drag (%)"
              htmlFor="tax"
              help="Effective tax drag on returns (e.g. LTCG at 12.5% on 7% return ≈ 0.875%)."
            >
              <input
                id="tax"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={pct(assumptions.taxDragRate)}
                onChange={e => setAssumptions({ taxDragRate: dec(Number(e.target.value)) })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </FieldGroup>
          </div>
        )}
      </section>

      {/* Section 3: Withdrawal & Planning */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Withdrawal & Planning</h3>

        <FieldGroup
          label="Withdrawal Timing"
          help="End-of-year is the more common convention and gives a slightly lower (less conservative) corpus estimate. Beginning-of-year is more conservative."
        >
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { value: 'end_of_year' as const, label: 'End of year' },
              { value: 'beginning_of_year' as const, label: 'Beginning of year' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAssumptions({ withdrawalTiming: opt.value })}
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  assumptions.withdrawalTiming === opt.value
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup
          label={`Safety Margin — ${formatPercent(assumptions.safetyMarginPercent)}`}
          htmlFor="safety"
          help="Extra buffer added on top of the calculated corpus to cover unexpected costs, sequence-of-returns risk, or underestimated expenses."
        >
          <div className="flex items-center gap-3">
            <input
              id="safety"
              type="range"
              min={0}
              max={50}
              step={5}
              value={pct(assumptions.safetyMarginPercent)}
              onChange={e => setAssumptions({ safetyMarginPercent: dec(Number(e.target.value)) })}
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={pct(assumptions.safetyMarginPercent)}
              onChange={e => setAssumptions({ safetyMarginPercent: dec(clamp(Number(e.target.value), 0, 200)) })}
              className="w-20 border rounded px-2 py-1 text-sm text-right"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </FieldGroup>
      </section>
    </div>
  )
}
