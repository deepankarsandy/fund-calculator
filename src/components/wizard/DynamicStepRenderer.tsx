import { WizardStepConfig } from '@/config/formFields'
import { DynamicField } from '@/components/form/DynamicField'
import { DynamicExpensesRenderer } from '@/components/expenses/DynamicExpensesRenderer'
import { StepResults } from '@/components/steps/StepResults'
import { useScenarioStore } from '@/store/useScenarioStore'
import { Info } from 'lucide-react'

interface DynamicStepRendererProps {
  step: WizardStepConfig
  onViewLogic?: () => void
}

export function DynamicStepRenderer({ step, onViewLogic }: DynamicStepRendererProps) {
  const store = useScenarioStore()
  const { setStepFieldValue, nextStep } = store

  // Specialized view for step 3 (Expenses)
  if (step.key === 'expenses') {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
            {step.skippable && (
              <button
                type="button"
                onClick={nextStep}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
              >
                {step.skipLabel || 'Skip this step'}
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{step.subtitle}</p>
        </div>
        <DynamicExpensesRenderer />
      </div>
    )
  }

  // Specialized view for step 6 (Results)
  if (step.key === 'results') {
    return <StepResults onViewLogic={onViewLogic} />
  }

  // For Profile, Household, Assumptions, Assets:
  // Get relevant state slice
  let currentSlice: any = {}
  if (step.key === 'profile') currentSlice = store.profile
  else if (step.key === 'household') currentSlice = { members: store.members }
  else if (step.key === 'assumptions') currentSlice = store.assumptions
  else if (step.key === 'assets') currentSlice = store.assets

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
          {step.skippable && (
            <button
              type="button"
              onClick={nextStep}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
            >
              {step.skipLabel || 'Skip this step'}
            </button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{step.subtitle}</p>
      </div>

      {step.key === 'assets' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Indian Retirement Calibration Active (EPF, NPS & Insurance Plans)
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
              EPF maturity is calculated at official 8.25% p.a. EPFO compound. NPS Tier-1 models 10%
              CAGR accumulation with statutory 40% annuity (at 6% p.a. lifetime pension starting
              post-retirement). You can also add custom insurance-linked retirement plans that start
              paying from the <strong>current year</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Fields Grid / Loop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {step.fields.map((field) => {
          const isWide =
            field.type === 'array' ||
            field.type === 'radio' ||
            field.id === 'lifestyleScenario' ||
            field.id === 'otherIncome' ||
            field.id === 'futureContributions'

          return (
            <div key={field.id} className={isWide ? 'md:col-span-2' : 'md:col-span-1'}>
              <DynamicField
                field={field}
                value={currentSlice[field.id]}
                onChange={(val) => setStepFieldValue(step.key, field.id, val)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
