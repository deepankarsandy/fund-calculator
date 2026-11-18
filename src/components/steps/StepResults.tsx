import { useState } from 'react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { formatCrore } from '@/lib/currency'
import { formatPercent } from '@/lib/format'
import { ChevronDown, ChevronRight, Edit2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { ScenarioResult } from '@/domain/models/results'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
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
          ? 'border-b-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
          : 'border-b-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
      }`}
    >
      <span style={{ color: active ? color : undefined }}>{scenario.label}</span>
      <span className="ml-2 text-xs font-semibold opacity-75">
        ({formatPercent(scenario.inflationRate)} infl / {formatPercent(scenario.returnRate)} return)
      </span>
    </button>
  )
}

function ProjectionTable({ scenario }: { scenario: ScenarioResult }) {
  const [page, setPage] = useState(0)
  const pageSize = 10
  const rows = scenario.yearProjections
  const totalPages = Math.ceil(rows.length / pageSize)
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-900">
        <table className="w-full text-xs">
          <thead className="bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
            <tr>
              {['Year', 'Age', 'Opening ₹', 'Expenses ₹', 'Income ₹', 'Net Out ₹', 'Growth ₹', 'Closing ₹'].map(h => (
                <th key={h} className="px-3.5 py-3 text-left font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
            {pageRows.map(row => (
              <tr
                key={row.year}
                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-3.5 py-2.5 font-semibold text-zinc-500">{row.year}</td>
                <td className="px-3.5 py-2.5 font-bold">{row.age}</td>
                <td className="px-3.5 py-2.5 text-right font-medium">{formatCrore(row.openingCorpus)}</td>
                <td className="px-3.5 py-2.5 text-right font-medium">{formatCrore(row.expenses)}</td>
                <td className="px-3.5 py-2.5 text-right font-medium">{formatCrore(row.otherIncome)}</td>
                <td className="px-3.5 py-2.5 text-right font-medium text-amber-700 dark:text-amber-400">{formatCrore(row.netWithdrawal)}</td>
                <td className="px-3.5 py-2.5 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCrore(row.investmentGrowth)}</td>
                <td className={`px-3.5 py-2.5 text-right font-bold ${row.closingCorpus < 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {formatCrore(row.closingCorpus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center pt-2">
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
  const { results, profile, assumptions, goToStep } = useScenarioStore()
  const [activeScenario, setActiveScenario] = useState(1) // Base by default
  const [showExplain, setShowExplain] = useState(false)
  const [activeTab, setActiveTab] = useState<'charts' | 'table'>('charts')

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

  // Portfolio chart data
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

  // Expenses over time
  const expenseData = scenario.yearProjections.map(row => ({
    age: row.age,
    nominal: row.expenses,
    income: row.otherIncome,
  }))

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Warnings & Suggestions with high contrast */}
      {results.warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 p-4 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Planning Items to Review</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-xs text-amber-900 dark:text-amber-300 font-medium">
            {results.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenario tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
      </div>

      {/* Main corpus card - modern high-contrast design */}
      <div className="rounded-2xl border-2 border-blue-600/60 dark:border-blue-500/60 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/20 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Estimated Starting Corpus Required
              </p>
            </div>
            <p className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 tracking-tight">
              {formatCrore(scenario.requiredCorpus)}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
              Growing Annuity (Convention A) · {assumptions.withdrawalTiming === 'end_of_year' ? 'End' : 'Beginning'}-of-year withdrawals · {formatPercent(scenario.inflationRate)} inflation · {formatPercent(scenario.returnRate)} net return · {profile.targetAge - profile.currentAge} years
            </p>
          </div>
          <div className="sm:text-right space-y-1 bg-white/80 dark:bg-zinc-800/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
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
                : 'Surplus (Fully Funded!)'}
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
              Corpus with Safety Margin
            </p>
            <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
              {formatCrore(scenario.corpusWithSafetyMargin)}
            </p>
          </div>
        </div>
      </div>

      {/* How was this calculated dropdown */}
      <div>
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
            <p>
              <strong>Formula:</strong> Growing annuity present value (Convention A). First year-end withdrawal equals today's annual living expenses $E_0$.
            </p>
            <p>
              <strong>When return ≠ inflation (r ≠ g):</strong> C = E₀ × [1 − ((1+g)/(1+r))^n] / (r − g)
            </p>
            <p>
              <strong>When return = inflation (r = g):</strong> C = E₀ × n / (1 + r) (special case avoiding division by zero).
            </p>
            <p>
              <strong>Timing:</strong> {assumptions.withdrawalTiming === 'end_of_year' ? 'End of period' : 'Beginning of period (multiplied by 1+r)'}.
            </p>
            <p className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              This is an estimation and planning tool, not an investment guarantee. Sequence-of-returns and market volatility can alter actual outcomes.
            </p>
          </div>
        )}
      </div>

      {/* Charts & Table tabs */}
      <div>
        <div className="flex gap-2 mb-4">
          {(['charts', 'table'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer shadow-xs ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {tab === 'charts' ? 'Visual Charts' : 'Year-by-Year Table'}
            </button>
          ))}
        </div>

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Portfolio balance */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-xs">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Corpus Balance Depletion Curve — All Scenarios
              </h4>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={portfolioData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#71717a25" />
                  <XAxis
                    dataKey="age"
                    label={{
                      value: 'Age',
                      position: 'insideBottom',
                      offset: -2,
                    }}
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
                    strokeWidth={2}
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

            {/* Expenses over time */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-xs">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Annual Living Expenses & Income Over Time (Base Scenario)
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={expenseData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#71717a25" />
                  <XAxis dataKey="age" tick={{ fontSize: 11 }} />
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
                    dataKey="nominal"
                    stroke="#ef4444"
                    fill="#ef444425"
                    name="Expenses"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    fill="#10b98125"
                    name="Other Income"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
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

            {/* Scenario comparison */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 shadow-xs">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Scenario Comparison — Required Corpus
              </h4>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart
                  data={results.scenarios.map(s => ({
                    name: s.label,
                    corpus: s.requiredCorpus,
                    withMargin: s.corpusWithSafetyMargin,
                  }))}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#71717a25" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={v => formatCrore(v)}
                    tick={{ fontSize: 10 }}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v: any) => formatCrore(Number(v))}
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-card-foreground)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Legend verticalAlign="top" />
                  <Bar
                    dataKey="corpus"
                    name="Required Corpus"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="withMargin"
                    name="With Safety Margin"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'table' && <ProjectionTable scenario={scenario} />}
      </div>

      {/* Edit buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
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
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 p-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <strong className="text-zinc-900 dark:text-zinc-100">Financial Disclaimer:</strong> Estimated corpus under the assumptions you
        entered. This is an informational estimation tool, not regulated financial advice or a guaranteed safe withdrawal rate. Returns, inflation, tax provisions, and healthcare realities vary over time.
      </div>
    </div>
  )
}
