import { useEffect } from 'react'
import { useRouter } from '@/lib/router'
import { useScenarioStore } from '@/store/useScenarioStore'
import { useHeaderStore } from '@/store/useHeaderStore'
import { AppHeader } from '@/components/layout/AppHeader'
import HomePage from '@/pages/HomePage'
import WizardPage from '@/pages/WizardPage'
import FeaturesAndLogicPage from '@/pages/FeaturesAndLogicPage'
import SipCalculatorPage from '@/pages/SipCalculatorPage'
import InvestmentCalculatorPage from '@/pages/InvestmentCalculatorPage'
import FdCalculatorPage from '@/pages/FdCalculatorPage'
import LoanEmiCalculatorPage from '@/pages/LoanEmiCalculatorPage'
import ProfilePage from '@/pages/ProfilePage'

export default function App() {
  const {
    route,
    navigateToHome,
    navigateToLogic,
    navigateToCalculator,
    navigateToSIP,
    navigateToInvestment,
    navigateToFD,
    navigateToLoanEMI,
    navigateToProfile,
    navigateBack,
  } = useRouter()

  const { currentStep, goToStep } = useScenarioStore()
  const setHeaderForPage = useHeaderStore((s) => s.setHeaderForPage)

  // Sync header state with current route
  useEffect(() => {
    setHeaderForPage(route.page)
  }, [route.page, setHeaderForPage])

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

  const renderPage = () => {
    switch (route.page) {
      case 'profile':
        return <ProfilePage onBackToHome={navigateToHome} />
      case 'interest':
        return <LoanEmiCalculatorPage onBackToHome={navigateToHome} />
      case 'fd':
        return <FdCalculatorPage onBackToHome={navigateToHome} />
      case 'investment':
        return <InvestmentCalculatorPage onBackToHome={navigateToHome} />
      case 'sip':
        return <SipCalculatorPage onBackToHome={navigateToHome} />
      case 'logic':
        return (
          <FeaturesAndLogicPage
            onBack={navigateBack}
            onStartWizard={() => navigateToCalculator(currentStep || 1)}
            onHome={navigateToHome}
          />
        )
      case 'calculator':
        return (
          <WizardPage
            onBackToHome={navigateToHome}
            onViewLogic={navigateToLogic}
          />
        )
      case 'home':
      default:
        return (
          <HomePage
            onStart={() => navigateToCalculator(currentStep || 1)}
            onSelectCalculator={handleSelectCalculator}
            onViewLogic={navigateToLogic}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      <AppHeader
        onBackToHome={navigateToHome}
        onSelectCalculator={handleSelectCalculator}
        onViewLogic={navigateToLogic}
      />
      {renderPage()}
    </div>
  )
}
