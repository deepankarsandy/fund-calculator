import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme, Theme } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ]

  return (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700/80">
      {options.map(opt => {
        const Icon = opt.icon
        const isActive = theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
              isActive
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
            title={`Theme: ${opt.label}`}
            aria-label={`Switch to ${opt.label} theme`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
