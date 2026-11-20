import { useEffect, lazy, Suspense } from 'react'
import { useRouter } from '@/lib/router'
import { useScenarioStore } from '@/store/useScenarioStore'
import { useHeaderStore } from '@/store/useHeaderStore'
import { AppHeader } from '@/components/layout/AppHeader'

// Dynamic lazy loaded pages for route-based chunk splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const WizardPage = lazy(() => import('@/pages/WizardPage'))
const FeaturesAndLogicPage = lazy(() => import('@/pages/FeaturesAndLogicPage'))
const SipCalculatorPage = lazy(() => import('@/pages/SipCalculatorPage'))
const InvestmentCalculatorPage = lazy(() => import('@/pages/InvestmentCalculatorPage'))
const FdCalculatorPage = lazy(() => import('@/pages/FdCalculatorPage'))
const LoanEmiCalculatorPage = lazy(() => import('@/pages/LoanEmiCalculatorPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

function PageFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] py-16">
      <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide">Loading page...</p>
      </div>
    </div>
  )
}

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
        return <WizardPage onBackToHome={navigateToHome} onViewLogic={navigateToLogic} />
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
      <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>
    </div>
  )
}
