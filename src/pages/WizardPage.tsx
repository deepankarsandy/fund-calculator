import { useScenarioStore } from '@/store/useScenarioStore'
import { WIZARD_STEPS_CONFIG } from '@/config/formFields'
import { DynamicStepRenderer } from '@/components/wizard/DynamicStepRenderer'
import { runScenarios } from '@/domain/calculations/runScenarios'
import {
  ChevronLeft,
  ChevronRight,
  Calculator,
  RotateCcw,
  Check,
  User,
  Users,
  Receipt,
  Settings2,
  Landmark,
  BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const STEP_ICONS = [User, Users, Receipt, Settings2, Landmark, BarChart2]

export default function WizardPage() {
  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    profile,
    members,
    categories,
    assumptions,
    assets,
    setResults,
    reset,
  } = useScenarioStore()

  const currentStepConfig = WIZARD_STEPS_CONFIG[currentStep - 1]
  const isLastInputStep = currentStep === totalSteps - 1
  const isResultsStep = currentStep === totalSteps

  function handleCalculate() {
    const results = runScenarios({ profile, members, categories, assumptions, assets })
    setResults(results)
    nextStep()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                ₹
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">
                  Lifetime Corpus Calculator
                </h1>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Estimate the investment corpus needed for your lifetime living expenses
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border hover:bg-muted transition-colors"
              title="Reset all fields to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="pt-3">
            {/* Mobile Progress bar */}
            <div className="sm:hidden space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">
                  Step {currentStep} of {totalSteps}: {currentStepConfig?.title}
                </span>
                <span className="text-muted-foreground">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Desktop / Tablet Steps */}
            <div className="hidden sm:flex items-center justify-between">
              {WIZARD_STEPS_CONFIG.map((step, idx) => {
                const isDone = currentStep > step.id
                const isActive = currentStep === step.id
                const Icon = STEP_ICONS[idx % STEP_ICONS.length]

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => isDone && goToStep(step.id)}
                      disabled={!isDone}
                      className={cn(
                        'flex items-center gap-2 group text-left cursor-default transition-all',
                        isDone && 'cursor-pointer hover:opacity-80',
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                          isDone && 'bg-primary border-primary text-primary-foreground',
                          isActive && 'border-primary text-primary bg-primary/10',
                          !isDone && !isActive && 'border-border text-muted-foreground bg-muted/40',
                        )}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium hidden md:inline truncate',
                          isActive && 'text-primary font-bold',
                          isDone && 'text-foreground font-semibold',
                          !isDone && !isActive && 'text-muted-foreground',
                        )}
                      >
                        {step.title.split('&')[0]}
                      </span>
                    </button>

                    {idx < WIZARD_STEPS_CONFIG.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1 mx-2 transition-colors',
                          currentStep > step.id ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Step Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {currentStepConfig && <DynamicStepRenderer step={currentStepConfig} />}
      </main>

      {/* Footer Navigation */}
      {!isResultsStep && (
        <footer className="border-t bg-card sticky bottom-0 z-20 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span className="text-xs text-muted-foreground font-medium">
              Step {currentStep} of {totalSteps}
            </span>

            {isLastInputStep ? (
              <button
                type="button"
                onClick={handleCalculate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate Corpus</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
