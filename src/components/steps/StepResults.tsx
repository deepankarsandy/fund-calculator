import { useState } from 'react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { formatCrore } from '@/lib/currency'
import { formatPercent } from '@/lib/format'
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  AlertTriangle,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  Sparkles,
  Compass,
  Layers,
  Scale,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import type { ScenarioResult, LifestyleComparison } from '@/domain/models/results'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/cn'

const SCENARIO_COLORS = {
  Optimistic: '#10b981',
  Base: '#3b82f6',
  Conservative: '#f59e0b',
}

const CATEGORY_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
  '#64748b',
]

function ScenarioTab({
  scenario,
  active,
  onClick,
}: {
  scenario: ScenarioResult
  active: boolean
  onClick: () => void
}) {
  const color = SCENARIO_COLORS[scenario.label as keyof typeof SCENARIO_COLORS] ?? '#3b82f6'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: active ? '#ffffff' : color }}
        />
        {scenario.label} ({formatPercent(scenario.inflationRate)} inf / {formatPercent(scenario.returnRate)} ret)
      </span>
    </button>
  )
}

function LifestyleComparisonSection({
  comparisons,
  currentLifestyle,
  onEditProfile,
}: {
  comparisons: LifestyleComparison[]
  currentLifestyle: string
  onEditProfile: () => void
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4 print-break-inside-avoid">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Cost of Living & Corpus Requirement by Lifestyle
          </h3>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto print:hidden"
        >
          <Compass className="w-3.5 h-3.5" />
          Adjust Baseline in Step 1
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {comparisons.map((c) => {
          const isSelected =
            (c.lifestyle === 'bare_minimum' && currentLifestyle === 'bare_minimum') ||
            (c.lifestyle === 'comfortable' && currentLifestyle === 'comfortable') ||
            (c.lifestyle === 'luxury' && currentLifestyle === 'custom')

          return (
            <div
              key={c.lifestyle}
              className={cn(
                'rounded-xl p-4 border transition-all flex flex-col justify-between space-y-3 relative',
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/25 ring-1 ring-blue-500/30'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{c.label}</h4>
                  {isSelected && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">{c.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/80 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-zinc-500">Monthly Budget (Today)</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatCrore(c.monthlyExpenseToday)}/mo
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-zinc-500">Total Lifetime Spend</span>
                  <span className="font-extrabold text-red-600 dark:text-red-400">
                    {formatCrore(c.totalLifetimeCostOfLiving)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-zinc-500">Corpus Target Needed</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {c.requiredCorpus === 0 ? '₹0 (Self-Funded)' : formatCrore(c.requiredCorpus)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-zinc-500">Projected Accumulation</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCrore(c.peakCorpus)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProjectionTable({ scenario, full = false }: { scenario: ScenarioResult; full?: boolean }) {
  const [page, setPage] = useState(0)
  const pageSize = 10
  const rows = scenario.yearProjections
  const totalPages = Math.ceil(rows.length / pageSize)
  const pageRows = full ? rows : rows.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-900">
        <table className="w-full text-xs">
          <thead className="bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
            <tr>
              <th className="px-3 py-2.5 text-left font-bold whitespace-nowrap">Year</th>
              <th className="px-3 py-2.5 text-left font-bold whitespace-nowrap">Age</th>
              <th className="px-3 py-2.5 text-right font-bold whitespace-nowrap text-emerald-700 dark:text-emerald-400">Total Income (+)</th>
              <th className="px-3 py-2.5 text-right font-bold whitespace-nowrap text-red-700 dark:text-red-400">Living Expenses (-)</th>
              <th className="px-3 py-2.5 text-right font-bold whitespace-nowrap text-emerald-700 dark:text-emerald-400">Net Invested (+)</th>
              <th className="px-3 py-2.5 text-right font-bold whitespace-nowrap text-red-700 dark:text-red-400">Net Withdrawn (-)</th>
              <th className="px-3 py-2.5 text-right font-bold whitespace-nowrap text-blue-700 dark:text-blue-400">Investment Growth</th>
              <th className="px-3 py-2.5 text-right font-bold whitespace-nowrap text-zinc-900 dark:text-zinc-100">Portfolio Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
            {pageRows.map(row => (
              <tr
                key={row.year}
                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-3 py-2 font-semibold text-zinc-500">{row.year}</td>
                <td className="px-3 py-2 font-bold">{row.age}</td>
                <td className="px-3 py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCrore(row.totalIncome)}
                  {row.earnedIncome > 0 && <span className="text-[10px] text-zinc-400 block">(Salary: {formatCrore(row.earnedIncome)})</span>}
                </td>
                <td className="px-3 py-2 text-right font-medium text-red-600 dark:text-red-400">{formatCrore(row.expenses)}</td>
                <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {row.netSavings > 0 ? `+${formatCrore(row.netSavings)}` : '—'}
                </td>
                <td className="px-3 py-2 text-right font-bold text-red-600 dark:text-red-400">
                  {row.netWithdrawal > 0 ? `-${formatCrore(row.netWithdrawal)}` : '—'}
                </td>
                <td className="px-3 py-2 text-right font-medium text-blue-600 dark:text-blue-400">+{formatCrore(row.investmentGrowth)}</td>
                <td className={`px-3 py-2 text-right font-bold ${row.closingCorpus < 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {formatCrore(row.closingCorpus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!full && totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center pt-2 print:hidden">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            ← Prev
          </button>
          <span className="text-xs font-medium text-zinc-500 px-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-3.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export function StepResults() {
  const { results, profile, assets, goToStep } = useScenarioStore()
  const [activeScenario, setActiveScenario] = useState(1) // Base by default
  const [showExplain, setShowExplain] = useState(false)
  const [activeTab, setActiveTab] = useState<'income_vs_expense' | 'portfolio' | 'categories' | 'table'>('income_vs_expense')
  const [cashflowView, setCashflowView] = useState<'annual' | 'cumulative'>('annual')

  if (!results) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-zinc-500 font-medium">No calculation run yet. Go back and click Calculate.</p>
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 cursor-pointer"
        >
          ← Go Back to Assets
        </button>
      </div>
    )
  }

  const scenario = results.scenarios[activeScenario]
  const hasActiveIncome = (assets.monthlyIncome || 0) > 0 && assets.incomeEndAge > profile.currentAge

  // Income vs Expenses Annual Crossover Data
  const incomeVsExpenseData = scenario.yearProjections.map(row => ({
    age: row.age,
    income: row.totalIncome,
    earnedIncome: row.earnedIncome,
    expenses: row.expenses,
    netSavings: row.netSavings,
    netWithdrawal: row.netWithdrawal,
  }))

  // Cumulative Lifetime Cashflow Data
  let cumExp = 0
  let cumInc = 0
  let cumSav = 0
  const cumulativeCashflowData = scenario.yearProjections.map(row => {
    cumExp += row.expenses
    cumInc += row.totalIncome
    cumSav += row.netSavings
    return {
      age: row.age,
      cumExpenses: Math.round(cumExp),
      cumIncome: Math.round(cumInc),
      cumSavings: Math.round(cumSav),
      balance: Math.round(row.closingCorpus),
    }
  })

  // Portfolio Depletion Curve Data
  const portfolioData = results.scenarios[0].yearProjections.map((row, i) => ({
    age: row.age,
    optimistic: results.scenarios[0].yearProjections[i].closingCorpus,
    base: results.scenarios[1].yearProjections[i].closingCorpus,
    conservative: results.scenarios[2].yearProjections[i].closingCorpus,
  }))

  // Category breakdown for pie chart
  const { categories } = useScenarioStore.getState()
  const pieData = categories
    .filter(c => !c.skipped)
    .map((c, i) => {
      const total =
        c.parentAmount && c.parentFrequency
          ? c.parentAmount * (c.parentFrequency === 'monthly' ? 12 : 1)
          : c.items
              .filter(it => !it.skipped)
              .reduce((s, it) => {
                const mult: Record<string, number> = {
                  monthly: 12,
                  quarterly: 4,
                  yearly: 1,
                  weekly: 52,
                  half_yearly: 2,
                }
                return s + it.amount * (mult[it.frequency] ?? 1)
              }, 0)
      return {
        name: c.label.replace(/^[A-K]\.\s/, ''),
        value: total,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }
    })
    .filter(d => d.value > 0)

  // Retirement Readiness Progress percentage
  const readinessPercent = Math.min(100, Math.max(0, scenario.readinessScore))
  const isFullyFunded = scenario.readinessScore >= 100

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Top Header with PDF Print Button & Scenario Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Corpus Calculation & Lifetime Results
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Clear comparison of retirement corpus requirements, career savings, and lifetime cashflow
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer self-start sm:self-auto"
          title="Print or save comprehensive report as PDF"
        >
          <Printer className="w-4 h-4" />
          <span>Download / Print PDF</span>
        </button>
      </div>

      {/* Scenario Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
        <span className="text-xs font-bold text-zinc-500 shrink-0">Scenario:</span>
        {results.scenarios.map((s, i) => (
          <ScenarioTab
            key={s.label}
            scenario={s}
            active={activeScenario === i}
            onClick={() => setActiveScenario(i)}
          />
        ))}
      </div>

      {/* Warnings & Suggestions Card */}
      {results.warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-2 shadow-xs print-break-inside-avoid">
          <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Planning Items to Review</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs text-amber-900 dark:text-amber-300 font-medium">
            {results.warnings.map((w, i) => (
              <li key={i} className="leading-relaxed">
                <span>{w}</span>
                {w.toLowerCase().includes('no dependents') && (
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="ml-2 inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-200 underline hover:opacity-80 cursor-pointer print:hidden"
                  >
                    <Users className="w-3 h-3" />
                    <span>Add Dependents in Step 3 →</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* HERO CARD: Retirement Readiness & Target vs Projected Corpus */}
      <div className="rounded-2xl border-2 border-blue-600/70 dark:border-blue-500/70 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/30 p-6 space-y-5 shadow-sm print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              {hasActiveIncome ? `Retirement Readiness Goal (Target Age ${scenario.retirementAge})` : 'Starting Corpus Requirement'}
            </h3>
          </div>
          <span className="text-xs font-bold text-zinc-500">
            {hasActiveIncome
              ? `${scenario.workingYears} Earning Years remaining · ${scenario.retirementYears} Retirement Years`
              : `${scenario.retirementYears} Years horizon (Age ${profile.currentAge} → ${profile.targetAge})`}
          </span>
        </div>

        {/* Two Main Key Figures Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target Required */}
          <div className="p-4 bg-white/90 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              {hasActiveIncome ? `Target Corpus Needed at Age ${scenario.retirementAge}` : 'Starting Corpus Needed Today'}
            </p>
            <p className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
              {formatCrore(hasActiveIncome ? scenario.targetCorpusAtRetirement : scenario.requiredCorpus)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1 font-medium">
              Funds {scenario.retirementYears} years of living costs with {formatPercent(scenario.inflationRate)} inflation & {formatPercent(scenario.returnRate)} returns
            </p>
          </div>

          {/* What User Has / Will Have */}
          <div className="p-4 bg-white/90 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              {hasActiveIncome ? `Your Projected Savings by Age ${scenario.retirementAge}` : 'Existing Liquid Investments Today'}
            </p>
            <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight mt-1">
              {formatCrore(hasActiveIncome ? scenario.projectedCorpusAtRetirement : scenario.existingCorpus)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1 font-medium">
              {hasActiveIncome
                ? `Accumulated from monthly income surplus + ${(assets.incomeGrowthRate * 100).toFixed(1)}%/yr hikes`
                : 'Current mutual funds, FDs, PPF & liquid investments'}
            </p>
          </div>
        </div>

        {/* Retirement Readiness Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <span>Goal Funding Progress:</span>
              <span className={isFullyFunded ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-amber-600 dark:text-amber-400 font-extrabold'}>
                {scenario.readinessScore}% Funded
              </span>
            </span>

            {isFullyFunded ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>On Track (+{formatCrore(scenario.retirementSurplus)} Surplus)</span>
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Shortfall of {formatCrore(scenario.retirementFundingGap)}</span>
              </span>
            )}
          </div>

          {/* Clear Visual Progress Track */}
          <div className="h-3.5 w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 shadow-xs',
                isFullyFunded ? 'bg-emerald-500' : readinessPercent >= 70 ? 'bg-amber-500' : 'bg-red-500',
              )}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          {/* Actionable Explanation Banner */}
          <div
            className={cn(
              'p-3.5 rounded-xl border text-xs font-medium leading-relaxed',
              isFullyFunded
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
            )}
          >
            {isFullyFunded ? (
              <p>
                <strong>Plan is Fully Self-Funded:</strong> With your current monthly take-home income and career savings, your portfolio will reach <strong>{formatCrore(scenario.projectedCorpusAtRetirement)}</strong> at retirement (exceeding your requirement of {formatCrore(scenario.targetCorpusAtRetirement)}). You require <strong>₹0 extra starting capital</strong> today.
              </p>
            ) : (
              <p>
                <strong>Plan has a Shortfall:</strong> Your projected career savings of {formatCrore(scenario.projectedCorpusAtRetirement)} fall short of the {formatCrore(scenario.targetCorpusAtRetirement)} required at Age {scenario.retirementAge}. To fully close this gap, you need an extra <strong>{formatCrore(scenario.fundingGap)}</strong> invested today, or an increase in your monthly savings.
                {scenario.depletionAge && (
                  <span className="block mt-1 text-red-700 dark:text-red-400 font-bold">
                    Without changes, savings are projected to run out around Age {scenario.depletionAge}.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* POSITIVE & NEGATIVE FLOW SUMMARY CARDS (Consistent Color Coding) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print-break-inside-avoid">
        {/* Positive Inflow Card (Emerald Green) */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>Inflows & Savings (+)</span>
          </div>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Monthly Income Today</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">+{formatCrore(assets.monthlyIncome)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Career Surplus Invested</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">+{formatCrore(scenario.totalLifetimeSavingsInvested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Existing Liquid Assets</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">+{formatCrore(scenario.existingCorpus)}</span>
            </div>
          </div>
        </div>

        {/* Negative Outflow Card (Red / Rose) */}
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wide">
            <ArrowDownRight className="w-4 h-4 text-red-600" />
            <span>Living Outflows (-)</span>
          </div>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Living Budget Today</span>
              <span className="font-bold text-red-600 dark:text-red-400">-{formatCrore(scenario.currentMonthlyEquivalent)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Annual Expense Today</span>
              <span className="font-bold text-red-600 dark:text-red-400">-{formatCrore(scenario.currentAnnualExpense)}/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Total Lifetime Living Cost</span>
              <span className="font-extrabold text-red-600 dark:text-red-400">-{formatCrore(scenario.totalLifetimeExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Compounding & Net Balance Card (Blue / Indigo) */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wide">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Wealth Compounding</span>
          </div>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Investment Growth Made</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">+{formatCrore(scenario.totalLifetimeInvestmentGrowth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Projected Peak Corpus</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCrore(scenario.peakCorpus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Ending Wealth (Age {profile.targetAge})</span>
              <span className="font-extrabold text-blue-700 dark:text-blue-300">
                {scenario.endingBalance >= 0 ? formatCrore(scenario.endingBalance) : 'Depleted'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LIFETIME FINANCIAL RECONCILIATION: Cashflow Transparency */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3 print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Lifetime Cashflow Reconciliation (Age {profile.currentAge} → {profile.targetAge})
            </h3>
          </div>
          <span className="text-xs text-zinc-500 font-medium">How every single rupee flows</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
            <span className="text-red-700 dark:text-red-400 font-bold block mb-1">1. Total Lifetime Outflows</span>
            <span className="text-xl font-black text-red-600 dark:text-red-400 block">{formatCrore(scenario.totalLifetimeExpenses)}</span>
            <span className="text-[11px] text-zinc-500 mt-1 block">Inflated living costs spent across {profile.targetAge - profile.currentAge} years</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold block mb-1">2. Total Wealth Inflows & Returns</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
              {formatCrore(scenario.totalLifetimeSavingsInvested + scenario.existingCorpus + scenario.totalLifetimeInvestmentGrowth)}
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              {formatCrore(scenario.totalLifetimeSavingsInvested + scenario.existingCorpus)} saved + {formatCrore(scenario.totalLifetimeInvestmentGrowth)} returns
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
            <span className="text-blue-700 dark:text-blue-400 font-bold block mb-1">3. Net Ending Wealth at Age {profile.targetAge}</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 block">
              {scenario.endingBalance >= 0 ? formatCrore(scenario.endingBalance) : '₹0 (Depleted)'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">Inflows & Returns minus Lifetime Living Costs</span>
          </div>
        </div>

        {/* Self-Sustaining Perpetual Portfolio Explanation */}
        {scenario.endingBalance >= scenario.projectedCorpusAtRetirement * 0.95 && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Why is ending balance so high?</p>
              <p className="text-emerald-900 dark:text-emerald-300 mt-0.5 leading-relaxed">
                Because your projected accumulated savings ({formatCrore(scenario.projectedCorpusAtRetirement)}) are substantially higher than the bare minimum retirement requirement ({formatCrore(scenario.targetCorpusAtRetirement)}), the annual investment return earned on your portfolio is larger than your living expenses. Your capital never needs to be touched; living costs are funded entirely out of returns, preserving generational wealth!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LIFESTYLE BREAKDOWN */}
      <LifestyleComparisonSection
        comparisons={results.lifestyleComparisons}
        currentLifestyle={profile.lifestyleScenario}
        onEditProfile={() => goToStep(1)}
      />

      {/* HOW WAS THIS CALCULATED DROPDOWN */}
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => setShowExplain(x => !x)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
        >
          {showExplain ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          How was this mathematically calculated?
        </button>
        {showExplain && (
          <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 text-xs text-zinc-700 dark:text-zinc-300 space-y-2 leading-relaxed">
            <p>
              <strong>Retirement Target Formula (Convention A):</strong> Required retirement corpus at Age {scenario.retirementAge} is computed using the present value of growing annuities over {scenario.retirementYears} retirement years:
              <br />
              <code className="text-[11px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                C = E_ret × [1 − ((1 + g) / (1 + r))^n] / (r − g)
              </code>
            </p>
            <p>
              <strong>Career Accumulation:</strong> Monthly take-home salary grows at {(assets.incomeGrowthRate * 100).toFixed(1)}%/yr. Net living expenses are subtracted each year, and the entire surplus is invested into the portfolio compounding at {formatPercent(scenario.returnRate)} net annual return.
            </p>
            <p className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              This calculator provides planning estimates based on mathematical compounding. Market returns and inflation fluctuate in practice.
            </p>
          </div>
        )}
      </div>

      {/* SCREEN TABS SELECTOR (Hidden in Print) */}
      <div className="print:hidden">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('income_vs_expense')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              activeTab === 'income_vs_expense'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            📊 Income vs Expenses Crossover
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            📈 Wealth Timeline (Corpus Curve)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            🥧 Category Composition
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
              activeTab === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            📋 Year-by-Year Table
          </button>
        </div>

        {/* Tab 1: Income vs Expenses Over Time */}
        {activeTab === 'income_vs_expense' && (
          <div className="space-y-4">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Lifetime Cashflow: Income vs Living Expenses
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {cashflowView === 'annual'
                      ? 'Green = Annual Income · Red = Living Expenses · Blue Area = Surplus Invested · Rose Area = Deficit Withdrawn'
                      : 'Cumulative Lifetime Trajectory: Total Cumulative Income vs Total Cumulative Living Costs'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setCashflowView('annual')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        cashflowView === 'annual'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Annual
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashflowView('cumulative')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        cashflowView === 'cumulative'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Cumulative
                    </button>
                  </div>
                  {hasActiveIncome && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                      <span>Crossover: Age {scenario.retirementAge}</span>
                    </div>
                  )}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                {cashflowView === 'annual' ? (
                  <AreaChart
                    data={incomeVsExpenseData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#71717a25" />
                    <XAxis
                      dataKey="age"
                      label={{ value: 'Age', position: 'insideBottom', offset: -2 }}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={v => formatCrore(v)}
                      tick={{ fontSize: 10 }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(v: any) => formatCrore(Number(v))}
                      labelFormatter={l => `Age ${l}`}
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-card-foreground)',
                        borderRadius: '0.75rem',
                      }}
                    />
                    <Legend verticalAlign="top" />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fill="#10b98125"
                      name="Total Income"
                      strokeWidth={2.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      fill="#ef444420"
                      name="Living Expenses"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="netSavings"
                      stroke="#3b82f6"
                      fill="#3b82f615"
                      name="Surplus Invested (+)"
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="netWithdrawal"
                      stroke="#f43f5e"
                      fill="#f43f5e15"
                      name="Deficit Withdrawn (-)"
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                ) : (
                  <AreaChart
                    data={cumulativeCashflowData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#71717a25" />
                    <XAxis
                      dataKey="age"
                      label={{ value: 'Age', position: 'insideBottom', offset: -2 }}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={v => formatCrore(v)}
                      tick={{ fontSize: 10 }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(v: any) => formatCrore(Number(v))}
                      labelFormatter={l => `Age ${l}`}
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-card-foreground)',
                        borderRadius: '0.75rem',
                      }}
                    />
                    <Legend verticalAlign="top" />
                    <Area
                      type="monotone"
                      dataKey="cumIncome"
                      stroke="#10b981"
                      fill="#10b98115"
                      name="Cumulative Income"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumExpenses"
                      stroke="#ef4444"
                      fill="#ef444415"
                      name="Cumulative Expenses"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#3b82f6"
                      fill="#3b82f625"
                      name="Portfolio Balance"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>

              {/* Phase explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">
                      Accumulation Phase (Age {profile.currentAge} → {scenario.retirementAge}):
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Earned income exceeds living costs. The surplus is continuously invested into your portfolio, fueling compounding growth.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-red-50/50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200/60 dark:border-red-900/40">
                  <ArrowDownRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-900 dark:text-red-300">
                      Retirement Phase (Age {scenario.retirementAge} → {profile.targetAge}):
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Active salary stops. Living expenses are paid from portfolio investment returns and accumulated corpus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wealth Timeline (Portfolio Balance Curve) */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Wealth Timeline (Portfolio Balance) — All 3 Scenarios
                </h4>
                <p className="text-xs text-zinc-500">
                  Portfolio balance trajectory across Optimistic, Base, and Conservative market return scenarios
                </p>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={portfolioData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#71717a25" />
                  <XAxis
                    dataKey="age"
                    label={{ value: 'Age', position: 'insideBottom', offset: -2 }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={v => formatCrore(v)}
                    tick={{ fontSize: 10 }}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v: any) => formatCrore(Number(v))}
                    labelFormatter={l => `Age ${l}`}
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-card-foreground)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Legend verticalAlign="top" />
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#10b981"
                    fill="#10b98125"
                    name="Optimistic (4% inf / 7% ret)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="base"
                    stroke="#3b82f6"
                    fill="#3b82f625"
                    name="Base (Current Settings)"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="conservative"
                    stroke="#f59e0b"
                    fill="#f59e0b25"
                    name="Conservative (6% inf / 7% ret)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Category Composition */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            {pieData.length > 0 && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-xs">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  Annual Expense Composition by Category
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width={240} height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any) => formatCrore(Number(v))}
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-card-foreground)',
                          borderRadius: '0.75rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-md shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate">
                          {d.name}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 shrink-0 ml-auto">
                          {formatCrore(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Year-by-Year Table */}
        {activeTab === 'table' && <ProjectionTable scenario={scenario} />}
      </div>

      {/* PRINT-ONLY COMPREHENSIVE VIEW: Prints ALL tabs, charts, and tables sequentially */}
      <div className="hidden print:block space-y-6">
        {/* Print Section 1: Cashflow Crossover Chart */}
        <div className="border border-zinc-300 rounded-xl p-4 bg-white space-y-3 print-break-inside-avoid">
          <h4 className="text-sm font-bold text-zinc-900">
            Chart 1: Lifetime Cashflow — Income vs Living Expenses Crossover
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="age" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => formatCrore(v)} tick={{ fontSize: 10 }} width={65} />
              <Legend verticalAlign="top" />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b98125" name="Total Income" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef444420" name="Living Expenses" strokeWidth={2} />
              <Area type="monotone" dataKey="netSavings" stroke="#3b82f6" fill="#3b82f615" name="Surplus Invested (+)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="netWithdrawal" stroke="#f43f5e" fill="#f43f5e15" name="Deficit Withdrawn (-)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Print Section 2: Wealth Timeline */}
        <div className="border border-zinc-300 rounded-xl p-4 bg-white space-y-3 print-break-inside-avoid">
          <h4 className="text-sm font-bold text-zinc-900">
            Chart 2: Wealth Timeline (Portfolio Balance Curve)
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={portfolioData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="age" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => formatCrore(v)} tick={{ fontSize: 10 }} width={65} />
              <Legend verticalAlign="top" />
              <Area type="monotone" dataKey="optimistic" stroke="#10b981" fill="#10b98125" name="Optimistic" strokeWidth={2} />
              <Area type="monotone" dataKey="base" stroke="#3b82f6" fill="#3b82f625" name="Base" strokeWidth={2.5} />
              <Area type="monotone" dataKey="conservative" stroke="#f59e0b" fill="#f59e0b25" name="Conservative" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Print Section 3: Category Breakdown */}
        {pieData.length > 0 && (
          <div className="border border-zinc-300 rounded-xl p-4 bg-white space-y-3 print-break-inside-avoid">
            <h4 className="text-sm font-bold text-zinc-900">
              Chart 3: Annual Expense Composition by Category
            </h4>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={220} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs flex-1">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-zinc-700 truncate">{d.name}</span>
                    <span className="font-bold text-zinc-900 ml-auto">{formatCrore(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Print Section 4: Full Projections Table */}
        <div className="border border-zinc-300 rounded-xl p-4 bg-white space-y-3 print-page-break">
          <h4 className="text-sm font-bold text-zinc-900">
            Table: Year-by-Year Financial Cashflows & Portfolio Balances
          </h4>
          <ProjectionTable scenario={scenario} full={true} />
        </div>
      </div>

      {/* Edit buttons */}
      <div className="flex flex-wrap gap-3 pt-2 print:hidden">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Edit Income & Assets (Step 2)</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Edit Dependents (Step 3)</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep(4)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Edit Living Expenses (Step 4)</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep(5)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Edit Assumptions (Step 5)</span>
        </button>
      </div>

      {/* High-contrast Disclaimer */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 p-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed print-break-inside-avoid">
        <strong className="text-zinc-900 dark:text-zinc-100">Financial Disclaimer:</strong> Estimated corpus under the assumptions you
        entered. This is an informational estimation tool, not regulated financial advice or a guaranteed safe withdrawal rate. Returns, inflation, tax provisions, and healthcare realities vary over time.
      </div>
    </div>
  )
}
