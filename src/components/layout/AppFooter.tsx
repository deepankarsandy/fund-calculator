import { ArrowUp, AlertCircle } from 'lucide-react'
import { SocialLinks } from '@/components/ui/SocialLinks'

export function AppFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-border bg-card/70 backdrop-blur-xs text-foreground mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
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

        {/* Bottom Bar: Copyright, Social Links & Back to Top */}
        <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="text-center md:text-left text-[11px] sm:text-xs">
            © {new Date().getFullYear()} Fund Calculator · Open Source Personal Financial Planning
            Suite. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <SocialLinks />
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
      </div>
    </footer>
  )
}
