import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Compass,
  MapPin,
  Scale,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Code2,
  Activity,
  PieChart,
  Table as TableIcon,
  Download,
  Settings,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SocialLinks } from '@/components/ui/SocialLinks'

interface FeaturesAndLogicPageProps {
  onBack?: () => void
  onStartWizard: () => void
  onHome?: () => void
}

type ActiveSection = 'math' | 'area' | 'lifestyles' | 'features' | 'architecture'

export default function FeaturesAndLogicPage({
  onBack,
  onStartWizard,
  onHome,
}: FeaturesAndLogicPageProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('math')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Sticky Top Header */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (onHome) onHome()
              else window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="Features & Calculation Logic"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              ₹
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-foreground leading-tight tracking-tight">
                Features & Calculation Logic
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
                Mathematical formulations, calibrations & architecture
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <SocialLinks />
            <ThemeToggle />
            <button
              type="button"
              onClick={onStartWizard}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Launch Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 space-y-10">
        {/* Hero Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Complete Open Methodology · No Black Boxes · Pure Client-Side Math</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
            How The Calculator Works: <br />
            <span className="text-blue-600 dark:text-blue-400">
              Formulas, Calibrations & Logic
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Retirement planning in India requires precision: standard Western heuristics like the 25x or 4% rule break down under 6–7% inflation and 10%+ healthcare escalations. Here is the exact mathematical and algorithmic foundation behind every number.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
            <span className="px-3 py-1 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Convention A Growing Annuity
            </span>
            <span className="px-3 py-1 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              4 Indian Area Tiers
            </span>
            <span className="px-3 py-1 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              11 Expense Categories (A–K)
            </span>
            <span className="px-3 py-1 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              100% Private (No Cloud)
            </span>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <section className="sticky top-16 z-10 bg-background/95 backdrop-blur-md pt-2 pb-3 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              {
                id: 'math' as const,
                label: 'Calculation Engine & Math',
                icon: Calculator,
              },
              {
                id: 'area' as const,
                label: 'Area & Demographic Multipliers',
                icon: MapPin,
              },
              {
                id: 'lifestyles' as const,
                label: 'Lifestyle & Market Scenarios',
                icon: Scale,
              },
              {
                id: 'features' as const,
                label: 'Comprehensive Feature Suite',
                icon: Sparkles,
              },
              {
                id: 'architecture' as const,
                label: 'Architecture & Testing',
                icon: Code2,
              },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeSection === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* SECTION 1: CALCULATION ENGINE & MATH */}
        {activeSection === 'math' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* Why 25x Fails Callout */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-5 sm:p-6 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Why the standard "25x Rule" (4% SWR) is dangerous in India</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The popular 25x rule originates from the 1998 US Trinity Study, assuming long-term inflation of 2–3% and portfolio returns of 7–8% (a healthy real return spread of 4–5%). In India, long-term consumer inflation averages 5–7%, and healthcare inflation surpasses 10–12%. A static 25x corpus can lead to premature portfolio depletion in under 18 years. Our engine replaces flat rules with exact <strong>Growing Annuity Formulations (Convention A)</strong>.
              </p>
            </div>

            {/* Formula Block 1: Convention A Growing Annuity */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Core Formulation 01
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">
                    The Growing Annuity Formula (Convention A)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-mono font-medium text-muted-foreground">
                  src/domain/calculations/corpusFormula.ts
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                To fund an initial annual retirement living expenditure <code className="font-mono text-xs">E₀</code> that inflates annually at rate <code className="font-mono text-xs">g</code> over <code className="font-mono text-xs">n</code> years of retirement, with a post-retirement portfolio compounding at annual rate <code className="font-mono text-xs">r</code>:
              </p>

              {/* Mathematical Display Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Case 1: r != g */}
                <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      Standard Case: When r ≠ g
                    </h4>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-bold">
                      Common
                    </span>
                  </div>

                  {/* Visual Equation Card */}
                  <div className="bg-card border border-border rounded-lg p-4 font-mono text-center space-y-2 shadow-2xs">
                    <div className="text-sm sm:text-base font-bold text-foreground py-2 overflow-x-auto">
                      C = E₀ × [ (1 - ((1 + g) / (1 + r))ⁿ) / (r - g) ] × (1 + r)
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The beginning-of-year multiplier factor <code className="font-mono">(1 + r)</code> ensures expenses can be drawn at the start of each year without requiring mid-year capital liquidation.
                  </p>
                </div>

                {/* Case 2: r == g */}
                <div className="p-5 rounded-xl border border-border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wide">
                      Boundary Edge Case: When r = g
                    </h4>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-bold">
                      Zero Real Spread
                    </span>
                  </div>

                  {/* Visual Equation Card */}
                  <div className="bg-card border border-border rounded-lg p-4 font-mono text-center space-y-2 shadow-2xs">
                    <div className="text-sm sm:text-base font-bold text-foreground py-2 overflow-x-auto">
                      C = E₀ × [ n / (1 + r) ] × (1 + r) = E₀ × n
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    When investment returns exactly match inflation rate, compound real growth is zero. The required capital simplifies cleanly to total nominal lifetime expenditure.
                  </p>
                </div>
              </div>

              {/* Variables Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400">E₀</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Annual living expenses at retirement age
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400">g</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Annual inflation rate (default: 6.0%)
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400">r</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Expected net portfolio return (default: 10.0%)
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400">n</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Years in retirement (Lifespan – Retirement Age)
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Block 2: Active Career Accumulation */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Core Formulation 02
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Active Career Income Escalation & Surplus Compounding
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Implemented in <code className="font-mono text-xs">src/domain/calculations/runScenarios.ts</code> and <code className="font-mono text-xs">projectCashflows.ts</code>
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Step 1</span>
                    <h4 className="font-bold text-xs text-foreground">Annual Salary Escalation</h4>
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
                      I(t) = I₀ × (1 + g_salary)ᵗ
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Take-home income escalates annually using your expected salary hike percentage.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Step 2</span>
                    <h4 className="font-bold text-xs text-foreground">Investable Annual Surplus</h4>
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
                      S(t) = max(0, I(t) - E(t) - L(t))
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Living expenses E(t) and annual liabilities L(t) are deducted from take-home pay.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Step 3</span>
                    <h4 className="font-bold text-xs text-foreground">Accumulation Recursive Step</h4>
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1">
                      P(t) = (P(t-1) + S(t)) × (1 + r)
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Starting capital plus annual surplus compounds at your expected rate of return r.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Peak Wealth at Retirement:</strong> At retirement age <code className="font-mono">A_ret</code>, the portfolio reaches <code className="font-mono">P_R = P(A_ret)</code>. If your accumulated career savings <code className="font-mono">P_R</code> exceed or equal the target required corpus <code className="font-mono">C_R</code>, your retirement is <strong>100% Self-Funded (₹0 Extra Capital Required Today)</strong>.
                </div>
              </div>
            </div>

            {/* Formula Block 3: Drawdown & Depletion */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Core Formulation 03
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Post-Retirement Drawdown & Depletion Detection
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Implemented in <code className="font-mono text-xs">src/domain/calculations/simulatePortfolio.ts</code>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="text-xs font-bold text-foreground">Annual Net Deficit Withdrawal</h4>
                  <div className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 py-1">
                    W(t) = max(0, E(t) - O(t))
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Where <code className="font-mono">O(t)</code> represents guaranteed recurring post-retirement passive income (pension, annuities, or rental yields). The portfolio only needs to bridge the deficit.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="text-xs font-bold text-foreground">Portfolio Drawdown Step</h4>
                  <div className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 py-1">
                    B(t) = (B(t-1) - W(t)) × (1 + r)
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Living expenses are withdrawn at beginning-of-year, and remaining portfolio assets continue compounding at return rate <code className="font-mono">r</code>. If <code className="font-mono">B(t) &lt; 0</code>, the exact depletion year is flagged.
                  </p>
                </div>
              </div>

              {/* Readiness Score Breakdown */}
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                <h4 className="text-xs font-bold text-foreground">Retirement Readiness Score Metric</h4>
                <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  Readiness Score (%) = (Projected Accumulated Corpus P_R / Target Needed Corpus C_R) × 100%
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] space-y-0.5">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">≥ 100% · Fully Funded</span>
                    <p className="text-muted-foreground">Portfolio lasts your entire lifespan with surplus safety buffer.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-[11px] space-y-0.5">
                    <span className="font-bold text-amber-800 dark:text-amber-300">70% – 99% · Moderate Gap</span>
                    <p className="text-muted-foreground">Minor shortfall; manageable with small spending adjustments or 2–3% higher savings.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-[11px] space-y-0.5">
                    <span className="font-bold text-rose-800 dark:text-rose-300">&lt; 70% · Critical Gap</span>
                    <p className="text-muted-foreground">Portfolio depletes before target age. Requires additional starting capital or delayed retirement.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Block 4: Expense Normalization Table */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Core Formulation 04
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Expense Annualisation & Frequency Normalization Matrix
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Implemented in <code className="font-mono text-xs">src/domain/calculations/annualise.ts</code>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Annual Multiplier</th>
                      <th className="py-2.5 px-3">Formula</th>
                      <th className="py-2.5 px-3">Typical Household Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">monthly</td>
                      <td className="py-2.5 px-3 font-mono">× 12</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">Amount × 12</td>
                      <td className="py-2.5 px-3 text-muted-foreground">Rent, groceries, utility bills</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">quarterly</td>
                      <td className="py-2.5 px-3 font-mono">× 4</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">Amount × 4</td>
                      <td className="py-2.5 px-3 text-muted-foreground">School term fees, water bills</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">half_yearly</td>
                      <td className="py-2.5 px-3 font-mono">× 2</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">Amount × 2</td>
                      <td className="py-2.5 px-3 text-muted-foreground">Vehicle insurance, semi-annual taxes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">yearly</td>
                      <td className="py-2.5 px-3 font-mono">× 1</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">Amount × 1</td>
                      <td className="py-2.5 px-3 text-muted-foreground">Annual family vacation, term insurance</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">weekly</td>
                      <td className="py-2.5 px-3 font-mono">× 52</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">Amount × 52</td>
                      <td className="py-2.5 px-3 text-muted-foreground">Weekly fresh farmer market, fuel</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">every_n_years</td>
                      <td className="py-2.5 px-3 font-mono">× (1 / N)</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">Amount ÷ N</td>
                      <td className="py-2.5 px-3 text-muted-foreground">Vehicle replacement (every 7 yrs), laptop</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: AREA & DEMOGRAPHIC CALIBRATIONS */}
        {activeSection === 'area' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* Geographic Cost Multipliers */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Geographic Calibration
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  India Geographic Cost Tiers & Multipliers
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Living in a Tier 1 Metro like Mumbai or Bengaluru costs vastly more than a rural village or small town. The calculator dynamically scales suggested baseline expenses to your chosen geography.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    tier: 'Village / Rural',
                    mult: '0.6×',
                    key: 'village',
                    desc: 'Lowest living costs, minimal housing and parking expenses, low utility and fresh produce prices.',
                  },
                  {
                    tier: 'Small Town (Tier 3)',
                    mult: '1.0×',
                    key: 'small_town',
                    desc: 'Calibrated base standard for Indian middle-class households. Used as benchmark baseline.',
                  },
                  {
                    tier: 'City (Tier 2)',
                    mult: '1.6×',
                    key: 'city',
                    desc: 'State capitals and industrial cities (e.g., Jaipur, Indore, Kochi, Lucknow). Higher rent & schooling.',
                  },
                  {
                    tier: 'Tier 1 Metro',
                    mult: '2.5×',
                    key: 'tier1_metro',
                    desc: 'High-cost major metros (Mumbai, Bengaluru, Delhi NCR, Hyderabad). Expensive housing and transit.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{item.tier}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-black">
                          {item.mult}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Area Sensitivity Matrix */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-foreground">
                  Category-Specific Area Sensitivity Factors (CATEGORY_AREA_FACTORS)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Real estate rent exhibits an 8× disparity between a rural village and Mumbai, whereas groceries vary by only ~2×. We apply granular category sensitivity curves:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="py-2 px-3">Expense Category</th>
                        <th className="py-2 px-3">Village</th>
                        <th className="py-2 px-3">Small Town (Base)</th>
                        <th className="py-2 px-3">City (Tier 2)</th>
                        <th className="py-2 px-3">Tier 1 Metro</th>
                        <th className="py-2 px-3">Price Disparity Spread</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-foreground">Housing & Rent</td>
                        <td className="py-2 px-3 font-mono">0.4×</td>
                        <td className="py-2 px-3 font-mono font-bold">1.0×</td>
                        <td className="py-2 px-3 font-mono">1.8×</td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">3.2×</td>
                        <td className="py-2 px-3 text-[11px] text-muted-foreground">8.0× (Widest disparity)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-foreground">Personal Care & Lifestyle</td>
                        <td className="py-2 px-3 font-mono">0.5×</td>
                        <td className="py-2 px-3 font-mono font-bold">1.0×</td>
                        <td className="py-2 px-3 font-mono">1.6×</td>
                        <td className="py-2 px-3 font-mono">2.5×</td>
                        <td className="py-2 px-3 text-[11px] text-muted-foreground">5.0× disparity</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-foreground">Transportation & Commuting</td>
                        <td className="py-2 px-3 font-mono">0.6×</td>
                        <td className="py-2 px-3 font-mono font-bold">1.0×</td>
                        <td className="py-2 px-3 font-mono">1.5×</td>
                        <td className="py-2 px-3 font-mono">2.2×</td>
                        <td className="py-2 px-3 text-[11px] text-muted-foreground">3.7× disparity</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-foreground">Healthcare & Diagnostics</td>
                        <td className="py-2 px-3 font-mono">0.8×</td>
                        <td className="py-2 px-3 font-mono font-bold">1.0×</td>
                        <td className="py-2 px-3 font-mono">1.4×</td>
                        <td className="py-2 px-3 font-mono">2.0×</td>
                        <td className="py-2 px-3 text-[11px] text-muted-foreground">2.5× disparity</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-foreground">Food & Groceries</td>
                        <td className="py-2 px-3 font-mono">0.7×</td>
                        <td className="py-2 px-3 font-mono font-bold">1.0×</td>
                        <td className="py-2 px-3 font-mono">1.4×</td>
                        <td className="py-2 px-3 font-mono">1.9×</td>
                        <td className="py-2 px-3 text-[11px] text-muted-foreground">2.7× disparity</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-foreground">Technology & Broadband</td>
                        <td className="py-2 px-3 font-mono">0.9×</td>
                        <td className="py-2 px-3 font-mono font-bold">1.0×</td>
                        <td className="py-2 px-3 font-mono">1.1×</td>
                        <td className="py-2 px-3 font-mono">1.2×</td>
                        <td className="py-2 px-3 text-[11px] text-muted-foreground">1.3× (Nationwide standardized)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Non-Linear Household Member Scaling */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Demographic Modeling
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Non-Linear Household Scaling & Lifecycle Windows
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  A family of four does not cost 4× a single person. Shared fixed costs (housing, kitchen, utilities) create significant economies of scale.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                <h4 className="text-xs font-bold text-foreground">Household Multiplier Formula</h4>
                <div className="font-mono text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                  Member Multiplier = 1 + (N_members - 1) × S_category
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Where <code className="font-mono text-xs">S_category</code> represents the category-specific marginal cost expansion factor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground">Housing</span>
                  <div className="text-blue-600 dark:text-blue-400 font-mono font-bold">+25% / member</div>
                  <p className="text-[11px] text-muted-foreground">Upgrades from 1BHK to 2BHK/3BHK rather than linear duplication.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground">Food & Groceries</span>
                  <div className="text-blue-600 dark:text-blue-400 font-mono font-bold">+65% / member</div>
                  <p className="text-[11px] text-muted-foreground">Shared kitchen bulk staples, higher per-person perishables.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground">Utilities & Transit</span>
                  <div className="text-blue-600 dark:text-blue-400 font-mono font-bold">+35% / member</div>
                  <p className="text-[11px] text-muted-foreground">Shared vehicle usage, power base load.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground">Tech & Connectivity</span>
                  <div className="text-blue-600 dark:text-blue-400 font-mono font-bold">+10% / member</div>
                  <p className="text-[11px] text-muted-foreground">Shared Wi-Fi and OTT accounts, minor mobile recharge cost.</p>
                </div>
              </div>

              {/* Lifecycle Support Windows */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 text-xs space-y-1.5">
                <strong className="text-foreground">Lifecycle Support Windows:</strong> Children and elderly parents have discrete lifecycle intervals. Child support ceases when they graduate (e.g. age 22–24), and parental medical allowance ceases at projected parental lifespan. The cashflow engine automatically amortizes these costs only for their active dependent duration.
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: LIFESTYLE & MARKET SCENARIOS */}
        {activeSection === 'lifestyles' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* The 3 Lifestyle Tiers */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Lifestyle Sensitivity
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  The Three Lifestyle Tiers (1-Click Real-Time Plan Switching)
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Retirement readiness is flexible. Compare survival essentials versus comfortable or luxury standards, and switch your active plan with one click without losing entered data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground">Tier 1: Bare Minimum</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      0.65×
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Survival essentials only: shelter, groceries, municipal utilities, and vital healthcare. Discretionary categories (vacations, luxury dining, hobbies) are zeroed out.
                  </p>
                  <div className="text-[11px] text-muted-foreground border-t border-border pt-2">
                    <strong>Rule:</strong> Discretionary = ₹0, Parent Lump Sums = 0.65×
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300">
                      Tier 2: Comfortable (Base)
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                      1.00×
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Balanced middle-class standard: comfortable housing, dining out twice monthly, domestic holidays, modern gadgets, and reliable medical insurance.
                  </p>
                  <div className="text-[11px] text-muted-foreground border-t border-blue-200 dark:border-blue-800 pt-2">
                    <strong>Rule:</strong> Full baseline values (1.0×)
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                      Tier 3: Luxury / Aspirational
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                      1.85×
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Elevated lifestyle: upscale gated community housing, international vacations, private luxury healthcare, premium vehicles, and expansive contingency buffers.
                  </p>
                  <div className="text-[11px] text-muted-foreground border-t border-purple-200 dark:border-purple-800 pt-2">
                    <strong>Rule:</strong> Discretionary = 1.5×, Core = 1.15×, Parents = 1.4×
                  </div>
                </div>
              </div>
            </div>

            {/* Macroeconomic Market Scenarios */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Macroeconomic Stress-Testing
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Simultaneous Multi-Scenario Stress Testing
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  The calculation engine evaluates three macroeconomic scenarios in parallel on every state change:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">Optimistic Preset</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                      High Growth
                    </span>
                  </div>
                  <div className="font-mono text-muted-foreground text-[11px]">
                    Inflation (g): 5.0% | Return (r): 12.0%
                  </div>
                  <p className="text-muted-foreground leading-snug">
                    Real return spread of +7.0%. High equity outperformance and subdued inflation drag.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800 dark:text-blue-300">Base Scenario</span>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      Realistic Default
                    </span>
                  </div>
                  <div className="font-mono text-muted-foreground text-[11px]">
                    Inflation (g): 6.0% | Return (r): 10.0%
                  </div>
                  <p className="text-muted-foreground leading-snug">
                    Real return spread of +4.0%. Aligned with historic diversified Indian equity + debt portfolios.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 dark:text-rose-300">Conservative Preset</span>
                    <span className="text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded">
                      Stress Test
                    </span>
                  </div>
                  <div className="font-mono text-muted-foreground text-[11px]">
                    Inflation (g): 7.5% | Return (r): 8.5%
                  </div>
                  <p className="text-muted-foreground leading-snug">
                    Tight real return spread (+1.0%). Models prolonged inflation and debt-heavy conservative portfolios.
                  </p>
                </div>
              </div>

              {/* Differential Healthcare Inflation */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Activity className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Differential Healthcare Inflation Modeling</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Medical costs historically rise much faster than standard consumer items. Our engine allows specifying a separate <strong>Healthcare Inflation Rate</strong> (default 8.0%, scalable to 12%) applied exclusively to Category D (Healthcare & Medical Diagnostics).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: COMPREHENSIVE FEATURE SUITE */}
        {activeSection === 'features' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* The 11 Expense Categories */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Granular Budgeting
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  11 Standardized Expense Categories (Categories A through K)
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Overlooking occasional or irregular living costs is the most common reason financial plans fail. We divide all household costs into 11 standardized buckets:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'A', name: 'Housing', items: 'Rent, Society Maintenance, Painting/Repairs, Property Tax' },
                  { id: 'B', name: 'Food & Groceries', items: 'Kitchen Staples, Vegetables, Dairy, Dining Out, Order In' },
                  { id: 'C', name: 'Utilities', items: 'Electricity, LPG Piped Gas, Water Tankers' },
                  { id: 'D', name: 'Healthcare', items: 'Routine Medicines, Doctor Visits, Health Insurance Premiums' },
                  { id: 'E', name: 'Transportation', items: 'Fuel (Petrol/Diesel), Vehicle Servicing, Transit, FASTag' },
                  { id: 'F', name: 'Personal & Lifestyle', items: 'Clothing, Salons, Hobbies, Domestic Vacations' },
                  { id: 'G', name: 'Technology & Bills', items: 'Mobile Recharges, Home Broadband, OTT Subscriptions' },
                  { id: 'H', name: 'Family & Dependents', items: 'School Tuition, Higher Education Funds, Parental Support' },
                  { id: 'I', name: 'Financial & Insurance', items: 'Term Insurance, Bank Account Fees, CA / Tax Prep' },
                  { id: 'J', name: 'Emergency Buffer', items: 'Unplanned Appliance Breakdown, Medical Incidentals' },
                  { id: 'K', name: 'Custom Expenses', items: 'Pet Care, Farming / Land Lease, Philanthropy' },
                ].map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[11px]">
                        {cat.id}
                      </span>
                      <h4 className="font-bold text-foreground text-xs">{cat.name}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{cat.items}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                <span className="font-bold text-foreground">Dual Entry Modes:</span>
                <p className="text-muted-foreground leading-relaxed">
                  Users in a hurry can enter simple category lump-sum totals. Advanced users can expand any category into itemized line items with custom frequencies (monthly, weekly, every N years). The system auto-synchronizes lump-sums and itemized totals bi-directionally.
                </p>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Guided 6-Step Wizard</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Progressive flow from profile to income, dependents, expenses, and assumptions. Non-essential steps feature one-click skipping with smart defaults.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Interactive Visual Projections</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Recharts-powered interactive graphs: Lifetime Portfolio Trajectory (accumulation and depletion curves), category pie breakdown, and net annual cashflows.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <TableIcon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Cashflow Reconciliation Ledger</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Full year-by-year financial schedule from your current age to target lifespan. Shows salary, living expenses, investable surplus, and ending balances.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">1-Click Client-Side PDF Export</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export an executive multi-page PDF generated via jsPDF directly in the browser with high-resolution vector layout, charts, and summary cards.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">100% Client-Side Private</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zero cloud servers, zero analytics tracking, zero database storage. All numbers stay in your device browser <code className="text-[11px] font-mono">localStorage</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Light, Dark & System Theming</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Built with CSS variables and Tailwind CSS. Seamlessly matches your operating system preference or lets you choose manual Light or Dark mode.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: ARCHITECTURE & TESTING */}
        {activeSection === 'architecture' && (
          <div className="space-y-8 animate-in fade-in-50 duration-300">
            {/* System Architecture */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Engineering Standards
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  System Architecture & Separation of Concerns
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Engineered with strict separation of pure financial domain logic from the React user interface.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="font-bold text-foreground">1. Pure Domain Layer (src/domain/)</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Zero React, zero DOM, and zero UI library dependencies. All calculations (<code className="font-mono">annualise</code>, <code className="font-mono">corpusFormula</code>, <code className="font-mono">simulatePortfolio</code>, <code className="font-mono">runScenarios</code>) are pure TypeScript functions taking plain inputs and producing deterministic outputs.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="font-bold text-foreground">2. Config-Driven Engine (src/config/)</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Step definitions, field validation boundaries, default values, and help text reside in declarative configuration files (<code className="font-mono">formFields.ts</code>). Adding or modifying fields requires no JSX alterations.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="font-bold text-foreground">3. Reactive State Store (src/store/)</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Centralized Zustand store with synchronized <code className="font-mono">localStorage</code> persistence. Dispatches granular actions and ensures reactive UI updates across all wizard steps.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="font-bold text-foreground">4. Automated Testing Policy (Vitest)</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Strict logic-only automated testing policy. Fast, deterministic unit tests in <code className="font-mono">src/domain/calculations/__tests__/</code> verify mathematical precision, edge case invariance (<code className="font-mono">r = g</code>), and annualisation rules under all scenarios.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Suites Summary Card */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Automated Vitest Test Suites Verified</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold">
                  30 Tests Passing · 100% Deterministic
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                  <span className="font-mono font-bold text-foreground">corpusFormula.test</span>
                  <p className="text-muted-foreground text-[11px]">Growing annuity precision, r ≠ g, r = g edge case.</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                  <span className="font-mono font-bold text-foreground">annualise.test</span>
                  <p className="text-muted-foreground text-[11px]">Frequency conversion invariance (monthly, weekly, N-year).</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                  <span className="font-mono font-bold text-foreground">areaDefaults.test</span>
                  <p className="text-muted-foreground text-[11px]">Geographic cost multipliers and non-linear member scaling.</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg space-y-1">
                  <span className="font-mono font-bold text-foreground">activeIncome.test</span>
                  <p className="text-muted-foreground text-[11px]">Salary escalation, surplus compounding, peak wealth.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <section className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/40 p-8 text-center space-y-4 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-foreground">
            Ready to compute your lifetime financial number?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-medium">
            Test your assumptions with India-calibrated cost baselines, skippable steps, and instant PDF reporting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStartWizard}
              className="px-8 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-extrabold hover:bg-blue-700 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <span>Launch Corpus Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Previous View</span>
            </button>
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
