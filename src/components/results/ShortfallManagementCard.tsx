import { useState } from 'react'
import type { ScenarioResult } from '@/domain/models/results'
import { formatCrore } from '@/lib/currency'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/cn'
import { Wallet, Briefcase, Clock, Sparkles, CheckCircle2, Info, ShieldAlert } from 'lucide-react'

interface ShortfallManagementCardProps {
  scenario: ScenarioResult
  allScenarios: ScenarioResult[]
  activeScenarioIndex: number
  onSelectScenario: (index: number) => void
  onApplyRemedy: (type: 'savings' | 'salary' | 'retirement_age', value: number) => void
  onEditStep?: (step: number) => void
}

export function ShortfallManagementCard({
  scenario,
  allScenarios,
  activeScenarioIndex,
  onSelectScenario,
  onApplyRemedy,
  onEditStep,
}: ShortfallManagementCardProps) {
  const [appliedOption, setAppliedOption] = useState<string | null>(null)

  const currentRemedies = scenario.shortfallRemedies
  const currentHasShortfall =
    currentRemedies?.hasShortfall ??
    (scenario.readinessScore < 100 || scenario.retirementFundingGap > 0 || scenario.fundingGap > 0)

  // Check if any scenario in results has a shortfall
  const anyScenarioHasShortfall = allScenarios.some(
    (s) =>
      (s.shortfallRemedies?.hasShortfall ?? false) ||
      s.readinessScore < 100 ||
      s.retirementFundingGap > 0 ||
      s.fundingGap > 0
  )

  // Find first scenario that has a shortfall (if active scenario does not)
  const shortfallScenarioIndex = allScenarios.findIndex(
    (s) =>
      (s.shortfallRemedies?.hasShortfall ?? false) ||
      s.readinessScore < 100 ||
      s.retirementFundingGap > 0 ||
      s.fundingGap > 0
  )

  // If no scenario in any plan/mode has any shortfall
  if (!anyScenarioHasShortfall) {
    return (
      <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-zinc-900 p-5 space-y-3 shadow-xs print-break-inside-avoid">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="text-sm font-bold">Zero Shortfall Detected Across All Modes</h3>
        </div>
        <p className="text-xs text-emerald-800 dark:text-zinc-300 leading-relaxed font-medium">
          Your current retirement trajectory is 100% self-funded across all market scenarios
          (Optimistic, Base, and Conservative). No extra savings, salary increments, or retirement
          deferrals are required.
        </p>
      </div>
    )
  }

  // If the currently selected scenario has no shortfall, but another scenario does
  if (!currentHasShortfall && shortfallScenarioIndex !== -1) {
    const alternativeScenario = allScenarios[shortfallScenarioIndex]
    return (
      <div className="rounded-2xl border border-amber-300 dark:border-amber-800/70 bg-amber-50/80 dark:bg-zinc-900 p-5 space-y-3 shadow-xs print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-bold text-sm">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Shortfall Notice for Alternative Market Scenarios</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectScenario(shortfallScenarioIndex)}
            className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Switch to {alternativeScenario.label} Scenario →</span>
          </button>
        </div>
        <p className="text-xs text-amber-900 dark:text-zinc-300 leading-relaxed font-medium">
          Your active plan is on track under <strong>{scenario.label}</strong> conditions (+
          {formatCrore(scenario.retirementSurplus)} surplus). However, under the{' '}
          <strong>{alternativeScenario.label}</strong> scenario (
          {formatPercent(alternativeScenario.inflationRate)} inflation,{' '}
          {formatPercent(alternativeScenario.returnRate)} returns), a shortfall of{' '}
          <strong>{formatCrore(alternativeScenario.retirementFundingGap)}</strong> would emerge.
        </p>
        <button
          type="button"
          onClick={() => onSelectScenario(shortfallScenarioIndex)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold shadow-2xs cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>View How to Bridge Shortfall in {alternativeScenario.label} Mode</span>
        </button>
      </div>
    )
  }

  const remedies = currentRemedies!
  const { savingsRemedy, salaryRemedy, retirementAgeRemedy } = remedies

  const handleApply = (
    type: 'savings' | 'salary' | 'retirement_age',
    value: number,
    label: string
  ) => {
    onApplyRemedy(type, value)
    setAppliedOption(label)
    setTimeout(() => {
      setAppliedOption(null)
    }, 4000)
  }

  return (
    <div className="rounded-2xl border-2 border-amber-500/60 dark:border-amber-600/70 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 p-5 sm:p-6 space-y-5 shadow-xs print-break-inside-avoid">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-zinc-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Managing Your Retirement Shortfall ({scenario.label} Mode)
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Projected shortfall of <strong>{formatCrore(scenario.retirementFundingGap)}</strong> at
            retirement (or {formatCrore(scenario.fundingGap)} today)
          </p>
        </div>

        {/* Right Header Area: Scenario Switcher & Big OR Indicator Pill */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {allScenarios.length > 1 && (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              {allScenarios.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onSelectScenario(idx)}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer',
                    activeScenarioIndex === idx
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>3 OR Possibilities · Any 1 Bridges Gap</span>
          </div>
        </div>
      </div>

      {/* Explanatory Banner highlighting the OR logic */}
      <div className="p-3.5 rounded-xl border border-amber-200/90 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
        <p>
          <strong>Independent OR Solutions:</strong> You do <em>not</em> need to implement all
          three. Achieving <strong>any single one</strong> of the three targets below will
          independently complete the entire shortfall and bring your retirement readiness to{' '}
          <strong>100% Fully Funded</strong>.
        </p>
      </div>

      {appliedOption && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Applied {appliedOption}! Shortfall is now ₹0 (100% Funded).</span>
          </span>
          <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300">
            Updated in live model
          </span>
        </div>
      )}

      {/* 3 Possibilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Possibility 1: Current Savings (Lump Sum Today) */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-zinc-900/90 hover:border-blue-300 dark:hover:border-blue-700/60 p-4 space-y-3.5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wide">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Possibility 1 (OR)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800/60 text-blue-800 dark:text-blue-300">
                Current Savings
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Increase Starting Savings Today
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Invest extra liquid capital today and let compounding bridge the entire gap.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                  Extra Savings Needed:
                </span>
                <span className="font-black text-blue-700 dark:text-blue-400 text-sm">
                  +{formatCrore(savingsRemedy.extraSavingsNeeded)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-blue-100 dark:border-blue-900/50">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                  Total Savings Needed Today:
                </span>
                <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                  {formatCrore(savingsRemedy.totalSavingsNeeded)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Existing liquid savings today:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatCrore(savingsRemedy.currentSavings)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Adding <strong>+{formatCrore(savingsRemedy.extraSavingsNeeded)}</strong> today grows
              at {formatPercent(scenario.returnRate)} for {scenario.workingYears} career years into{' '}
              {formatCrore(scenario.retirementFundingGap)} at retirement.
            </p>
          </div>

          <div className="pt-2 print:hidden">
            <button
              type="button"
              onClick={() =>
                handleApply(
                  'savings',
                  savingsRemedy.totalSavingsNeeded,
                  `Total Savings to ${formatCrore(savingsRemedy.totalSavingsNeeded)}`
                )
              }
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply {formatCrore(savingsRemedy.totalSavingsNeeded)} Savings</span>
            </button>
          </div>
        </div>

        {/* Possibility 2: Monthly Salary (Take-Home Income) */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-zinc-900/90 hover:border-emerald-300 dark:hover:border-emerald-700/60 p-4 space-y-3.5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wide">
                <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Possibility 2 (OR)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                Monthly Salary
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Increase Current Monthly Salary
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Channel more monthly surplus into career savings without changing retirement age.
              </p>
            </div>

            {salaryRemedy.isAchievable ? (
              <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-2 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    Extra Monthly Salary:
                  </span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                    +{formatCrore(salaryRemedy.extraMonthlySalaryNeeded)}/mo
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    Total Monthly Salary Needed:
                  </span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                    {formatCrore(salaryRemedy.totalMonthlySalaryNeeded)}/mo
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Current monthly salary today:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatCrore(salaryRemedy.currentMonthlySalary)}/mo (
                    {salaryRemedy.percentIncreaseNeeded > 0
                      ? `+${salaryRemedy.percentIncreaseNeeded}%`
                      : '0%'}
                    )
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                {salaryRemedy.note || 'Salary remedy not applicable.'}
              </div>
            )}

            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Earning <strong>{formatCrore(salaryRemedy.totalMonthlySalaryNeeded)}/mo</strong>{' '}
              invests an extra +{formatCrore(salaryRemedy.extraMonthlySalaryNeeded)}/mo monthly,
              compounding each year with salary hikes to bridge the shortfall.
            </p>
          </div>

          <div className="pt-2 print:hidden">
            {salaryRemedy.isAchievable ? (
              <button
                type="button"
                onClick={() =>
                  handleApply(
                    'salary',
                    salaryRemedy.totalMonthlySalaryNeeded,
                    `Salary to ${formatCrore(salaryRemedy.totalMonthlySalaryNeeded)}/mo`
                  )
                }
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply {formatCrore(salaryRemedy.totalMonthlySalaryNeeded)}/mo</span>
              </button>
            ) : (
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center py-2">
                Not applicable for this scenario
              </div>
            )}
          </div>
        </div>

        {/* Possibility 3: Continue to Work / Retirement Age */}
        <div className="rounded-xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-zinc-900/90 hover:border-purple-300 dark:hover:border-purple-700/60 p-4 space-y-3.5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wide">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Possibility 3 (OR)</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 border border-purple-200/60 dark:border-purple-800/60 text-purple-800 dark:text-purple-300">
                Work Longer
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Continue Working Longer
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Delay retirement to save more years and shorten the post-retirement span.
              </p>
            </div>

            {retirementAgeRemedy.isAchievable ? (
              <div className="p-3 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 space-y-2 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    Recommended Retirement Age:
                  </span>
                  <span className="font-black text-purple-700 dark:text-purple-400 text-sm">
                    Age {retirementAgeRemedy.recommendedRetirementAge}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-purple-100 dark:border-purple-900/50">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    Extra Time to Continue Working:
                  </span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                    +{retirementAgeRemedy.extraYearsToWork} years
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Current planned retirement:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Age {retirementAgeRemedy.currentRetirementAge} (
                    {retirementAgeRemedy.remainingRetirementYears} yrs in ret.)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                {retirementAgeRemedy.note || 'Retirement extension alone does not bridge the gap.'}
              </div>
            )}

            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {retirementAgeRemedy.isAchievable ? (
                <>
                  Working until <strong>Age {retirementAgeRemedy.recommendedRetirementAge}</strong>{' '}
                  adds {retirementAgeRemedy.extraYearsToWork} years of career compounding while
                  reducing retirement living costs to {retirementAgeRemedy.remainingRetirementYears}{' '}
                  years.
                </>
              ) : (
                <>
                  Monthly living costs exceed current income surplus. Please utilize Option 1
                  (Savings) or Option 2 (Salary).
                </>
              )}
            </p>
          </div>

          <div className="pt-2 print:hidden">
            {retirementAgeRemedy.isAchievable ? (
              <button
                type="button"
                onClick={() =>
                  handleApply(
                    'retirement_age',
                    retirementAgeRemedy.recommendedRetirementAge,
                    `Retirement Age to ${retirementAgeRemedy.recommendedRetirementAge}`
                  )
                }
                className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Retirement Age {retirementAgeRemedy.recommendedRetirementAge}</span>
              </button>
            ) : (
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center py-2">
                Not achievable with current cashflow
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 print:hidden">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>
            Clicking any "Apply" button updates your inputs and immediately simulates a 100% funded
            plan.
          </span>
        </span>
        {onEditStep && (
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline self-start sm:self-auto cursor-pointer"
          >
            Or manually edit Income & Assets in Step 2 →
          </button>
        )}
      </div>
    </div>
  )
}
