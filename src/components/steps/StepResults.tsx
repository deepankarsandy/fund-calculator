import { useState } from 'react'
import { useScenarioStore } from '@/store/useScenarioStore'
import { formatCrore } from '@/lib/currency'
import { formatPercent } from '@/lib/format'
import { ChevronDown, ChevronRight, Edit2, AlertTriangle } from 'lucide-react'
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
  Optimistic: '#22c55e',
  Base: '#3b82f6',
  Conservative: '#f59e0b',
}

const CATEGORY_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#a3e635',
  '#64748b',
]

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
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
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? 'border-b-primary text-primary bg-primary/5'
          : 'border-b-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      <span style={{ color: active ? color : undefined }}>{scenario.label}</span>
      <span className="ml-2 text-xs opacity-70">
        {formatPercent(scenario.inflationRate)} / {formatPercent(scenario.returnRate)}
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
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              {['Year', 'Age', 'Opening ₹', 'Expenses ₹', 'Income ₹', 'Net Out ₹', 'Growth ₹', 'Closing ₹'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr
                key={row.year}
                className="border-t hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-2">{row.year}</td>
                <td className="px-3 py-2">{row.age}</td>
                <td className="px-3 py-2 text-right">{formatCrore(row.openingCorpus)}</td>
                <td className="px-3 py-2 text-right">{formatCrore(row.expenses)}</td>
                <td className="px-3 py-2 text-right">{formatCrore(row.otherIncome)}</td>
                <td className="px-3 py-2 text-right">{formatCrore(row.netWithdrawal)}</td>
                <td className="px-3 py-2 text-right text-green-600">{formatCrore(row.investmentGrowth)}</td>
                <td className={`px-3 py-2 text-right font-medium ${row.closingCorpus < 0 ? 'text-red-600' : ''}`}>
                  {formatCrore(row.closingCorpus)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded text-xs disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded text-xs disabled:opacity-40"
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
      <div className="text-center py-16">
        <p className="text-muted-foreground">No results yet. Go back and click Calculate.</p>
        <button
          type="button"
          onClick={() => goToStep(5)}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
        >
          ← Back
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
    <div className="space-y-6 max-w-4xl">
      {/* Warnings */}
      {results.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 space-y-1">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium text-sm">
            <AlertTriangle className="w-4 h-4" />
            Things to review
          </div>
          <ul className="space-y-1">
            {results.warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-700 dark:text-amber-400">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenario tabs */}
      <div className="border-b">
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
          label="Monthly household budget (today)"
          value={formatCrore(scenario.currentMonthlyEquivalent)}
          sub="Including annual costs averaged monthly"
        />
        <SummaryCard
          label="Annual household budget (today)"
          value={formatCrore(scenario.currentAnnualExpense)}
        />
        <SummaryCard
          label="Essential expenses / year"
          value={formatCrore(scenario.essentialAnnualExpense)}
        />
        <SummaryCard
          label="Discretionary expenses / year"
          value={formatCrore(scenario.discretionaryAnnualExpense)}
        />
        <SummaryCard
          label="Planning duration"
          value={`${profile.targetAge - profile.currentAge} years`}
          sub={`Age ${profile.currentAge} → ${profile.targetAge}`}
        />
        <SummaryCard
          label="Inflation / Net return"
          value={`${formatPercent(scenario.inflationRate)} / ${formatPercent(scenario.returnRate)}`}
          sub={
            assumptions.withdrawalTiming === 'end_of_year'
              ? 'End-of-year withdrawals'
              : 'Beginning-of-year withdrawals'
          }
        />
      </div>

      {/* Main corpus card */}
      <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Estimated Starting Corpus Required
            </p>
            <p className="text-4xl font-bold text-primary mt-1">
              {formatCrore(scenario.requiredCorpus)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Convention A ·{' '}
              {assumptions.withdrawalTiming === 'end_of_year'
                ? 'End'
                : 'Beginning'}
              -of-year withdrawals · {formatPercent(scenario.inflationRate)}{' '}
              inflation · {formatPercent(scenario.returnRate)} net return ·{' '}
              {profile.targetAge - profile.currentAge} years
            </p>
          </div>
          <div className="sm:text-right space-y-1">
            <p className="text-xs text-muted-foreground">Existing corpus</p>
            <p className="text-lg font-semibold">
              {formatCrore(scenario.existingCorpus)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground">Funding gap</p>
            <p
              className={`text-lg font-bold ${
                scenario.fundingGap > 0 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {scenario.fundingGap > 0
                ? formatCrore(scenario.fundingGap)
                : 'Surplus!'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Safety margin ({formatPercent(assumptions.safetyMarginPercent)})
            </p>
            <p className="text-lg font-bold">
              {formatCrore(scenario.safetyMarginAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Corpus with safety margin
            </p>
            <p className="text-lg font-bold text-primary">
              {formatCrore(scenario.corpusWithSafetyMargin)}
            </p>
          </div>
        </div>
      </div>

      {/* How was this calculated */}
      <div>
        <button
          type="button"
          onClick={() => setShowExplain(x => !x)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {showExplain ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          How was this calculated?
        </button>
        {showExplain && (
          <div className="mt-3 rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Formula:</strong> Growing annuity present value
              (Convention A). First year-end withdrawal equals today's annual
              expense E0.
            </p>
            <p>
              <strong>When r ≠ g:</strong> C = E0 × [1 − ((1+g)/(1+r))^n] / (r −
              g)
            </p>
            <p>
              <strong>Withdrawal timing:</strong>{' '}
              {assumptions.withdrawalTiming === 'end_of_year'
                ? 'End of year'
                : 'Beginning of year'}
            </p>
            <p>
              <strong>Return basis:</strong>{' '}
              {assumptions.returnBasis === 'net'
                ? 'Net of fees and taxes'
                : 'Gross — fees and tax drag subtracted'}
            </p>
            <p>
              <strong>Skipped categories</strong> are not included in the
              expense base.
            </p>
            <p className="pt-2 border-t">
              This is a planning estimate, not a guarantee. Actual returns,
              inflation, and lifespan are uncertain.
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize cursor-pointer ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-muted text-muted-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Portfolio balance */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3">
                Corpus Balance Over Time — All Scenarios
              </h4>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={portfolioData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                  />
                  <Legend verticalAlign="top" />
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#22c55e"
                    fill="#22c55e20"
                    name="Optimistic"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="base"
                    stroke="#3b82f6"
                    fill="#3b82f620"
                    name="Base"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="conservative"
                    stroke="#f59e0b"
                    fill="#f59e0b20"
                    name="Conservative"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expenses over time */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3">
                Annual Expenses & Income Over Time (Base Scenario)
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={expenseData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={v => formatCrore(v)}
                    tick={{ fontSize: 10 }}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v: any) => formatCrore(Number(v))}
                    labelFormatter={l => `Age ${l}`}
                  />
                  <Legend verticalAlign="top" />
                  <Area
                    type="monotone"
                    dataKey="nominal"
                    stroke="#ef4444"
                    fill="#ef444420"
                    name="Expenses"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    fill="#22c55e20"
                    name="Other Income"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            {pieData.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">
                  Annual Expense Breakdown by Category
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-4">
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
                      <Tooltip formatter={(v: any) => formatCrore(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-muted-foreground truncate">
                          {d.name}
                        </span>
                        <span className="font-medium shrink-0 ml-auto">
                          {formatCrore(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scenario comparison */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3">
                Scenario Comparison — Required Corpus
              </h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={results.scenarios.map(s => ({
                    name: s.label,
                    corpus: s.requiredCorpus,
                    withMargin: s.corpusWithSafetyMargin,
                  }))}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={v => formatCrore(v)}
                    tick={{ fontSize: 10 }}
                    width={70}
                  />
                  <Tooltip formatter={(v: any) => formatCrore(Number(v))} />
                  <Legend verticalAlign="top" />
                  <Bar
                    dataKey="corpus"
                    name="Required Corpus"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="withMargin"
                    name="With Safety Margin"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
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
          className="flex items-center gap-1.5 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Expenses
        </button>
        <button
          type="button"
          onClick={() => goToStep(4)}
          className="flex items-center gap-1.5 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Assumptions
        </button>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
        <strong>Disclaimer:</strong> Estimated corpus under the assumptions you
        entered. This is not a guaranteed safe withdrawal amount or personalised
        investment recommendation. Market returns, inflation, healthcare costs,
        tax treatment, and life circumstances are uncertain. Consult a
        registered financial adviser before making investment decisions.
      </div>
    </div>
  )
}
