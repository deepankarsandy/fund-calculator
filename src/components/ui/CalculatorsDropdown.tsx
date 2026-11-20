import { useState, useRef, useEffect } from 'react'
import {
  Calculator,
  ChevronDown,
  BookOpen,
  TrendingUp,
  PiggyBank,
  Landmark,
  Percent,
  Sparkles,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export interface CalculatorDefinition {
  id: string
  name: string
  shortDesc: string
  longDesc?: string
  category: 'primary' | 'helper'
  status: 'active' | 'coming_soon'
  icon: typeof Calculator
  badge?: string
}

export const FINANCIAL_CALCULATORS: CalculatorDefinition[] = [
  {
    id: 'fund',
    name: 'Retirement Fund Calculator',
    shortDesc: 'Lifetime living costs, inflation compounding & retirement corpus',
    longDesc:
      'Estimate the exact investment corpus required to fund your lifestyle for life, calibrated for Indian inflation and geography.',
    category: 'primary',
    status: 'active',
    icon: Calculator,
    badge: 'Primary',
  },
  {
    id: 'sip',
    name: 'SIP Calculator',
    shortDesc: 'Monthly systematic investment compounding & target wealth',
    longDesc:
      'Calculate future wealth accumulation from monthly SIP contributions with customizable expected rate of return.',
    category: 'helper',
    status: 'active',
    icon: TrendingUp,
    badge: 'Active',
  },
  {
    id: 'investment',
    name: 'Investment & Returns',
    shortDesc: 'Lump-sum compound growth & multi-asset portfolio projection',
    longDesc:
      'Forecast compound returns across equities, mutual funds, gold, and debt for lumpsum and staggered allocations.',
    category: 'helper',
    status: 'active',
    icon: PiggyBank,
    badge: 'Active',
  },
  {
    id: 'fd',
    name: 'Fixed Deposit (FD)',
    shortDesc: 'Bank FD quarterly compounding, interest payouts & maturity',
    longDesc:
      'Compute maturity amounts and effective yields across standard, cumulative, and monthly payout fixed deposits.',
    category: 'helper',
    status: 'active',
    icon: Landmark,
    badge: 'Active',
  },
  {
    id: 'interest',
    name: 'Loan & Interest EMI',
    shortDesc: 'Home/car loan EMI, interest amortization & pre-payment benefits',
    longDesc:
      'Visualize principal vs interest breakdown, EMI schedules, and loan tenure reduction through extra payments.',
    category: 'helper',
    status: 'active',
    icon: Percent,
    badge: 'Active',
  },
]

interface CalculatorsDropdownProps {
  onSelectCalculator?: (id: string) => void
  onViewLogic?: () => void
  currentActive?: string
  className?: string
}

export function CalculatorsDropdown({
  onSelectCalculator,
  onViewLogic,
  currentActive,
  className,
}: CalculatorsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const primaryCalc = FINANCIAL_CALCULATORS.find((c) => c.category === 'primary')
  const activeHelperCalcs = FINANCIAL_CALCULATORS.filter(
    (c) => c.category === 'helper' && c.status === 'active'
  )
  const upcomingHelperCalcs = FINANCIAL_CALCULATORS.filter(
    (c) => c.category === 'helper' && c.status === 'coming_soon'
  )

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={cn(
          'text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs',
          isOpen
            ? 'bg-muted text-foreground border-border ring-2 ring-primary/20'
            : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
        title="Explore Calculators & Logic"
      >
        <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold">Calculators</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150',
            // Mobile: fixed within viewport, 12px margin on sides, max-width constrained, dynamic viewport max-height
            'fixed left-3 right-3 top-[60px] max-w-md mx-auto max-h-[calc(100dvh-5rem)] overflow-y-auto',
            // Desktop: absolute below trigger button, right-aligned
            'sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 md:w-96 sm:max-h-[85vh] sm:overflow-y-auto'
          )}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/70">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Financial Calculators</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                Fund Suite
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select an active tool or review mathematical logic
            </p>
          </div>

          {/* Active Primary Calculator CTA */}
          <div className="space-y-1">
            <div className="px-3 pt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Active Tool
            </div>
            {primaryCalc && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  if (onSelectCalculator) onSelectCalculator(primaryCalc.id)
                }}
                className={cn(
                  'w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer group',
                  currentActive === 'fund'
                    ? 'border-blue-500/50 bg-blue-50/60 dark:bg-blue-950/40 text-foreground'
                    : 'border-border/80 bg-background hover:bg-muted/60 text-foreground hover:border-border'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 group-hover:scale-105 transition-transform">
                  <Calculator className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-foreground truncate">
                      {primaryCalc.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Primary
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                    {primaryCalc.shortDesc}
                  </p>
                </div>
              </button>
            )}

            {/* Active Helper Calculators */}
            {activeHelperCalcs.map((calc) => {
              const IconComponent = calc.icon
              return (
                <button
                  key={calc.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    if (onSelectCalculator) onSelectCalculator(calc.id)
                  }}
                  className={cn(
                    'w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer group',
                    currentActive === calc.id
                      ? 'border-blue-500/50 bg-blue-50/60 dark:bg-blue-950/40 text-foreground'
                      : 'border-border/80 bg-background hover:bg-muted/60 text-foreground hover:border-border'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-foreground truncate">
                        {calc.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                        {calc.badge || 'Active'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                      {calc.shortDesc}
                    </p>
                  </div>
                </button>
              )
            })}

            {/* Calculation Logic CTA */}
            {onViewLogic && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onViewLogic()
                }}
                className={cn(
                  'w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer group',
                  currentActive === 'logic'
                    ? 'border-indigo-500/50 bg-indigo-50/60 dark:bg-indigo-950/40 text-foreground'
                    : 'border-border/80 bg-background hover:bg-muted/60 text-foreground hover:border-border'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-foreground">
                      Calculation Logic & Formulas
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                      Logic
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                    Explore compounding equations, inflation formulas & calibrations
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Upcoming Helper Calculators */}
          {upcomingHelperCalcs.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/70">
              <div className="px-3 pt-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Upcoming Helper Calculators
                </span>
                <span className="text-[9px] font-medium text-muted-foreground/80">
                  In Development
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto pr-0.5">
                {upcomingHelperCalcs.map((calc) => {
                  const IconComponent = calc.icon
                  return (
                    <div
                      key={calc.id}
                      className="p-2 rounded-xl border border-border/50 bg-muted/20 opacity-80 flex items-center justify-between gap-2.5 text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {calc.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {calc.shortDesc}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Soon</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
