import { Check, User, Users, Receipt, Settings2, Landmark, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useScenarioStore } from '@/store/useScenarioStore'

const STEPS = [
  { id: 1, label: 'Profile', icon: User },
  { id: 2, label: 'Household', icon: Users },
  { id: 3, label: 'Expenses', icon: Receipt },
  { id: 4, label: 'Assumptions', icon: Settings2 },
  { id: 5, label: 'Assets', icon: Landmark },
  { id: 6, label: 'Results', icon: BarChart2 },
]

export function WizardProgress() {
  const { currentStep, goToStep } = useScenarioStore()

  return (
    <div className="w-full">
      {/* Mobile: compact progress bar */}
      <div className="sm:hidden px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round((currentStep / STEPS.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: step circles */}
      <div className="hidden sm:flex items-center justify-center px-6 py-4 gap-0">
        {STEPS.map((step, idx) => {
          const isDone = currentStep > step.id
          const isActive = currentStep === step.id
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isDone && goToStep(step.id)}
                disabled={!isDone}
                className={cn(
                  'flex flex-col items-center gap-1 group',
                  isDone && 'cursor-pointer',
                  !isDone && 'cursor-default',
                )}
                aria-label={`${isDone ? 'Go to' : ''} Step ${step.id}: ${step.label}`}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                    isDone && 'bg-primary border-primary text-primary-foreground',
                    isActive && 'bg-primary/10 border-primary text-primary',
                    !isDone && !isActive && 'bg-muted border-border text-muted-foreground',
                    isDone && 'group-hover:opacity-80',
                  )}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    isActive && 'text-primary',
                    isDone && 'text-primary',
                    !isDone && !isActive && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-12 mx-1 mt-[-18px] transition-colors duration-200',
                    currentStep > step.id ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
