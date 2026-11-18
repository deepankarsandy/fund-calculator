import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { StepHeader, FieldGroup } from '@/components/wizard/StepHeader'
import { formatCrore } from '@/lib/currency'
import type { OtherIncome, FutureLumpSum } from '@/domain/models/assets'

function genId() { return Math.random().toString(36).slice(2, 10) }

export function StepAssets() {
  const {
    assets,
    setAssets,
    addOtherIncome,
    updateOtherIncome,
    removeOtherIncome,
    addLumpSum,
    updateLumpSum,
    removeLumpSum,
    nextStep,
  } = useScenarioStore()

  const [showIncome, setShowIncome] = useState(assets.otherIncome.length > 0)
  const [showLumpSum, setShowLumpSum] = useState(assets.futureContributions.length > 0)

  return (
    <div className="space-y-8 max-w-2xl">
      <StepHeader
        title="Assets & Income"
        subtitle="Enter existing savings and any income you expect after retirement. Everything here is optional."
        onSkip={() => nextStep()}
      />

      {/* Existing corpus */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Existing Investable Corpus</h3>
        <FieldGroup
          label="Total investable assets today"
          htmlFor="corpus"
          help="Mutual funds, FDs, EPF, NPS, gold, etc. that you can use for retirement. Do NOT include your home unless you plan to sell or rent it."
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">₹</span>
            <input
              id="corpus"
              type="number"
              min={0}
              value={assets.existingInvestableCorpus || ''}
              onChange={e => setAssets({ existingInvestableCorpus: Number(e.target.value) })}
              placeholder="0"
              className="border rounded px-3 py-2 text-sm flex-1 max-w-xs"
            />
            {assets.existingInvestableCorpus > 0 && (
              <span className="text-sm text-muted-foreground">
                = {formatCrore(assets.existingInvestableCorpus)}
              </span>
            )}
          </div>
        </FieldGroup>
      </section>

      {/* Other income */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Regular Income After Retirement</h3>
          {!showIncome && (
            <button
              type="button"
              onClick={() => setShowIncome(true)}
              className="text-sm text-primary underline"
            >
              + Add income
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Pension, rental income, annuity. Only include income you are highly confident about.
        </p>

        {showIncome && (
          <div className="space-y-3">
            {assets.otherIncome.map(inc => (
              <div key={inc.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inc.label}
                    onChange={e => updateOtherIncome(inc.id, { label: e.target.value })}
                    placeholder="Label (e.g. Pension)"
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeOtherIncome(inc.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <FieldGroup label="Annual amount (₹)" htmlFor={`inc-amt-${inc.id}`}>
                    <input
                      id={`inc-amt-${inc.id}`}
                      type="number" min={0}
                      value={inc.annualAmount || ''}
                      onChange={e => updateOtherIncome(inc.id, { annualAmount: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                    />
                  </FieldGroup>
                  <FieldGroup label="From year" htmlFor={`inc-start-${inc.id}`} help="Planning year when income starts.">
                    <input
                      id={`inc-start-${inc.id}`}
                      type="number" min={1}
                      value={inc.startYear}
                      onChange={e => updateOtherIncome(inc.id, { startYear: Number(e.target.value) })}
                      className="w-full border rounded px-2 py-1.5 text-xs"
                    />
                  </FieldGroup>
                  <FieldGroup label="Until year" htmlFor={`inc-end-${inc.id}`} help="Blank = lifelong.">
                    <input
                      id={`inc-end-${inc.id}`}
                      type="number" min={1}
                      value={inc.endYear ?? ''}
                      placeholder="—"
                      onChange={e => updateOtherIncome(inc.id, { endYear: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full border rounded px-2 py-1.5 text-xs"
                    />
                  </FieldGroup>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={inc.inflationLinked}
                        onChange={e => updateOtherIncome(inc.id, { inflationLinked: e.target.checked })}
                        className="w-3.5 h-3.5"
                      />
                      Inflation-linked
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOtherIncome({
                id: genId(),
                label: '',
                annualAmount: 0,
                startYear: 1,
                inflationLinked: false,
              })}
              className="flex items-center gap-1.5 text-sm text-primary font-medium py-1"
            >
              <Plus className="w-4 h-4" />
              Add income source
            </button>
          </div>
        )}
      </section>

      {/* Future lump sums */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Future Lump Sums</h3>
          {!showLumpSum && (
            <button
              type="button"
              onClick={() => setShowLumpSum(true)}
              className="text-sm text-primary underline"
            >
              + Add lump sum
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          EPF maturity, property sale, inheritance, or other one-time receipts. Enter in nominal future terms.
        </p>

        {showLumpSum && (
          <div className="space-y-3">
            {assets.futureContributions.map(ls => (
              <div key={ls.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ls.label}
                    onChange={e => updateLumpSum(ls.id, { label: e.target.value })}
                    placeholder="Label (e.g. EPF maturity)"
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeLumpSum(ls.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FieldGroup label="Amount (₹)" htmlFor={`ls-amt-${ls.id}`}>
                    <input
                      id={`ls-amt-${ls.id}`}
                      type="number" min={0}
                      value={ls.amount || ''}
                      onChange={e => updateLumpSum(ls.id, { amount: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                    />
                  </FieldGroup>
                  <FieldGroup label="In planning year" htmlFor={`ls-year-${ls.id}`} help="1 = first year of plan.">
                    <input
                      id={`ls-year-${ls.id}`}
                      type="number" min={1}
                      value={ls.year}
                      onChange={e => updateLumpSum(ls.id, { year: Number(e.target.value) })}
                      className="w-full border rounded px-2 py-1.5 text-xs"
                    />
                  </FieldGroup>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addLumpSum({ id: genId(), label: '', amount: 0, year: 1 })}
              className="flex items-center gap-1.5 text-sm text-primary font-medium py-1"
            >
              <Plus className="w-4 h-4" />
              Add lump sum
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
