import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { StepHeader } from '@/components/wizard/StepHeader'
import { formatCrore } from '@/lib/currency'
import { annualiseExpense } from '@/domain/calculations/annualise'
import type { ExpenseCategory, ExpenseItem, Frequency, CategoryId } from '@/domain/models/expense'
import { FREQUENCY_LABELS } from '@/domain/models/expense'
import { cn } from '@/lib/cn'

function genId() { return Math.random().toString(36).slice(2, 10) }

function categoryTotal(cat: ExpenseCategory): number {
  if (cat.skipped) return 0
  if (cat.parentAmount && cat.parentAmount > 0 && cat.parentFrequency) {
    const mult: Record<string, number> = { monthly: 12, quarterly: 4, half_yearly: 2, yearly: 1, weekly: 52 }
    return cat.parentAmount * (mult[cat.parentFrequency] ?? 1)
  }
  return cat.items.filter(i => !i.skipped).reduce((s, i) => s + annualiseExpense(i), 0)
}

function CompletionBadge({ cat }: { cat: ExpenseCategory }) {
  if (cat.skipped) return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Skipped</span>
  const total = categoryTotal(cat)
  if (total > 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Filled</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Not filled</span>
}

function ItemRow({ item, categoryId, defaultRate }: { item: ExpenseItem; categoryId: CategoryId; defaultRate: number }) {
  const { updateExpenseItem, removeExpenseItem } = useScenarioStore()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn('border rounded-md p-2 space-y-2 text-sm', item.skipped && 'opacity-50')}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={item.name}
          onChange={e => updateExpenseItem(categoryId, item.id, { name: e.target.value })}
          className="flex-1 min-w-0 border rounded px-2 py-1 text-xs"
        />
        <span className="text-muted-foreground shrink-0 text-xs">₹</span>
        <input
          type="number"
          min={0}
          value={item.amount || ''}
          onChange={e => updateExpenseItem(categoryId, item.id, { amount: Number(e.target.value) })}
          placeholder="0"
          className="w-24 border rounded px-2 py-1 text-xs"
        />
        <select
          value={item.frequency}
          onChange={e => updateExpenseItem(categoryId, item.id, { frequency: e.target.value as Frequency })}
          className="border rounded px-1 py-1 text-xs"
        >
          {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {item.frequency === 'every_n_years' && (
          <input
            type="number"
            min={1}
            value={item.everyNYears ?? 5}
            onChange={e => updateExpenseItem(categoryId, item.id, { everyNYears: Number(e.target.value) })}
            className="w-12 border rounded px-1 py-1 text-xs"
            title="Every N years"
          />
        )}
        <button
          type="button"
          onClick={() => setExpanded(x => !x)}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Expand item options"
        >
          <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
        </button>
        <button
          type="button"
          onClick={() => removeExpenseItem(categoryId, item.id)}
          className="text-muted-foreground hover:text-destructive p-1"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t">
          <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
            <input
              type="checkbox"
              checked={item.essential}
              onChange={e => updateExpenseItem(categoryId, item.id, { essential: e.target.checked })}
              className="w-3.5 h-3.5"
            />
            <span className="text-xs">Essential expense</span>
          </label>
          <div>
            <label className="text-xs text-muted-foreground">Start year</label>
            <input
              type="number" min={1} value={item.startYear}
              onChange={e => updateExpenseItem(categoryId, item.id, { startYear: Number(e.target.value) })}
              className="w-full border rounded px-2 py-1 text-xs mt-0.5"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">End year (blank = forever)</label>
            <input
              type="number" min={1} value={item.endYear ?? ''}
              onChange={e => updateExpenseItem(categoryId, item.id, { endYear: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="—"
              className="w-full border rounded px-2 py-1 text-xs mt-0.5"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground">
              Inflation override (blank = use category default {(defaultRate * 100).toFixed(0)}%)
            </label>
            <input
              type="number" step="0.1" min={0} max={50}
              value={item.inflationRate != null ? (item.inflationRate * 100).toFixed(1) : ''}
              onChange={e => updateExpenseItem(categoryId, item.id, { inflationRate: e.target.value ? Number(e.target.value) / 100 : undefined })}
              placeholder={`${(defaultRate * 100).toFixed(0)}`}
              className="w-full border rounded px-2 py-1 text-xs mt-0.5"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground">Notes</label>
            <input
              type="text" value={item.notes}
              onChange={e => updateExpenseItem(categoryId, item.id, { notes: e.target.value })}
              className="w-full border rounded px-2 py-1 text-xs mt-0.5"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryPanel({ cat }: { cat: ExpenseCategory }) {
  const { updateCategory, addExpenseItem } = useScenarioStore()
  const [mode, setMode] = useState<'parent' | 'items'>(
    cat.parentAmount != null && cat.parentAmount > 0 ? 'parent' : 'items'
  )

  function addCustomItem() {
    const newItem: ExpenseItem = {
      id: genId(),
      categoryId: cat.id,
      name: 'Custom expense',
      amount: 0,
      frequency: 'monthly',
      essential: false,
      appliesTo: 'household',
      startYear: 1,
      type: 'recurring',
      notes: '',
      skipped: false,
    }
    addExpenseItem(cat.id, newItem)
  }

  if (cat.skipped) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">This category is skipped.</p>
        <button
          type="button"
          onClick={() => updateCategory(cat.id, { skipped: false })}
          className="text-sm text-primary underline mt-2"
        >
          Un-skip and fill
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <p className="text-xs text-muted-foreground">{cat.description}</p>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-md w-fit">
        <button
          type="button"
          onClick={() => setMode('parent')}
          className={cn(
            'px-3 py-1 text-xs rounded transition-colors',
            mode === 'parent' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Enter total
        </button>
        <button
          type="button"
          onClick={() => setMode('items')}
          className={cn(
            'px-3 py-1 text-xs rounded transition-colors',
            mode === 'items' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Fill sub-items
        </button>
      </div>

      {mode === 'parent' ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground shrink-0">₹</span>
          <input
            type="number"
            min={0}
            value={cat.parentAmount ?? ''}
            onChange={e => updateCategory(cat.id, { parentAmount: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
            className="border rounded px-3 py-2 text-sm w-40"
          />
          <select
            value={cat.parentFrequency ?? 'monthly'}
            onChange={e => updateCategory(cat.id, { parentFrequency: e.target.value as Frequency })}
            className="border rounded px-2 py-2 text-sm"
          >
            {(['monthly', 'quarterly', 'half_yearly', 'yearly'] as Frequency[]).map(f => (
              <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-2">
          {cat.items.map(item => (
            <ItemRow key={item.id} item={item} categoryId={cat.id} defaultRate={cat.defaultInflationRate} />
          ))}
          <button
            type="button"
            onClick={addCustomItem}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 py-1 font-medium"
          >
            <Plus className="w-3 h-3" />
            Add custom item
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => updateCategory(cat.id, { skipped: true })}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        Skip this category
      </button>
    </div>
  )
}

export function StepExpenses() {
  const { categories } = useScenarioStore()
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['housing', 'food', 'healthcare']))

  function toggle(id: string) {
    setOpenCats(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const totalAnnual = categories.reduce((s, c) => s + categoryTotal(c), 0)

  return (
    <div className="space-y-4 max-w-3xl">
      <StepHeader
        title="Expenses"
        subtitle="Enter your household expenses category by category. You can enter a total for a category or break it into sub-items. Skip any category that doesn't apply."
      />

      {totalAnnual > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total annual expenses so far</span>
          <span className="text-lg font-bold text-primary">{formatCrore(totalAnnual)}</span>
        </div>
      )}

      <div className="space-y-2">
        {categories.map(cat => {
          const isOpen = openCats.has(cat.id)
          const total = categoryTotal(cat)
          return (
            <div key={cat.id} className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                  }
                  <span className="text-sm font-medium truncate">{cat.label}</span>
                  <CompletionBadge cat={cat} />
                </div>
                {total > 0 && (
                  <span className="text-sm font-semibold text-primary shrink-0 ml-2">
                    {formatCrore(total)}/yr
                  </span>
                )}
              </button>
              {isOpen && (
                <div className="border-t">
                  <CategoryPanel cat={cat} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
