import { Sparkles } from 'lucide-react'
import { useCleanView } from '@/lib/cleanView'
import { cn } from '@/lib/cn'

export function CleanViewToggle() {
  const { isCleanView, toggleCleanView } = useCleanView()

  const tooltipText = isCleanView
    ? 'Clean View: ON (Explanations, suggestions & schedule tables are minimized for quick calculations. Click to show full details)'
    : 'Clean View: OFF (Click to minimize helper texts, suggestions & tables for quick, distraction-free calculations)'

  return (
    <div className="relative group inline-flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={isCleanView}
        onClick={toggleCleanView}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/25',
          isCleanView
            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted border-border'
        )}
        title={tooltipText}
        aria-label={tooltipText}
      >
        <Sparkles
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-300',
            isCleanView ? 'text-white scale-110 rotate-12' : 'text-zinc-500 dark:text-zinc-400'
          )}
        />
        <span className="hidden sm:inline text-xs font-bold">Clean View</span>

        {/* Mini switch indicator */}
        <span
          className={cn(
            'w-6 h-3.5 flex items-center rounded-full p-0.5 transition-colors duration-200',
            isCleanView ? 'bg-white/30' : 'bg-zinc-300 dark:bg-zinc-700'
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-transform duration-200 shadow-xs',
              isCleanView ? 'translate-x-2.5 bg-white' : 'translate-x-0 bg-white dark:bg-zinc-300'
            )}
          />
        </span>
      </button>

      {/* Floating Tooltip Bubble for desktop hover */}
      <div className="pointer-events-none absolute right-0 top-full mt-2 w-64 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 p-2.5 text-[11px] leading-snug shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 hidden md:block">
        <div className="font-bold flex items-center gap-1.5 mb-0.5 text-blue-400 dark:text-blue-600">
          <Sparkles className="w-3 h-3" />
          <span>{isCleanView ? 'Clean View Active' : 'Clean View'}</span>
        </div>
        <p className="text-zinc-300 dark:text-zinc-600">
          {isCleanView
            ? 'Calculators are simplified: explanations, preset chips, and schedule tables are hidden. Click to show all.'
            : 'Quickly minimizes helper texts, suggestive buttons (e.g. 8%, 10%), and full schedule tables for fast, clean calculations.'}
        </p>
      </div>
    </div>
  )
}
