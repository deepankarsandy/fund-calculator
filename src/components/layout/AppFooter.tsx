import { ShieldCheck, Calculator, ArrowUp, AlertCircle, Sparkles } from 'lucide-react'
import { SocialLinks } from '@/components/ui/SocialLinks'
import {
  navigateToHome,
  navigateToCalculator,
  navigateToSIP,
  navigateToInvestment,
  navigateToFD,
  navigateToLoanEMI,
  navigateToLogic,
  navigateToProfile,
  navigateToExportImport,
} from '@/lib/router'

export function AppFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-border bg-card/70 backdrop-blur-xs text-foreground mt-auto">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-8 space-y-8">
        {/* Top Grid: Brand & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Socials */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigateToHome()}
                className="flex items-center gap-2.5 text-left cursor-pointer group"
                title="Return to Home"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-xs group-hover:bg-blue-700 transition-colors">
                  ₹
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-tight tracking-tight">
                    Fund Calculator
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Personal Financial Planning Suite
                  </p>
                </div>
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Open-source, client-side financial planning tools tailored for Indian households.
              Estimates inflation-adjusted retirement corpus requirements, active savings, loan
              EMIs, and compound wealth accumulation.
            </p>

            {/* Social Links */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Connect with Developer
              </span>
              <SocialLinks />
            </div>
          </div>

          {/* Col 2: Financial Calculators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Calculators</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToCalculator(1)}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Retirement Fund</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Flagship
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToSIP()}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  SIP & Step-Up Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToInvestment()}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Custom Plan & CAGR
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToFD()}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Fixed Deposit (FD) & PPF
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToLoanEMI()}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Loan EMI & Prepayment
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Resources</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToLogic()}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Calculation Logic & Formulas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToProfile()}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  User Profile & City Defaults
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToExportImport()}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Backup & Restore (JSON)
                </button>
              </li>
              <li>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mt-2">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Local & Private</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Callout Box */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs text-muted-foreground space-y-1.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Important Disclaimer</span>
          </div>
          <p className="text-[11px] sm:text-xs leading-relaxed text-muted-foreground/90 font-normal">
            This application is an estimation and scenario planning tool created for educational and
            illustrative purposes only. It is not regulated financial advice, investment advisory,
            or a guarantee of future returns or safe withdrawal rates under SEBI regulations or
            Indian law. Assumptions such as inflation rates, market returns, and life expectancy are
            user-configurable. Always consult a SEBI-registered Investment Adviser (RIA) or
            certified financial planner before making financial commitments.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="text-center sm:text-left text-[11px]">
            © {new Date().getFullYear()} Fund Calculator · Open Source Personal Financial Planning
            Suite. All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
            title="Scroll to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  )
}
