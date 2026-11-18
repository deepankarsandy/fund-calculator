import { useScenarioStore } from '@/store/useScenarioStore'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { StepProfile } from '@/components/steps/StepProfile'
import { StepHousehold } from '@/components/steps/StepHousehold'
import { StepExpenses } from '@/components/steps/StepExpenses'
import { StepAssumptions } from '@/components/steps/StepAssumptions'
import { StepAssets } from '@/components/steps/StepAssets'
import { StepResults } from '@/components/steps/StepResults'
import { runScenarios } from '@/domain/calculations/runScenarios'
import { ChevronLeft, ChevronRight, Calculator, RotateCcw } from 'lucide-react'

const STEP_COMPONENTS = [
  StepProfile,
  StepHousehold,
  StepExpenses,
  StepAssumptions,
  StepAssets,
  StepResults,
]

export default function WizardPage() {
  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    profile,
    members,
    categories,
    assumptions,
    assets,
    setResults,
    reset,
  } = useScenarioStore()

  const StepComponent = STEP_COMPONENTS[currentStep - 1]
  const isLastInputStep = currentStep === totalSteps - 1
  const isResultsStep = currentStep === totalSteps

  function handleCalculate() {
    const results = runScenarios({ profile, members, categories, assumptions, assets })
    setResults(results)
    nextStep()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Corpus Calculator
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Plan your lifetime financial independence
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
              aria-label="Reset all data and start over"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
          <WizardProgress />
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {StepComponent && <StepComponent />}
      </main>

      {/* Footer navigation */}
      {!isResultsStep && (
        <footer className="border-t bg-card sticky bottom-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <span className="text-xs text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>

            {isLastInputStep ? (
              <button
                type="button"
                onClick={handleCalculate}
                className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Calculator className="w-4 h-4" />
                Calculate
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
