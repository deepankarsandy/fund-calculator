import { Info, Plus, Trash2 } from 'lucide-react'
import { FieldConfig } from '@/config/formFields'
import { formatCrore } from '@/lib/currency'
import { cn } from '@/lib/cn'

interface DynamicFieldProps {
  field: FieldConfig
  value: any
  onChange: (value: any) => void
  onSkip?: () => void
}

export function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const currentValue = value !== undefined ? value : field.defaultValue

  return (
    <div className="space-y-1.5 py-2">
      {/* Label and Help */}
      <div className="flex items-start justify-between gap-2">
        <label
          htmlFor={field.id}
          className="text-sm font-semibold text-foreground flex items-center gap-1.5"
        >
          {field.label}
        </label>
        {field.skippable && (
          <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Optional
          </span>
        )}
      </div>

      {field.help && (
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md">
          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>{field.help}</span>
        </div>
      )}

      {/* Field Input based on type */}
      {field.type === 'text' && (
        <input
          id={field.id}
          type="text"
          value={currentValue ?? ''}
          placeholder={field.placeholder}
          onChange={e => onChange(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      )}

      {field.type === 'number' && (
        <div className="space-y-1">
          <div className="relative flex items-center">
            {field.prefix && (
              <span className="absolute left-3 text-sm font-medium text-muted-foreground pointer-events-none">
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
              onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
              className={cn(
                'w-full border rounded-lg py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
                field.prefix ? 'pl-7' : 'pl-3',
                field.suffix ? 'pr-12' : 'pr-3',
              )}
            />
            {field.suffix && (
              <span className="absolute right-3 text-xs text-muted-foreground pointer-events-none">
                {field.suffix}
              </span>
            )}
          </div>
          {field.prefix === '₹' && typeof currentValue === 'number' && currentValue >= 10000 && (
            <p className="text-xs text-primary font-medium pl-1">
              ≈ {formatCrore(currentValue)}
            </p>
          )}
        </div>
      )}

      {field.type === 'select' && (
        <select
          id={field.id}
          value={currentValue ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        >
          {field.options?.map(opt => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'slider' && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-3">
            <input
              id={field.id}
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 1}
              step={field.step ?? 0.01}
              value={currentValue ?? field.defaultValue}
              onChange={e => onChange(Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer"
            />
            <div className="w-24 text-right">
              <span className="font-semibold text-sm">
                {field.suffix === '%'
                  ? `${(Number(currentValue) * 100).toFixed(1)}%`
                  : `${currentValue} ${field.suffix ?? ''}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {field.type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {field.options?.map(opt => {
            const isSelected = currentValue === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  'text-left p-3 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40 text-foreground',
                )}
              >
                <div className="font-semibold text-sm">{opt.label}</div>
                {opt.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {opt.description}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-2 cursor-pointer pt-1 text-sm text-foreground">
          <input
            id={field.id}
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={e => onChange(e.target.checked)}
            className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
          />
          <span>{field.label}</span>
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
  function addItem() {
    const newItem: Record<string, any> = {
      id: Math.random().toString(36).slice(2, 9),
    }
    field.subFields?.forEach(sub => {
      newItem[sub.id] = sub.defaultValue
    })
    onChange([...items, newItem])
  }

  function updateItem(index: number, subId: string, val: any) {
    const copy = [...items]
    copy[index] = { ...copy[index], [subId]: val }
    onChange(copy)
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3 pt-1">
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="border rounded-lg p-3 bg-card space-y-3 relative group"
        >
          <div className="flex items-center justify-between pb-1 border-b">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.label || item.name || `Item #${idx + 1}`}
            </span>
            {item.id !== 'self' && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-muted-foreground hover:text-destructive p-1 rounded"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {field.subFields?.map(sub => (
              <DynamicField
                key={sub.id}
                field={sub}
                value={item[sub.id]}
                onChange={val => updateItem(idx, sub.id, val)}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {field.addButtonText || '+ Add Item'}
      </button>
    </div>
  )
}
