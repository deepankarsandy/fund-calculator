import { useState } from 'react'
import HomePage from '@/pages/HomePage'
import WizardPage from '@/pages/WizardPage'

export default function App() {
  const [view, setView] = useState<'home' | 'wizard'>('home')

  if (view === 'home') {
    return <HomePage onStart={() => setView('wizard')} />
  }

  return <WizardPage onBackToHome={() => setView('home')} />
}
