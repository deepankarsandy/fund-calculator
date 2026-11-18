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

function SummaryCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-xs ${
        highlight
          ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
      }`}
    >
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
      {sub && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{sub}</p>}
    </div>
  )
}

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
      className={`px-5 py-3 text-sm font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
        active
          ? 'border-current text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
          : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
      }`}
      style={{ color: active ? color : undefined }}
    >
      {scenario.label} ({formatPercent(scenario.inflationRate)} inf / {formatPercent(scenario.returnRate)} ret)
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
            Total Cost of Living & Corpus Requirement by Lifestyle
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
                  <span className="text-[11px] text-zinc-500">Monthly Today</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatCrore(c.monthlyExpenseToday)}/mo
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-zinc-500">Total Lifetime Cost</span>
                  <span className="font-extrabold text-red-600 dark:text-red-400">
                    {formatCrore(c.totalLifetimeCostOfLiving)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-zinc-500">Corpus Needed Today</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {c.requiredCorpus === 0 ? '₹0 (Self-Funded)' : formatCrore(c.requiredCorpus)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-zinc-500">Projected Peak Corpus</span>
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
              {['Year', 'Age', 'Total Income ₹', 'Expenses ₹', 'Net Invested (+) ₹', 'Net Withdrawn (-) ₹', 'Growth ₹', 'Portfolio Balance ₹'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-bold whitespace-nowrap">{h}</th>
              ))}
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
                <td className="px-3 py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                  {row.netSavings > 0 ? `+${formatCrore(row.netSavings)}` : '—'}
                </td>
                <td className="px-3 py-2 text-right font-bold text-amber-600 dark:text-amber-400">
                  {row.netWithdrawal > 0 ? `-${formatCrore(row.netWithdrawal)}` : '—'}
                </td>
                <td className="px-3 py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCrore(row.investmentGrowth)}</td>
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
  const { results, profile, assumptions, assets, goToStep } = useScenarioStore()
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
          onClick={() => goToStep(5)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 cursor-pointer"
        >
          ← Go Back to Assets
        </button>
      </div>
    )
  }

  const scenario = results.scenarios[activeScenario]
  const hasActiveIncome = (assets.monthlyIncome || 0) > 0
  const finalBalance = scenario.yearProjections[scenario.yearProjections.length - 1]?.closingCorpus ?? 0

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

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Top Header with PDF Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Lifetime Corpus & Financial Results
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Personalized projections, cashflow crossover, and lifestyle scenario comparison
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

      {/* Warnings & Suggestions with high contrast and actionable buttons */}
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
                    onClick={() => goToStep(2)}
                    className="ml-2 inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-200 underline hover:opacity-80 cursor-pointer print:hidden"
                  >
                    <Users className="w-3 h-3" />
                    <span>Add Dependents in Step 2 →</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenario tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {results.scenarios.map((s, i) => (
            <ScenarioTab
              key={s.label}
              scenario={s}
              active={activeScenario === i}
              onClick={() => setActiveScenario(i)}
            />
          ))}
        </div>
      </div>

      {/* Lifetime Financial Balance: Total Expenses vs Total Savings & Wealth */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4 print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Lifetime Financial Balance: Total Expenses vs Inflows & Wealth
            </h3>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            Age {profile.currentAge} → {profile.targetAge} ({profile.targetAge - profile.currentAge} Years)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="p-3 bg-red-50/70 dark:bg-red-950/20 rounded-xl border border-red-200/70 dark:border-red-900/40">
            <p className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
              Total Lifetime Expenses
            </p>
            <p className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 mt-1">
              {formatCrore(scenario.totalLifetimeExpenses)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Living costs inflated across lifetime</p>
          </div>

          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40">
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Total Lifetime Income
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCrore(scenario.totalLifetimeIncome)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Salary with hikes + pensions + rent</p>
          </div>

          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 rounded-xl border border-blue-200/70 dark:border-blue-900/40">
            <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              Career Surplus Invested
            </p>
            <p className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {formatCrore(scenario.totalLifetimeSavingsInvested + scenario.existingCorpus)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Current corpus + salary surpluses</p>
          </div>

          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/70 dark:border-indigo-900/40">
            <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
              Compound Returns Made
            </p>
            <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {formatCrore(scenario.totalLifetimeInvestmentGrowth)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Wealth purely from portfolio returns</p>
          </div>
        </div>

        {/* Visual Balance Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-red-600 dark:text-red-400">
              Total Outflow: {formatCrore(scenario.totalLifetimeExpenses)}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Total Inflows & Compounding: {formatCrore(scenario.totalLifetimeSavingsInvested + scenario.existingCorpus + scenario.totalLifetimeInvestmentGrowth)}
            </span>
          </div>
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="bg-red-500 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (scenario.totalLifetimeExpenses /
                    Math.max(
                      1,
                      scenario.totalLifetimeExpenses +
                        scenario.totalLifetimeSavingsInvested +
                        scenario.totalLifetimeInvestmentGrowth,
                    )) *
                    100,
                )}%`,
              }}
              title={`Expenses: ${formatCrore(scenario.totalLifetimeExpenses)}`}
            />
            <div
              className="bg-emerald-500 transition-all flex-1"
              title="Inflows & Compound Growth"
            />
          </div>
        </div>

        {/* Self-Sustaining Perpetual Portfolio Explanation */}
        {finalBalance >= scenario.peakCorpus * 0.99 && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Perpetual Self-Sustaining Portfolio (FIRE / Generational Legacy):</p>
              <p className="text-emerald-900 dark:text-emerald-300 mt-0.5 leading-relaxed">
                Your projected Peak Corpus ({formatCrore(scenario.peakCorpus)}) and Ending Balance ({formatCrore(finalBalance)}) are both the same because your annual investment growth ({formatPercent(scenario.returnRate)}) is larger than your annual living expenses. Your invested corpus continues expanding faster than you withdraw, leaving generational wealth at Age {profile.targetAge}!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary cards with accumulation and decumulation data */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print-break-inside-avoid">
        {hasActiveIncome ? (
          <>
            <SummaryCard
              label="Current Monthly Income"
              value={formatCrore(assets.monthlyIncome)}
              sub={`Earned until Age ${assets.incomeEndAge} (+${(assets.incomeGrowthRate * 100).toFixed(1)}%/yr)`}
              highlight
            />
            <SummaryCard
              label="Retirement Target"
              value={`Age ${assets.incomeEndAge}`}
              sub={`${Math.max(0, assets.incomeEndAge - profile.currentAge)} earning years remaining`}
              highlight
            />
            <SummaryCard
              label="Projected Peak Corpus"
              value={formatCrore(scenario.peakCorpus)}
              sub={`Accumulated by Age ${scenario.peakCorpusAge}`}
              highlight
            />
            <SummaryCard
              label="Total Career Savings"
              value={formatCrore(scenario.totalAccumulatedSavings)}
              sub="Surplus invested across working years"
            />
            <SummaryCard
              label="Annual Expenses (Today)"
              value={formatCrore(scenario.currentAnnualExpense)}
              sub={`≈ ${formatCrore(scenario.currentMonthlyEquivalent)}/mo`}
            />
            <SummaryCard
              label={`Ending Balance (Age ${profile.targetAge})`}
              value={finalBalance >= 0 ? formatCrore(finalBalance) : 'Depletes Early'}
              sub={finalBalance >= 0 ? 'Surplus wealth remaining' : `Runs out around Age ${scenario.depletionAge}`}
            />
          </>
        ) : (
          <>
            <SummaryCard
              label="Monthly budget (today)"
              value={formatCrore(scenario.currentMonthlyEquivalent)}
              sub="Annual costs averaged per month"
            />
            <SummaryCard
              label="Annual budget (today)"
              value={formatCrore(scenario.currentAnnualExpense)}
            />
            <SummaryCard
              label="Essential expenses / yr"
              value={formatCrore(scenario.essentialAnnualExpense)}
            />
            <SummaryCard
              label="Discretionary / yr"
              value={formatCrore(scenario.discretionaryAnnualExpense)}
            />
            <SummaryCard
              label="Planning Horizon"
              value={`${profile.targetAge - profile.currentAge} years`}
              sub={`Age ${profile.currentAge} → ${profile.targetAge}`}
            />
            <SummaryCard
              label="Inflation / Return Rate"
              value={`${formatPercent(scenario.inflationRate)} / ${formatPercent(scenario.returnRate)}`}
              sub={
                assumptions.withdrawalTiming === 'end_of_year'
                  ? 'End-of-year withdrawals'
                  : 'Beginning-of-year withdrawals'
              }
            />
          </>
        )}
      </div>

      {/* Main corpus highlight card */}
      <div className="rounded-2xl border-2 border-blue-600/60 dark:border-blue-500/60 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/20 p-6 space-y-4 shadow-sm print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                {hasActiveIncome ? 'Retirement Readiness & Corpus Goal' : 'Estimated Starting Corpus Required'}
              </p>
            </div>

            {hasActiveIncome ? (
              <div className="mt-2">
                <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                  {scenario.fundingGap === 0 ? 'Fully Self-Funded Plan' : `Need ${formatCrore(scenario.fundingGap)} Extra`}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium leading-relaxed max-w-xl">
                  {scenario.fundingGap === 0
                    ? `Your active monthly income (investing the surplus) is projected to accumulate a Peak Corpus of ${formatCrore(scenario.peakCorpus)} by Age ${assets.incomeEndAge}, comfortably financing your expenses through Age ${profile.targetAge}.`
                    : `Based on your current monthly income and expenses, your portfolio may be depleted by Age ${scenario.depletionAge}. An additional starting corpus of ${formatCrore(scenario.fundingGap)} today or increased monthly savings is recommended.`}
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                  {formatCrore(scenario.requiredCorpus)}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
                  Convention A · {assumptions.withdrawalTiming === 'end_of_year' ? 'End' : 'Beginning'}-of-year withdrawals · {formatPercent(scenario.inflationRate)} inflation · {formatPercent(scenario.returnRate)} net return · {profile.targetAge - profile.currentAge} years
                </p>
              </div>
            )}
          </div>

          <div className="sm:text-right space-y-1 bg-white/80 dark:bg-zinc-800/80 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Existing investable assets</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCrore(scenario.existingCorpus)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-blue-200/60 dark:border-zinc-800">
          <div className="p-3 bg-white/70 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Net Funding Gap</p>
            <p
              className={`text-lg font-extrabold ${
                scenario.fundingGap > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {scenario.fundingGap > 0
                ? formatCrore(scenario.fundingGap)
                : 'Fully Funded (No Gap)'}
            </p>
          </div>
          <div className="p-3 bg-white/70 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Safety Margin ({formatPercent(assumptions.safetyMarginPercent)})
            </p>
            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
              {formatCrore(scenario.safetyMarginAmount)}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800/60">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
              {hasActiveIncome ? 'Target Peak Wealth' : 'Corpus with Safety Margin'}
            </p>
            <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
              {formatCrore(hasActiveIncome ? scenario.peakCorpus : scenario.corpusWithSafetyMargin)}
            </p>
          </div>
        </div>
      </div>

      {/* Lifestyle Type Breakdown Section */}
      <LifestyleComparisonSection
        comparisons={results.lifestyleComparisons}
        currentLifestyle={profile.lifestyleScenario}
        onEditProfile={() => goToStep(1)}
      />

      {/* How was this calculated dropdown */}
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => setShowExplain(x => !x)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
        >
          {showExplain ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          How was this mathematically calculated?
        </button>
        {showExplain && (
          <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 text-xs text-zinc-700 dark:text-zinc-300 space-y-2 leading-relaxed">
            {hasActiveIncome ? (
              <>
                <p>
                  <strong>Accumulation Phase (Age {profile.currentAge} to {assets.incomeEndAge}):</strong> Your monthly income grows at {(assets.incomeGrowthRate * 100).toFixed(1)}% annually. Living expenses (inflating at {(scenario.inflationRate * 100).toFixed(1)}%) are subtracted each year, and the surplus is invested into your portfolio earning {(scenario.returnRate * 100).toFixed(1)}% annual return.
                </p>
                <p>
                  <strong>Peak Corpus at Retirement (Age {scenario.peakCorpusAge}):</strong> Portfolio reaches its maximum value of {formatCrore(scenario.peakCorpus)} when earned income stops.
                </p>
                <p>
                  <strong>Decumulation Phase (Age {assets.incomeEndAge} to {profile.targetAge}):</strong> Net living expenses (minus any pension/rent) are withdrawn from the invested corpus.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Formula:</strong> Growing annuity present value (Convention A). First year-end withdrawal equals today's annual living expenses E₀.
                </p>
                <p>
                  <strong>When return ≠ inflation (r ≠ g):</strong> C = E₀ × [1 − ((1+g)/(1+r))^n] / (r − g)
                </p>
                <p>
                  <strong>When return = inflation (r = g):</strong> C = E₀ × n / (1 + r) (special case avoiding division by zero).
                </p>
              </>
            )}
            <p className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              This is an estimation and planning tool, not an investment guarantee. Sequence-of-returns and market volatility can alter actual outcomes.
            </p>
          </div>
        )}
      </div>

      {/* Screen Interactive Tabs Selector (Hidden in Print) */}
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
                      ? 'Green = Annual Income · Red = Living Expenses · Blue = Surplus Invested · Amber = Savings Withdrawn'
                      : 'Lifetime Cumulative Trajectory: Total Cumulative Income vs Cumulative Expenses vs Portfolio'}
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
                      <span>Crossover: Age {assets.incomeEndAge}</span>
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
                      stroke="#f59e0b"
                      fill="#f59e0b15"
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
                      Accumulation Phase (Age {profile.currentAge} → {assets.incomeEndAge}):
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Earned income exceeds living costs. The surplus is continuously invested into your portfolio, fueling compounding growth.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  <ArrowDownRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      Decumulation Phase (Age {assets.incomeEndAge} → {profile.targetAge}):
                    </span>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Active income ends. Living costs exceed non-earned income, and the difference is drawn from your accumulated savings.
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
                  Shows accumulation to Peak Corpus at Age {scenario.peakCorpusAge}, followed by drawdown through retirement
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
                    name="Optimistic"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="base"
                    stroke="#3b82f6"
                    fill="#3b82f625"
                    name="Base"
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="conservative"
                    stroke="#f59e0b"
                    fill="#f59e0b25"
                    name="Conservative"
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
              <Area type="monotone" dataKey="netWithdrawal" stroke="#f59e0b" fill="#f59e0b15" name="Deficit Withdrawn (-)" strokeWidth={1.5} />
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
          onClick={() => goToStep(5)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Edit Monthly Income & Assets</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep(3)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Edit Living Expenses</span>
        </button>
        <button
          type="button"
          onClick={() => goToStep(4)}
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Edit Assumptions</span>
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
