import { useEffect } from 'react'
import { useRouter } from '@/lib/router'
import { useScenarioStore } from '@/store/useScenarioStore'
import HomePage from '@/pages/HomePage'
import WizardPage from '@/pages/WizardPage'
import FeaturesAndLogicPage from '@/pages/FeaturesAndLogicPage'
import SipCalculatorPage from '@/pages/SipCalculatorPage'
import InvestmentCalculatorPage from '@/pages/InvestmentCalculatorPage'
import FdCalculatorPage from '@/pages/FdCalculatorPage'
import LoanEmiCalculatorPage from '@/pages/LoanEmiCalculatorPage'
import ProfilePage from '@/pages/ProfilePage'

export default function App() {
  const { route, navigateToHome, navigateToLogic, navigateToCalculator, navigateToSIP, navigateToInvestment, navigateToFD, navigateToLoanEMI, navigateToProfile, navigateBack } = useRouter()
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

  const handleSelectCalculator = (id: string) => {
    if (id === 'fund') {
      navigateToCalculator(currentStep || 1)
    } else if (id === 'sip') {
      navigateToSIP()
    } else if (id === 'investment') {
      navigateToInvestment()
    } else if (id === 'fd') {
      navigateToFD()
    } else if (id === 'interest') {
      navigateToLoanEMI()
    } else if (id === 'profile') {
      navigateToProfile()
    }
  }

  if (route.page === 'profile') {
    return (
      <ProfilePage
        onBackToHome={navigateToHome}
        onSelectCalculator={handleSelectCalculator}
        onViewLogic={navigateToLogic}
      />
    )
  }

  if (route.page === 'interest') {
    return (
      <LoanEmiCalculatorPage
        onBackToHome={navigateToHome}
        onSelectCalculator={handleSelectCalculator}
        onViewLogic={navigateToLogic}
      />
    )
  }

  if (route.page === 'fd') {
    return (
      <FdCalculatorPage
        onBackToHome={navigateToHome}
        onSelectCalculator={handleSelectCalculator}
        onViewLogic={navigateToLogic}
      />
    )
  }

  if (route.page === 'investment') {
    return (
      <InvestmentCalculatorPage
        onBackToHome={navigateToHome}
        onSelectCalculator={handleSelectCalculator}
        onViewLogic={navigateToLogic}
      />
    )
  }

  if (route.page === 'sip') {
    return (
      <SipCalculatorPage
        onBackToHome={navigateToHome}
        onSelectCalculator={handleSelectCalculator}
        onViewLogic={navigateToLogic}
      />
    )
  }

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
        onSelectCalculator={handleSelectCalculator}
        onViewLogic={navigateToLogic}
      />
    )
  }

  return (
    <HomePage
      onStart={() => navigateToCalculator(currentStep || 1)}
      onSelectCalculator={handleSelectCalculator}
      onViewLogic={navigateToLogic}
      onHome={navigateToHome}
    />
  )
}
