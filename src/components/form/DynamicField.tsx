import { Info, Plus, Trash2, ChevronDown, Shield, Landmark } from 'lucide-react'
import { FieldConfig } from '@/config/formFields'
import { formatCrore } from '@/lib/currency'
import { cn } from '@/lib/cn'
import { setLastFilled } from '@/lib/settingsStorage'

interface DynamicFieldProps {
  field: FieldConfig
  value: any
  onChange: (value: any) => void
}

export function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const currentValue = value !== undefined ? value : field.defaultValue

  const handleFocus = () => {
    if (field.id) {
      setLastFilled(field.id)
    }
  }

  return (
    <div className="space-y-2 py-1.5">
      {/* Label and Optional indicator */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={field.id}
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"
        >
          {field.label}
        </label>
        {field.skippable && (
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/90 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
            Optional
          </span>
        )}
      </div>

      {/* Explanation text with high contrast */}
      {field.help && (
        <div className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>{field.help}</span>
        </div>
      )}

      {/* Input Widgets */}
      {field.type === 'text' && (
        <input
          id={field.id}
          type="text"
          value={currentValue ?? ''}
          placeholder={field.placeholder}
          onFocus={handleFocus}
          onChange={(e) => {
            setLastFilled(field.id)
            onChange(e.target.value)
          }}
          className="w-full h-11 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 dark:focus:border-blue-500 transition-all duration-150"
        />
      )}

      {field.type === 'number' && (
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            {field.prefix && (
              <span className="absolute left-3.5 text-sm font-bold text-zinc-500 dark:text-zinc-400 pointer-events-none">
                {field.prefix}
              </span>
            )}
            <input
              id={field.id}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              value={currentValue ?? ''}
              placeholder={field.placeholder}
              onFocus={handleFocus}
              onChange={(e) => {
                setLastFilled(field.id)
                onChange(e.target.value === '' ? '' : Number(e.target.value))
              }}
              className={cn(
                'w-full h-11 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 dark:focus:border-blue-500 transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                field.prefix ? 'pl-8' : 'pl-3.5',
                field.suffix ? 'pr-16' : 'pr-3.5'
              )}
            />
            {field.suffix && (
              <span className="absolute right-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 pointer-events-none uppercase tracking-wide">
                {field.suffix}
              </span>
            )}
          </div>
          {field.prefix === '₹' && typeof currentValue === 'number' && currentValue >= 10000 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <span>≈ {formatCrore(currentValue)}</span>
            </div>
          )}
        </div>
      )}

      {field.type === 'select' && (
        <div className="relative">
          <select
            id={field.id}
            value={currentValue ?? ''}
            onFocus={handleFocus}
            onChange={(e) => {
              setLastFilled(field.id)
              onChange(e.target.value)
            }}
            className="w-full h-11 appearance-none border border-zinc-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-10 text-sm font-medium bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 dark:focus:border-blue-500 transition-all duration-150 cursor-pointer"
          >
            {field.options?.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      )}

      {field.type === 'slider' && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              id={field.id}
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 1}
              step={field.step ?? 0.01}
              value={currentValue ?? field.defaultValue}
              onFocus={handleFocus}
              onChange={(e) => {
                setLastFilled(field.id)
                onChange(Number(e.target.value))
              }}
              className="flex-1 accent-blue-600 dark:accent-blue-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
            <div className="w-24 text-right">
              <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {field.suffix === '%'
                  ? `${(Number(currentValue) * 100).toFixed(1)}%`
                  : `${currentValue} ${field.suffix ?? ''}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {field.type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1" id={field.id}>
          {field.options?.map((opt) => {
            const isSelected = currentValue === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  setLastFilled(field.id)
                  onChange(opt.value)
                }}
                className={cn(
                  'text-left p-3.5 rounded-xl border-2 transition-all duration-150 cursor-pointer shadow-xs',
                  isSelected
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                )}
              >
                <div className="font-bold text-sm">{opt.label}</div>
                {opt.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                    {opt.description}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-3 cursor-pointer pt-1.5 p-2 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors">
          <input
            id={field.id}
            type="checkbox"
            checked={Boolean(currentValue)}
            onFocus={handleFocus}
            onChange={(e) => {
              setLastFilled(field.id)
              onChange(e.target.checked)
            }}
            className="w-4 h-4 rounded text-blue-600 dark:text-blue-500 border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {field.label}
          </span>
        </label>
      )}

      {field.type === 'array' && (
        <ArrayField
          field={field}
          items={Array.isArray(currentValue) ? currentValue : []}
          onChange={onChange}
        />
      )}
    </div>
  )
}

function ArrayField({
  field,
  items,
  onChange,
}: {
  field: FieldConfig
  items: any[]
  onChange: (items: any[]) => void
}) {
  function addItem(overrides?: Record<string, any>) {
    const newItem: Record<string, any> = {
      id: Math.random().toString(36).slice(2, 9),
    }
    field.subFields?.forEach((sub) => {
      newItem[sub.id] = sub.defaultValue
    })
    if (overrides) {
      Object.assign(newItem, overrides)
    }
    const updated = [...items, newItem]
    onChange(updated)
    setLastFilled(`${field.id}_${updated.length - 1}`)
  }

  function addInsurancePlan() {
    addItem({
      incomeType: 'insurance_plan',
      label: 'Guaranteed Income Insurance Plan',
      annualAmount: 120000,
      startYear: 1, // Explicitly starts in current year
      endYear: 20,
      inflationLinked: false,
    })
  }

  function updateItem(index: number, subId: string, val: any) {
    const copy = [...items]
    copy[index] = { ...copy[index], [subId]: val }
    onChange(copy)
    setLastFilled(`${field.id}_${index}_${subId}`)
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  const isOtherIncome = field.id === 'otherIncome'
  const isFutureContributions = field.id === 'futureContributions'

  return (
    <div className="space-y-3 pt-1" id={field.id}>
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          id={`${field.id}_${idx}`}
          className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/90 shadow-xs space-y-3 relative"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                {item.label || item.name || `Item #${idx + 1}`}
              </span>

              {/* Context Badges for Other Income */}
              {isOtherIncome && (
                <>
                  {item.incomeType === 'insurance_plan' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                      <Shield className="w-2.5 h-2.5" />
                      Insurance Policy
                    </span>
                  )}
                  {item.incomeType === 'nps_annuity' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                      <Landmark className="w-2.5 h-2.5" />
                      NPS Annuity
                    </span>
                  )}
                  {item.startYear === 1 ? (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      ● Starts in Current Year
                    </span>
                  ) : item.startYear > 1 ? (
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                      Starts in Year {item.startYear}
                    </span>
                  ) : null}
                </>
              )}

              {/* Context Badges for Future Lump Sums */}
              {isFutureContributions && (
                <>
                  {item.year != null && (
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full">
                      Year {item.year}
                    </span>
                  )}
                  {typeof item.label === 'string' && item.label.toLowerCase().includes('epf') && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      EPFO 8.25%
                    </span>
                  )}
                  {typeof item.label === 'string' && item.label.toLowerCase().includes('nps') && (
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                      Tax-Free 60%
                    </span>
                  )}
                </>
              )}
            </div>

            {item.id !== 'self' && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {field.subFields?.map((sub) => (
              <DynamicField
                key={sub.id}
                field={{ ...sub, id: `${field.id}_${idx}_${sub.id}` }}
                value={item[sub.id]}
                onChange={(val) => updateItem(idx, sub.id, val)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {isOtherIncome ? (
          <>
            <button
              type="button"
              onClick={addInsurancePlan}
              className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Add a custom insurance-linked retirement plan or guaranteed income policy starting in the current year"
            >
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>+ Add Insurance Plan (Starts Current Year)</span>
            </button>

            <button
              type="button"
              onClick={() => addItem()}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Other Income Source</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => addItem()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{field.addButtonText || '+ Add Item'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
