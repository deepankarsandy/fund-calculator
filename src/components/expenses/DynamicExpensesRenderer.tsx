import { useState } from 'react'
import { ChevronDown, ChevronRight, Info, Plus, Trash2, RotateCcw } from 'lucide-react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { formatCrore } from '@/lib/currency'
import { annualiseExpense } from '@/domain/calculations/annualise'
import type { ExpenseCategory, ExpenseItem, Frequency } from '@/domain/models/expense'
import { FREQUENCY_LABELS, FREQUENCY_MULTIPLIERS } from '@/domain/models/expense'
import { cn } from '@/lib/cn'

function categoryTotal(cat: ExpenseCategory): number {
  if (cat.skipped) return 0
  if (cat.parentAmount != null && cat.parentAmount > 0 && cat.parentFrequency) {
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
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        Skipped
      </span>
    )
  }
  const total = categoryTotal(cat)
  if (total > 0) {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        Filled ({formatCrore(total)}/yr)
      </span>
    )
  }
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
      Not filled
    </span>
  )
}

function SubItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: ExpenseItem
  onUpdate: (patch: Partial<ExpenseItem>) => void
  onRemove: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div
      className={cn(
        'border rounded-lg p-2.5 space-y-2 text-sm bg-card transition-colors',
        item.skipped && 'opacity-40',
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          value={item.name}
          onChange={e => onUpdate({ name: e.target.value })}
          className="flex-1 font-medium text-xs sm:text-sm border rounded px-2.5 py-1.5 bg-background focus:ring-1 focus:ring-primary"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-muted-foreground font-semibold">₹</span>
          <input
            type="number"
            min={0}
            value={item.amount || ''}
            placeholder="0"
            onChange={e => onUpdate({ amount: e.target.value === '' ? 0 : Number(e.target.value) })}
            className="w-24 sm:w-28 border rounded px-2.5 py-1.5 text-xs text-right font-medium focus:ring-1 focus:ring-primary"
          />

          <select
            value={item.frequency}
            onChange={e => onUpdate({ frequency: e.target.value as Frequency })}
            className="border rounded px-2 py-1.5 text-xs bg-background focus:ring-1 focus:ring-primary"
          >
            {Object.entries(FREQUENCY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>

          {item.frequency === 'every_n_years' && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Every</span>
              <input
                type="number"
                min={1}
                max={30}
                value={item.everyNYears ?? 5}
                onChange={e => onUpdate({ everyNYears: Number(e.target.value) })}
                className="w-12 border rounded px-1.5 py-1 text-xs text-center"
              />
              <span className="text-xs text-muted-foreground">yrs</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDetails(x => !x)}
            className="text-muted-foreground hover:text-foreground p-1 text-xs underline ml-1"
            title="More details"
          >
            {showDetails ? 'Less' : 'More'}
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive p-1 rounded"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {item.notes && !showDetails && (
        <p className="text-[11px] text-muted-foreground pl-1 flex items-center gap-1">
          <Info className="w-3 h-3 text-primary shrink-0" />
          <span>{item.notes}</span>
        </p>
      )}

      {showDetails && (
        <div className="pt-2 border-t grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-muted/20 p-2 rounded">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={item.essential}
              onChange={e => onUpdate({ essential: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded"
            />
            <span>Essential Expense</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Start Year:</span>
            <input
              type="number"
              min={1}
              value={item.startYear}
              onChange={e => onUpdate({ startYear: Number(e.target.value) })}
              className="w-16 border rounded px-1.5 py-0.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">End Year:</span>
            <input
              type="number"
              min={1}
              value={item.endYear ?? ''}
              placeholder="Lifelong"
              onChange={e => onUpdate({ endYear: e.target.value ? Number(e.target.value) : undefined })}
              className="w-20 border rounded px-1.5 py-0.5 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryPanel({ cat }: { cat: ExpenseCategory }) {
  const { updateCategory, addExpenseItem, updateExpenseItem, removeExpenseItem } = useScenarioStore()
  const isParentMode = cat.parentAmount != null && cat.parentAmount > 0

  function setMode(mode: 'parent' | 'subitems') {
    if (mode === 'parent') {
      updateCategory(cat.id, {
        parentAmount: cat.parentAmount || 0,
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
      <div className="p-4 bg-muted/20 text-center space-y-2 rounded-b-lg">
        <p className="text-xs text-muted-foreground">
          This category is marked as skipped and will not add to your living costs.
        </p>
        <button
          type="button"
          onClick={() => updateCategory(cat.id, { skipped: false })}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Un-skip and include this category
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 border-t bg-card/50 rounded-b-lg">
      <div className="text-xs text-muted-foreground flex items-start gap-1.5 bg-muted/40 p-2.5 rounded-md">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p>{cat.description}</p>
          <p className="mt-0.5 text-[11px] font-medium text-foreground/80">
            Assumed inflation rate for this category: {(cat.defaultInflationRate * 100).toFixed(0)}% per year.
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b pb-3">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('parent')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-md transition-colors',
              isParentMode ? 'bg-background shadow-sm text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Enter Category Total
          </button>
          <button
            type="button"
            onClick={() => setMode('subitems')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-md transition-colors',
              !isParentMode ? 'bg-background shadow-sm text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Fill Sub-items ({cat.items.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => updateCategory(cat.id, { skipped: true })}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Skip this category
        </button>
      </div>

      {/* Parent Total Mode */}
      {isParentMode ? (
        <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Enter a single total for this whole category. Individual sub-items below are bypassed.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-medium text-muted-foreground">₹</span>
              <input
                type="number"
                min={0}
                value={cat.parentAmount || ''}
                placeholder="0"
                onChange={e => updateCategory(cat.id, { parentAmount: Number(e.target.value) })}
                className="w-40 border rounded-lg pl-7 pr-3 py-2 text-sm bg-background font-semibold"
              />
            </div>

            <select
              value={cat.parentFrequency || 'monthly'}
              onChange={e => updateCategory(cat.id, { parentFrequency: e.target.value as Frequency })}
              className="border rounded-lg px-3 py-2 text-sm bg-background font-medium"
            >
              <option value="monthly">Per Month</option>
              <option value="quarterly">Per Quarter</option>
              <option value="half_yearly">Half Yearly</option>
              <option value="yearly">Per Year</option>
            </select>

            {cat.parentAmount && cat.parentAmount > 0 && (
              <span className="text-xs text-primary font-semibold sm:ml-2">
                = {formatCrore(categoryTotal(cat))}/year
              </span>
            )}
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
            />
          ))}

          <button
            type="button"
            onClick={handleAddCustomItem}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 py-1.5 px-2 rounded hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Line Item
          </button>
        </div>
      )}
    </div>
  )
}

export function DynamicExpensesRenderer() {
  const { categories } = useScenarioStore()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['housing', 'food', 'healthcare']))

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
      {/* Top Annual Summary Banner */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Total Current Annual Living Expenses
          </span>
          <p className="text-2xl font-bold text-foreground mt-0.5">
            {formatCrore(grandTotal)} / year
          </p>
          <p className="text-xs text-muted-foreground">
            ≈ {formatCrore(grandTotal / 12)} / month in today's purchasing power
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Expand All
          </button>
          <span className="text-xs text-muted-foreground">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Category Accordion */}
      <div className="space-y-2">
        {categories.map(cat => {
          const isOpen = openIds.has(cat.id)

          return (
            <div
              key={cat.id}
              className={cn(
                'border rounded-xl transition-all duration-200 shadow-xs',
                isOpen ? 'border-primary/40 bg-card' : 'hover:border-border/80 bg-card/60',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left rounded-xl transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-semibold text-sm text-foreground truncate">
                    {cat.label}
                  </span>
                  <StatusBadge cat={cat} />
                </div>
              </button>

              {isOpen && <CategoryPanel cat={cat} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
