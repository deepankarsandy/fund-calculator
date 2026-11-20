import { useScenarioStore } from '@/store/useScenarioStore'
import { WIZARD_STEPS_CONFIG } from '@/config/formFields'
import { runScenarios } from '@/domain/calculations/runScenarios'
import { Check, User, Landmark, Users, Receipt, Settings2, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const STEP_ICONS = [User, Landmark, Users, Receipt, Settings2, BarChart2]

export function WizardStepper() {
  const {
    currentStep,
    totalSteps,
    goToStep,
    profile,
    members,
    categories,
    assumptions,
    assets,
    setResults,
  } = useScenarioStore()

  const currentStepConfig = WIZARD_STEPS_CONFIG[currentStep - 1]

  function handleStepClick(targetStepId: number) {
    if (targetStepId === totalSteps) {
      const results = runScenarios({ profile, members, categories, assumptions, assets })
      setResults(results)
    }
    goToStep(targetStepId)
  }

  return (
    <>
      {/* Mobile Progress bar & Clickable step pills */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-foreground">
            Step {currentStep} of {totalSteps}: {currentStepConfig?.title}
          </span>
          <span className="text-primary">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        {/* Clickable Mobile Pills */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          {WIZARD_STEPS_CONFIG.map((step) => {
            const isDone = currentStep > step.id
            const isActive = currentStep === step.id
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  'flex-1 py-1 rounded-md text-center text-[11px] font-bold border transition-all cursor-pointer',
                  isActive && 'bg-primary text-primary-foreground border-primary shadow-xs',
                  isDone && 'bg-primary/10 text-primary border-primary/30',
                  !isDone &&
                    !isActive &&
                    'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                )}
                title={`Jump to Step ${step.id}: ${step.title}`}
              >
                {step.id}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop / Tablet Steps */}
      <div className="hidden sm:flex items-center justify-between pt-1">
        {WIZARD_STEPS_CONFIG.map((step, idx) => {
          const isDone = currentStep > step.id
          const isActive = currentStep === step.id
          const Icon = STEP_ICONS[idx % STEP_ICONS.length]

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                className="flex items-center gap-2 group text-left cursor-pointer transition-all hover:opacity-85"
                title={`Jump to Step ${step.id}: ${step.title}`}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    isDone && 'bg-primary border-primary text-primary-foreground shadow-xs',
                    isActive && 'border-primary text-primary bg-primary/10 ring-2 ring-primary/20',
                    !isDone &&
                      !isActive &&
                      'border-border text-muted-foreground bg-muted/40 group-hover:border-primary/50'
                  )}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold hidden md:inline truncate',
                    isActive && 'text-primary font-bold',
                    isDone && 'text-foreground',
                    !isDone && !isActive && 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {step.title.split('&')[0]}
                </span>
              </button>

              {idx < WIZARD_STEPS_CONFIG.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 transition-colors',
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
