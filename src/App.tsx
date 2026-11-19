import { useState, useEffect } from 'react'
import HomePage from '@/pages/HomePage'
import WizardPage from '@/pages/WizardPage'
import FeaturesAndLogicPage from '@/pages/FeaturesAndLogicPage'

export default function App() {
  const [view, setView] = useState<'home' | 'wizard' | 'logic'>('home')
  const [previousView, setPreviousView] = useState<'home' | 'wizard'>('home')

  // Support URL hash synchronization for deep linking and back button support
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase()
      if (
        hash === '#logic' ||
        hash === '#features' ||
        hash === '#features-and-logic' ||
        hash === '#methodology'
      ) {
        setView('logic')
      } else if (hash === '#wizard' || hash === '#calculator') {
        setView('wizard')
      } else if (hash === '#home' || hash === '') {
        setView('home')
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const handleStartWizard = () => {
    window.location.hash = 'wizard'
    setView('wizard')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    window.location.hash = ''
    setView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewLogic = (from: 'home' | 'wizard') => {
    setPreviousView(from)
    window.location.hash = 'features-and-logic'
    setView('logic')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromLogic = () => {
    if (previousView === 'wizard') {
      window.location.hash = 'wizard'
      setView('wizard')
    } else {
      window.location.hash = ''
      setView('home')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (view === 'logic') {
    return (
      <FeaturesAndLogicPage
        onBack={handleBackFromLogic}
        onStartWizard={handleStartWizard}
      />
    )
  }

  if (view === 'home') {
    return (
      <HomePage
        onStart={handleStartWizard}
        onViewLogic={() => handleViewLogic('home')}
      />
    )
  }

  return (
    <WizardPage
      onBackToHome={handleBackToHome}
      onViewLogic={() => handleViewLogic('wizard')}
    />
  )
}
