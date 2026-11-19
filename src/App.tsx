import { useEffect } from 'react'
import { useRouter } from '@/lib/router'
import { useScenarioStore } from '@/store/useScenarioStore'
import HomePage from '@/pages/HomePage'
import WizardPage from '@/pages/WizardPage'
import FeaturesAndLogicPage from '@/pages/FeaturesAndLogicPage'

export default function App() {
  const { route, navigateToHome, navigateToLogic, navigateToCalculator, navigateBack } = useRouter()
  const { currentStep, goToStep } = useScenarioStore()

  // Sync route step with store when navigating via URL/history
  useEffect(() => {
    if (route.page === 'calculator') {
      const step = route.step ?? currentStep ?? 1
      if (step !== currentStep) {
        goToStep(step)
      }
    }
  }, [route.page, route.step, currentStep, goToStep])

  if (route.page === 'logic') {
    return (
      <FeaturesAndLogicPage
        onBack={navigateBack}
        onStartWizard={() => navigateToCalculator(currentStep || 1)}
        onHome={navigateToHome}
      />
    )
  }

  if (route.page === 'calculator') {
    return (
      <WizardPage
        onBackToHome={navigateToHome}
        onViewLogic={navigateToLogic}
      />
    )
  }

  return (
    <HomePage
      onStart={() => navigateToCalculator(currentStep || 1)}
      onViewLogic={navigateToLogic}
      onHome={navigateToHome}
    />
  )
}
