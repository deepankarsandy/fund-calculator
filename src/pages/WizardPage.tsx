import { useEffect } from 'react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { WIZARD_STEPS_CONFIG } from '@/config/formFields'
import { DynamicStepRenderer } from '@/components/wizard/DynamicStepRenderer'
import { runScenarios } from '@/domain/calculations/runScenarios'
import { getStoredSettings } from '@/lib/settingsStorage'
import { ChevronLeft, ChevronRight, Calculator, RotateCcw, Sparkles, ArrowLeft } from 'lucide-react'

interface WizardPageProps {
  onBackToHome?: () => void
  onViewLogic?: () => void
  onSelectCalculator?: (id: string) => void
}

export default function WizardPage({ onBackToHome, onViewLogic }: WizardPageProps) {
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
    results,
    setResults,
    reset,
    applyProfileDefaults,
  } = useScenarioStore()

  const currentStepConfig = WIZARD_STEPS_CONFIG[currentStep - 1]
  const isLastInputStep = currentStep === totalSteps - 1
  const isResultsStep = currentStep === totalSteps

  // Auto-calculate if deep-linking directly to results step
  useEffect(() => {
    if (currentStep === totalSteps && !results) {
      const computed = runScenarios({ profile, members, categories, assumptions, assets })
      setResults(computed)
    }
  }, [
    currentStep,
    totalSteps,
    results,
    profile,
    members,
    categories,
    assumptions,
    assets,
    setResults,
  ])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  useEffect(() => {
    const settings = getStoredSettings()
    if (settings.lastFilledId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(settings.lastFilledId!)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  function handleCalculate() {
    const results = runScenarios({ profile, members, categories, assumptions, assets })
    setResults(results)
    nextStep()
  }

  function handleReset() {
    if (window.confirm('Reset all values to defaults and clear saved progress?')) {
      reset()
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Step Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 space-y-6">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyProfileDefaults()}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
                title="Populate baseline values from your saved User Profile (Age, Retirement, Inflation, Assets)"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Auto-set from Profile</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
                title="Reset all inputs to Indian defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>
        </div>

        {currentStepConfig && (
          <DynamicStepRenderer step={currentStepConfig} onViewLogic={onViewLogic} />
        )}
      </main>

      {/* Footer Navigation */}
      {!isResultsStep && (
        <footer className="border-t border-border bg-card/90 backdrop-blur-md sticky bottom-0 z-20 shadow-md">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={currentStep === 1 ? onBackToHome : prevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors cursor-pointer shadow-xs"
              title={currentStep === 1 ? 'Return to Home Overview' : 'Go to previous step'}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Home' : 'Back'}</span>
            </button>

            <span className="text-xs text-muted-foreground font-semibold">
              Step {currentStep} of {totalSteps}
            </span>

            {isLastInputStep ? (
              <button
                type="button"
                onClick={handleCalculate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate Corpus</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
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
