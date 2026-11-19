import { useState } from 'react'
import { ChevronDown, ChevronRight, Info, Plus, Trash2, RotateCcw } from 'lucide-react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { formatCrore } from '@/lib/currency'
import { annualiseExpense } from '@/domain/calculations/annualise'
import type { ExpenseCategory, ExpenseItem, Frequency } from '@/domain/models/expense'
import { FREQUENCY_LABELS, FREQUENCY_MULTIPLIERS } from '@/domain/models/expense'
import type { HouseholdMember } from '@/domain/models/household'
import { cn } from '@/lib/cn'

function categoryTotal(cat: ExpenseCategory): number {
  if (cat.skipped) return 0
  if (cat.parentAmount !== undefined && cat.parentFrequency) {
    const mult = FREQUENCY_MULTIPLIERS[cat.parentFrequency] || 1
    return cat.parentAmount * mult
  }
  return cat.items
    .filter(i => !i.skipped)
    .reduce((sum, item) => sum + annualiseExpense(item), 0)
}

function StatusBadge({ cat }: { cat: ExpenseCategory }) {
  if (cat.skipped) {
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
        Skipped
      </span>
    )
  }
  const total = categoryTotal(cat)
  if (total > 0) {
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
        Filled ({formatCrore(total)}/yr)
      </span>
    )
  }
  return (
    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80">
      Not filled
    </span>
  )
}

// ─── Dependent expense banner ───────────────────────────────────────────────

function DependentExpenseBanner({ members }: { members: HouseholdMember[] }) {
  const dependents = members.filter(m => m.id !== 'self' && m.financiallyDependent)
  if (dependents.length === 0) return null

  return (
    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 flex gap-3">
      <span className="text-xl shrink-0">💡</span>
      <div className="text-sm text-amber-900 dark:text-amber-200">
        <p className="font-semibold">
          You have {dependents.length} dependent{dependents.length > 1 ? 's' : ''} in your plan
        </p>
        <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
          Enter all amounts in <strong>today's money</strong>. For expenses that start in future
          years (like children's education), we automatically inflate them from their start year —
          so your ₹10,000/yr school fee today becomes{' '}
          ₹{Math.round(10000 * Math.pow(1.07, 5)).toLocaleString('en-IN')}/yr when it kicks in 5
          years later. Set the active period for each expense below.
        </p>
      </div>
    </div>
  )
}

// ─── Smart window suggestions ────────────────────────────────────────────────

function getWindowSuggestions(
  item: ExpenseItem,
  members: HouseholdMember[],
  _userCurrentAge: number,
): Array<{ label: string; startYear: number; endYear?: number }> {
  const rel = item.linkedMemberRelationship
  const suggestions: Array<{ label: string; startYear: number; endYear?: number }> = []

  const childMembers = members.filter(m => m.relationship === 'child' && m.financiallyDependent)
  const parentMembers = members.filter(m => m.relationship === 'parent' && m.financiallyDependent)

  if (rel === 'child' || (rel === undefined && childMembers.length > 0 && item.categoryId === 'family')) {
    const child = childMembers[0]
    if (child) {
      const schoolStartYear = Math.max(1, 5 - child.age)
      const schoolEndYear = schoolStartYear + 11

      const collegeStartYear = Math.max(1, 17 - child.age)
      const collegeEndYear = collegeStartYear + 3

      const nameLower = item.name.toLowerCase()
      if (nameLower.includes('school') || nameLower.includes('tuition')) {
        suggestions.push({
          label:
            child.age < 5
              ? `School (yr ${schoolStartYear}–${schoolEndYear})`
              : `School now–yr ${schoolEndYear}`,
          startYear: schoolStartYear,
          endYear: schoolEndYear,
        })
        suggestions.push({
          label: `College (yr ${collegeStartYear}–${collegeEndYear})`,
          startYear: collegeStartYear,
          endYear: collegeEndYear,
        })
      } else if (
        nameLower.includes('college') ||
        nameLower.includes('higher') ||
        nameLower.includes('education')
      ) {
        suggestions.push({
          label: `College (yr ${collegeStartYear}–${collegeEndYear})`,
          startYear: collegeStartYear,
          endYear: collegeEndYear,
        })
        suggestions.push({
          label:
            child.age < 5
              ? `School (yr ${schoolStartYear}–${schoolEndYear})`
              : `School now–yr ${schoolEndYear}`,
          startYear: schoolStartYear,
          endYear: schoolEndYear,
        })
      } else {
        suggestions.push({
          label: `While child in school (yr ${schoolStartYear}–${schoolEndYear})`,
          startYear: schoolStartYear,
          endYear: schoolEndYear,
        })
        suggestions.push({
          label: child.supportUntilAge
            ? `Until child independent (yr 1–${child.supportUntilAge - child.age})`
            : `Until child is 25 (yr 1–${Math.max(1, 25 - child.age)})`,
          startYear: 1,
          endYear: child.supportUntilAge
            ? child.supportUntilAge - child.age
            : Math.max(1, 25 - child.age),
        })
      }
    }
  }

  if (rel === 'parent' || (rel === undefined && parentMembers.length > 0 && item.categoryId === 'family')) {
    const parent = parentMembers[0]
    if (parent) {
      const supportEnd = parent.supportUntilAge
        ? parent.supportUntilAge - parent.age
        : Math.max(1, 80 - parent.age)
      suggestions.push({
        label: parent.supportUntilAge
          ? `Until parent's support age (yr 1–${supportEnd})`
          : `Until parent turns 80 (yr 1–${supportEnd})`,
        startYear: 1,
        endYear: supportEnd > 0 ? supportEnd : undefined,
      })
    }
  }

  return suggestions
}

// ─── Expense Window Panel ────────────────────────────────────────────────────

interface ExpenseWindowPanelProps {
  item: ExpenseItem
  members: HouseholdMember[]
  userCurrentAge: number
  categoryInflationRate: number
  onUpdate: (patch: Partial<ExpenseItem>) => void
}

function ExpenseWindowPanel({
  item,
  members,
  userCurrentAge,
  categoryInflationRate,
  onUpdate,
}: ExpenseWindowPanelProps) {
  const suggestions = getWindowSuggestions(item, members, userCurrentAge)

  const annualAmount = annualiseExpense(item)
  const inflatedAmount =
    annualAmount > 0 && item.startYear > 1
      ? Math.round(annualAmount * Math.pow(1 + categoryInflationRate, item.startYear - 1))
      : null

  const durationYears = item.endYear ? item.endYear - item.startYear + 1 : null

  return (
    <div className="mt-2 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
          ⏱ Expense Window
        </span>
        <span className="text-[10px] text-blue-600 dark:text-blue-400">
          When does this expense apply?
        </span>
      </div>

      {/* Smart suggestion chips */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] text-zinc-500 self-center">Quick set:</span>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onUpdate({ startYear: s.startYear, endYear: s.endYear })}
              className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Start / End year inputs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            Starts year
          </span>
          <input
            type="number"
            min={1}
            value={item.startYear}
            onChange={e => onUpdate({ startYear: Math.max(1, Number(e.target.value)) })}
            className="w-14 h-7 border border-zinc-300 dark:border-zinc-700 rounded-lg px-1.5 text-xs text-center font-bold bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <span className="text-zinc-400 text-xs">→</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            Ends year
          </span>
          <input
            type="number"
            min={item.startYear}
            value={item.endYear ?? ''}
            placeholder="Lifelong"
            onChange={e =>
              onUpdate({ endYear: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-20 h-7 border border-zinc-300 dark:border-zinc-700 rounded-lg px-1.5 text-xs text-center font-bold bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {durationYears !== null && durationYears > 0 && (
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
            {durationYears} yr{durationYears !== 1 ? 's' : ''}
          </span>
        )}
        {item.endYear === undefined && (
          <span className="text-[11px] text-zinc-500 italic">Runs until end of plan</span>
        )}
      </div>

      {/* Inflation preview */}
      {annualAmount > 0 && (
        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-white/60 dark:bg-zinc-900/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <span>📌</span>
          <span>
            {item.startYear === 1 ? (
              <>
                Starts immediately at ₹{annualAmount.toLocaleString('en-IN')}/yr{' '}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  (inflated each year at {(categoryInflationRate * 100).toFixed(0)}%)
                </strong>
              </>
            ) : (
              <>
                ₹{annualAmount.toLocaleString('en-IN')}/yr today →{' '}
                {inflatedAmount && (
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    ≈ ₹{inflatedAmount.toLocaleString('en-IN')}/yr when it starts
                  </strong>
                )}
              </>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Sub-item row ─────────────────────────────────────────────────────────────

function SubItemRow({
  item,
  onUpdate,
  onRemove,
  isFamilyCategory,
  members,
  userCurrentAge,
  categoryInflationRate,
}: {
  item: ExpenseItem
  onUpdate: (patch: Partial<ExpenseItem>) => void
  onRemove: () => void
  isFamilyCategory: boolean
  members: HouseholdMember[]
  userCurrentAge: number
  categoryInflationRate: number
}) {
  const [showDetails, setShowDetails] = useState(false)

  // For family category items, show the ExpenseWindowPanel always (not in "More").
  // For other items, start/end stay in the "More" panel as before.
  const showWindowPanel = isFamilyCategory

  return (
    <div
      className={cn(
        'border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2 text-sm bg-white dark:bg-zinc-900 shadow-xs transition-colors',
        item.skipped && 'opacity-40',
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          value={item.name}
          onChange={e => onUpdate({ name: e.target.value })}
          className="flex-1 font-semibold text-xs sm:text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs font-bold text-zinc-500 pointer-events-none">₹</span>
            <input
              type="number"
              min={0}
              value={item.amount || ''}
              placeholder="0"
              onChange={e => onUpdate({ amount: e.target.value === '' ? 0 : Number(e.target.value) })}
              className="w-24 sm:w-28 h-9 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-6 pr-2 text-xs text-right font-bold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="relative">
            <select
              value={item.frequency}
              onChange={e => onUpdate({ frequency: e.target.value as Frequency })}
              className="h-9 appearance-none border border-zinc-200 dark:border-zinc-800 rounded-lg pl-2.5 pr-6 text-xs font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {Object.entries(FREQUENCY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>

          {item.frequency === 'every_n_years' && (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Every</span>
              <input
                type="number"
                min={1}
                max={30}
                value={item.everyNYears ?? 5}
                onChange={e => onUpdate({ everyNYears: Number(e.target.value) })}
                className="w-10 h-7 border rounded text-xs text-center font-bold bg-white dark:bg-zinc-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">yrs</span>
            </div>
          )}

          {/* Only show "More" toggle for non-family items */}
          {!showWindowPanel && (
            <button
              type="button"
              onClick={() => setShowDetails(x => !x)}
              className="text-blue-600 dark:text-blue-400 hover:underline p-1 text-xs font-medium ml-1 cursor-pointer"
            >
              {showDetails ? 'Less' : 'More'}
            </button>
          )}

          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {item.notes && !showDetails && !showWindowPanel && (
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 pl-1 flex items-center gap-1.5">
          <Info className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{item.notes}</span>
        </p>
      )}

      {item.notes && showWindowPanel && (
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 pl-1 flex items-center gap-1.5">
          <Info className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{item.notes}</span>
        </p>
      )}

      {/* Family category: always-visible Expense Window panel */}
      {showWindowPanel && (
        <ExpenseWindowPanel
          item={item}
          members={members}
          userCurrentAge={userCurrentAge}
          categoryInflationRate={categoryInflationRate}
          onUpdate={onUpdate}
        />
      )}

      {/* Non-family: existing "More" details panel */}
      {!showWindowPanel && showDetails && (
        <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={item.essential}
              onChange={e => onUpdate({ essential: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span>Essential Expense</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 font-medium">Start Year:</span>
            <input
              type="number"
              min={1}
              value={item.startYear}
              onChange={e => onUpdate({ startYear: Number(e.target.value) })}
              className="w-16 h-7 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 text-xs text-center font-bold bg-white dark:bg-zinc-900"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 font-medium">End Year:</span>
            <input
              type="number"
              min={1}
              value={item.endYear ?? ''}
              placeholder="Lifelong"
              onChange={e => onUpdate({ endYear: e.target.value ? Number(e.target.value) : undefined })}
              className="w-20 h-7 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 text-xs text-center font-bold bg-white dark:bg-zinc-900"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Category panel ───────────────────────────────────────────────────────────

function CategoryPanel({
  cat,
  members,
  userCurrentAge,
}: {
  cat: ExpenseCategory
  members: HouseholdMember[]
  userCurrentAge: number
}) {
  const { updateCategory, addExpenseItem, updateExpenseItem, removeExpenseItem } = useScenarioStore()
  const isFamilyCategory = cat.id === 'family'
  // For family category, default to sub-items mode (parentAmount undefined by default is already sub-items)
  const isParentMode = cat.parentAmount !== undefined

  function setMode(mode: 'parent' | 'subitems') {
    if (mode === 'parent') {
      const currentSubtotal = cat.items
        .filter(i => !i.skipped)
        .reduce((sum, item) => sum + annualiseExpense(item), 0)
      const monthlyEquiv = Math.round(currentSubtotal / 12)

      updateCategory(cat.id, {
        parentAmount:
          cat.parentAmount !== undefined ? cat.parentAmount : monthlyEquiv > 0 ? monthlyEquiv : 0,
        parentFrequency: cat.parentFrequency || 'monthly',
      })
    } else {
      updateCategory(cat.id, { parentAmount: undefined })
    }
  }

  function handleAddCustomItem() {
    const newItem: ExpenseItem = {
      id: `custom_${Date.now()}`,
      categoryId: cat.id,
      name: 'Custom Line Item',
      amount: 0,
      frequency: 'monthly',
      essential: true,
      appliesTo: 'household',
      startYear: 1,
      type: 'recurring',
      notes: 'Custom user defined expense',
      skipped: false,
    }
    addExpenseItem(cat.id, newItem)
  }

  if (cat.skipped) {
    return (
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 text-center space-y-2 rounded-b-xl border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          This category is marked as skipped and is omitted from calculations.
        </p>
        <button
          type="button"
          onClick={() => updateCategory(cat.id, { skipped: false })}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Un-skip and include this category
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-b-xl">
      <div className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{cat.description}</p>
          <p className="mt-1 text-[11px] font-bold text-zinc-900 dark:text-zinc-200">
            Default inflation rate for this category: {(cat.defaultInflationRate * 100).toFixed(0)}% per year.
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('parent')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
              isParentMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
            )}
          >
            Enter Category Total
          </button>
          <button
            type="button"
            onClick={() => setMode('subitems')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
              !isParentMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
            )}
          >
            Fill Sub-items ({cat.items.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => updateCategory(cat.id, { skipped: true })}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer"
        >
          Skip this category
        </button>
      </div>

      {/* Parent Total Mode */}
      {isParentMode ? (
        <div className="space-y-4">
          <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border-2 border-blue-500/50 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Lump-Sum Total for {cat.label}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                Active in calculations
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Enter a single overall amount for this category. Individual sub-items below are
              disabled and bypassed in calculations, but displayed to help you calculate your total.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  min={0}
                  value={cat.parentAmount ?? ''}
                  placeholder="0"
                  onChange={e => updateCategory(cat.id, { parentAmount: Number(e.target.value) })}
                  className="w-44 h-11 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-8 pr-3 text-sm font-bold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="relative">
                <select
                  value={cat.parentFrequency || 'monthly'}
                  onChange={e =>
                    updateCategory(cat.id, { parentFrequency: e.target.value as Frequency })
                  }
                  className="h-11 appearance-none border border-zinc-300 dark:border-zinc-700 rounded-xl pl-3.5 pr-9 text-sm font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                >
                  <option value="monthly">Per Month</option>
                  <option value="quarterly">Per Quarter</option>
                  <option value="half_yearly">Half Yearly</option>
                  <option value="yearly">Per Year</option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {cat.parentAmount !== undefined && (
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800/60">
                  = {formatCrore(categoryTotal(cat))}/year
                </span>
              )}
            </div>
          </div>

          {/* Reference Sub-categories (Disabled / Non-editable) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                Reference Sub-Categories (Disabled while Category Total is active):
              </span>
              <button
                type="button"
                onClick={() => setMode('subitems')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Switch to Edit Line Items Individually →
              </button>
            </div>

            <div className="space-y-1.5 opacity-60 pointer-events-none select-none">
              {cat.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 bg-zinc-100/70 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      ₹{item.amount.toLocaleString('en-IN')} {FREQUENCY_LABELS[item.frequency] || item.frequency}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      (≈ {formatCrore(annualiseExpense(item))}/yr)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Sub-items Mode */
        <div className="space-y-2.5">
          {cat.items.map(item => (
            <SubItemRow
              key={item.id}
              item={item}
              onUpdate={patch => updateExpenseItem(cat.id, item.id, patch)}
              onRemove={() => removeExpenseItem(cat.id, item.id)}
              isFamilyCategory={isFamilyCategory}
              members={members}
              userCurrentAge={userCurrentAge}
              categoryInflationRate={cat.defaultInflationRate}
            />
          ))}

          <button
            type="button"
            onClick={handleAddCustomItem}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Line Item</span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function DynamicExpensesRenderer() {
  const { categories, profile, members, recalibrateCategories } = useScenarioStore()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['housing', 'food', 'healthcare']))

  const userCurrentAge = profile.currentAge

  function toggle(id: string) {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function expandAll() {
    setOpenIds(new Set(categories.map(c => c.id)))
  }

  function collapseAll() {
    setOpenIds(new Set())
  }

  const grandTotal = categories.reduce((sum, c) => sum + categoryTotal(c), 0)

  return (
    <div className="space-y-4">
      {/* Top Annual Summary Banner with high visual contrast */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
              Baseline Expenses
            </span>
            <span className="text-xs text-blue-100">
              Calibrated for: <strong className="capitalize">{profile.areaType.replace('_', ' ')}</strong> ·{' '}
              <strong className="capitalize">{profile.lifestyleScenario.replace('_', ' ')}</strong>
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            {formatCrore(grandTotal)} <span className="text-sm font-semibold text-blue-100">/ year</span>
          </p>
          <p className="text-xs text-blue-100/90 mt-0.5">
            ≈ {formatCrore(grandTotal / 12)} / month in today's purchasing power
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={recalibrateCategories}
            className="text-xs font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/20 cursor-pointer"
            title="Reset default expense amounts based on your profile location"
          >
            Reset to Area Defaults
          </button>
          <div className="flex items-center gap-2 text-xs text-white/90">
            <button
              type="button"
              onClick={expandAll}
              className="hover:underline font-medium cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="hover:underline font-medium cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Dependent Expense Banner — shown only when there are financially-dependent non-self members */}
      <DependentExpenseBanner members={members} />

      {/* Category Accordion */}
      <div className="space-y-2.5">
        {categories.map(cat => {
          const isOpen = openIds.has(cat.id)

          return (
            <div
              key={cat.id}
              className={cn(
                'border rounded-xl transition-all duration-200 shadow-xs bg-white dark:bg-zinc-900',
                isOpen
                  ? 'border-blue-500/50 dark:border-blue-500/40 ring-1 ring-blue-500/10'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left rounded-xl transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-zinc-400" />
                  )}
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {cat.label}
                  </span>
                  <StatusBadge cat={cat} />
                </div>
              </button>

              {isOpen && (
                <CategoryPanel cat={cat} members={members} userCurrentAge={userCurrentAge} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
