import { useEffect } from 'react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { WIZARD_STEPS_CONFIG } from '@/config/formFields'
import { DynamicStepRenderer } from '@/components/wizard/DynamicStepRenderer'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { runScenarios } from '@/domain/calculations/runScenarios'
import { getStoredSettings } from '@/lib/settingsStorage'
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

const STEP_ICONS = [User, Landmark, Users, Receipt, Settings2, BarChart2]

interface WizardPageProps {
  onBackToHome?: () => void
}

export default function WizardPage({ onBackToHome }: WizardPageProps) {
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

  function handleStepClick(targetStepId: number) {
    if (targetStepId === totalSteps) {
      // Calculate using existing or default values
      const results = runScenarios({ profile, members, categories, assumptions, assets })
      setResults(results)
    }
    goToStep(targetStepId)
  }

  function handleReset() {
    if (window.confirm('Reset all values to defaults and clear saved progress?')) {
      reset()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity"
              title="Return to Home Overview"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                ₹
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-extrabold text-foreground leading-tight tracking-tight">
                  Lifetime Corpus Calculator
                </h1>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Estimate the investment corpus needed for your lifetime living expenses
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <SocialLinks />
              <ThemeToggle />

              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-border hover:bg-muted transition-all cursor-pointer shadow-xs"
                title="Reset all fields to defaults and clear storage"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="pt-3">
            {/* Mobile Progress bar & Clickable step pills */}
            <div className="sm:hidden space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">
                  Step {currentStep} of {totalSteps}: {currentStepConfig?.title}
                </span>
                <span className="text-primary">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
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
                        !isDone && !isActive && 'bg-muted/40 text-muted-foreground border-border hover:bg-muted',
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
                          !isDone && !isActive && 'border-border text-muted-foreground bg-muted/40 group-hover:border-primary/50',
                        )}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-semibold hidden md:inline truncate',
                          isActive && 'text-primary font-bold',
                          isDone && 'text-foreground',
                          !isDone && !isActive && 'text-muted-foreground group-hover:text-foreground',
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
        <footer className="border-t border-border bg-card/90 backdrop-blur-md sticky bottom-0 z-20 shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
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
