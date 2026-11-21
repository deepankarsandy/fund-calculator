import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StepHeaderProps {
  title: string
  subtitle: string
  onSkip?: () => void
  skipLabel?: string
  className?: string
}

export function StepHeader({
  title,
  subtitle,
  onSkip,
  skipLabel = 'Skip this step',
  className,
}: StepHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="calc-helper-text calc-clean-hide text-sm text-muted-foreground mt-1 max-w-prose">
          {subtitle}
        </p>
      </div>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 whitespace-nowrap shrink-0 mt-1"
        >
          {skipLabel}
        </button>
      )}
    </div>
  )
}

interface FieldGroupProps {
  label: string
  htmlFor?: string
  help?: string
  error?: string
  children: ReactNode
  className?: string
}

export function FieldGroup({ label, htmlFor, help, error, children, className }: FieldGroupProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
      </label>
      {help && (
        <p className="calc-helper-text calc-clean-hide text-xs text-muted-foreground">{help}</p>
      )}
      {children}
      {error && <p className="calc-error text-xs text-destructive">{error}</p>}
    </div>
  )
}
