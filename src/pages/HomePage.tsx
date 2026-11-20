import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Scale,
  FileText,
  Lock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Coins,
  ChevronRight,
  Calculator,
  BookOpen,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'

interface HomePageProps {
  onStart: () => void
  onViewLogic?: () => void
  onHome?: () => void
}

export default function HomePage({ onStart, onViewLogic, onHome }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (onHome) onHome()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="Lifetime Corpus Calculator"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              ₹
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-extrabold text-foreground leading-tight tracking-tight">
                Lifetime Corpus Calculator
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">
                India-Calibrated Living Cost & Retirement Modeling
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Local & Private</span>
            </div>
            {onViewLogic && (
              <button
                type="button"
                onClick={onViewLogic}
                className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="View Calculation Formulas & Logic"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Calc Logic</span>
              </button>
            )}
            <SocialLinks />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-14 space-y-14">
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Built for Indian Households · Inflation Adjusted · Frugal to Luxury</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            Know Your Lifetime Number. <br className="hidden sm:inline" />
            <span className="text-blue-600 dark:text-blue-400">Plan Your Freedom.</span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Estimate the exact investment corpus required to fund your lifestyle for life. Calculates career salary increments, living costs calibrated from village to metro, inflation compounding, and healthcare reserves.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-extrabold hover:bg-blue-700 transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Start Lifetime Calculation</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            {onViewLogic && (
              <button
                type="button"
                onClick={onViewLogic}
                className="w-full sm:w-auto px-6 py-3.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>See How It's Calculated</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Pre-filled Indian defaults
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              100% Local & Private (Zero Tracking)
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              1-Click PDF Report
            </span>
          </div>
        </section>

        {/* Prominent Local & Private Guarantee Banner */}
        <section className="max-w-3xl mx-auto -mt-6">
          <div className="rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                  100% Local & Private to Your Computer
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/90 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                  Zero Tracking · No Server
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                All calculations and financial data remain <strong>completely local to your browser on your computer</strong>. Nothing is ever sent to any remote server, cloud database, or third-party API, and zero analytics or trackers are used. Your privacy is absolute.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Location-Calibrated Baselines</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Living costs in a Tier-1 Metro (Mumbai/Bengaluru) are 2.5–3x higher than small towns or villages. We dynamically adjust suggested defaults to your area.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Active Income & Career Savings</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Models your take-home income and annual increments. Living expenses are subtracted, and the surplus is invested into your corpus to pinpoint your retirement crossover.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Growing Annuity Math (Convention A)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Replaces fragile 25x or 30x rules with mathematically exact compounding annuity formulas (<code className="text-[11px] font-mono">r ≠ g</code> and <code className="text-[11px] font-mono">r = g</code> special cases).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground">3 Lifestyle Tiers Side-by-Side</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instantly compare how your required corpus changes between Frugal / Bare-Minimum survival essentials, Comfortable living, and Luxury / Aspirational standards.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Retirement Readiness Gauge</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get an instant clarity score on whether your career savings will fully fund your retirement, or if there is a shortfall requiring higher monthly savings or starting capital.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Print / Download PDF Report</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Export an executive-ready multi-page PDF with all crossover graphs, wealth curves, category breakdowns, and year-by-year cashflow tables.
            </p>
          </div>
        </section>

        {/* How It Works (4 Simple Steps) */}
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">How the Calculator Works</h3>
            <p className="text-xs text-muted-foreground font-medium">
              A guided 5-step wizard designed for quick estimation or deep customization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                step: 'Step 1',
                title: 'Profile & Location',
                desc: 'Enter age, target lifespan & area type (village, town, city, metro).',
              },
              {
                step: 'Step 2',
                title: 'Income & Savings',
                desc: 'Enter monthly take-home salary, retirement age & expected annual hike.',
              },
              {
                step: 'Step 3',
                title: 'Household Members',
                desc: 'Optionally add dependents, children support end-ages, or parents.',
              },
              {
                step: 'Step 4',
                title: 'Living Expenses',
                desc: 'Enter category lump-sums or customize individual line items.',
              },
              {
                step: 'Step 5',
                title: 'Assumptions & Results',
                desc: 'Set expected returns & inflation; view crossover charts & export PDF.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-1 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {s.step}
                  </span>
                  <h4 className="font-bold text-xs text-foreground mt-0.5">{s.title}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-4 max-w-3xl mx-auto">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Key Planning Questions</span>
            </h3>
            <p className="text-xs text-muted-foreground">Understanding retirement calculations in India</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
              <h4 className="font-bold text-foreground">Why doesn't the standard "25x rule" work in India?</h4>
              <p className="text-muted-foreground leading-relaxed">
                The 25x rule (4% withdrawal rate) was designed for the US where long-term inflation was historically 2–3%. In India, household inflation typically ranges between 5% and 7%, and medical costs inflate at 10–12%. For a 25–35 year retirement in India, an inflation-indexed growing annuity calculation is much safer.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
              <h4 className="font-bold text-foreground">What happens if my active income already covers my retirement?</h4>
              <p className="text-muted-foreground leading-relaxed">
                If your career salary and annual increments allow you to invest a surplus that compounds to meet your retirement corpus goal, the calculator will report your plan as <strong>Fully Self-Funded (₹0 Extra Starting Corpus Needed)</strong>. You can see your accumulated peak wealth at retirement age and your perpetual ending balance.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
              <h4 className="font-bold text-foreground">Is my financial data saved or shared with anyone?</h4>
              <p className="text-muted-foreground leading-relaxed">
                No. All calculations run strictly inside your web browser using client-side JavaScript. Your data is saved only in your browser's private local storage so you don't lose progress on page refresh. Clicking "Reset" completely wipes all stored data.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/40 p-8 text-center space-y-4 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-foreground">
            Ready to calculate your lifetime corpus?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-medium">
            Takes only 2–3 minutes. Pre-filled with realistic Indian cost baselines and skippable steps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-extrabold hover:bg-blue-700 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
            >
              <span>Launch Calculator Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            {onViewLogic && (
              <button
                type="button"
                onClick={onViewLogic}
                className="w-full sm:w-auto px-6 py-3.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>How Calculation Is Done</span>
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card/50 text-center text-xs text-muted-foreground space-y-1.5 px-4">
        <p className="font-medium">
          Lifetime Cost of Living & Corpus Calculator · Open Source Financial Planning Tool
        </p>
        <p className="text-[11px] text-muted-foreground/80 max-w-xl mx-auto">
          <strong>Disclaimer:</strong> This application is an estimation and scenario planning tool. It is not regulated financial advice, investment advisory, or a guarantee of safe withdrawal rates.
        </p>
      </footer>
    </div>
  )
}
