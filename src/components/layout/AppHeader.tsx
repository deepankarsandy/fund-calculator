import { ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { CalculatorsDropdown } from '@/components/ui/CalculatorsDropdown'
import { ProfileHeaderButton } from '@/components/profile/ProfileHeaderButton'
import { WizardStepper } from '@/components/wizard/WizardStepper'
import { useHeaderStore } from '@/store/useHeaderStore'

interface AppHeaderProps {
  onBackToHome: () => void
  onSelectCalculator: (id: string) => void
  onViewLogic: () => void
}

export function AppHeader({ onBackToHome, onSelectCalculator, onViewLogic }: AppHeaderProps) {
  const { title, subtitle, currentActive, showPrivateBadge, showStepper } = useHeaderStore()

  const handleHomeClick = () => {
    onBackToHome()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="Fund Calculator Home"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              ₹
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-extrabold text-foreground leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">{subtitle}</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {showPrivateBadge && (
              <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Local & Private</span>
              </div>
            )}

            <CalculatorsDropdown
              currentActive={currentActive}
              onSelectCalculator={onSelectCalculator}
              onViewLogic={onViewLogic}
            />

            <SocialLinks />
            <ThemeToggle />

            {/* Profile Button - Right Most Side */}
            <ProfileHeaderButton />
          </div>
        </div>

        {/* Stepper for Calculator route */}
        {showStepper && (
          <div className="pt-3">
            <WizardStepper />
          </div>
        )}
      </div>
    </header>
  )
}
