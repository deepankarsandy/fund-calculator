import { UserCheck, Sliders, ArrowRight } from 'lucide-react'
import { useUserProfile } from '@/lib/userProfileStorage'
import { formatINR } from '@/lib/currency'

interface HomePageProfileBannerProps {
  onOpenProfile: () => void
}

export function HomePageProfileBanner({ onOpenProfile }: HomePageProfileBannerProps) {
  const { profile, isConfigured } = useUserProfile()

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50/90 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900/40 p-4 sm:p-5 shadow-sm transition-all hover:border-blue-500/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                  {isConfigured && profile.name
                    ? `Welcome back, ${profile.name}!`
                    : 'Personalize Your Financial Profile & Baseline Defaults'}
                </h3>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {isConfigured ? 'Profile Active' : '1-Time Setup'}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {isConfigured
                  ? 'Your baseline DOB, retirement age, sector-wise inflation, tax brackets, and investments are automatically pre-filled across all 5 calculators.'
                  : 'Set your DOB, retirement age, sector-specific inflation %, income tax bracket, PF, and NPS once. All 5 calculators auto-fill without asking each time.'}
              </p>

              {/* Active Profile Summary Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[11px] font-semibold text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-card/80 border border-border text-foreground">
                  Age:{' '}
                  <strong className="text-blue-600 dark:text-blue-400">{profile.currentAge}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-card/80 border border-border text-foreground">
                  Retire:{' '}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {profile.retirementAge}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-card/80 border border-border text-foreground">
                  Inflation:{' '}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {profile.overallInflationRate}%
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-card/80 border border-border text-foreground">
                  LTCG:{' '}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {profile.ltcgTaxRate}%
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-card/80 border border-border text-foreground">
                  Tax Slab:{' '}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {profile.incomeTaxBracket}%
                  </strong>
                </span>
                {profile.monthlyIncome > 0 && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-card/80 border border-border text-foreground">
                    Income:{' '}
                    <strong className="text-blue-600 dark:text-blue-400">
                      {formatINR(profile.monthlyIncome)}/mo
                    </strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-2 group"
            >
              <Sliders className="w-4 h-4 text-white" />
              <span>{isConfigured ? 'Edit Profile Defaults' : 'Set Profile Defaults'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
