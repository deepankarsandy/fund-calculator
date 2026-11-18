import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all cursor-pointer shadow-xs flex items-center justify-center"
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-300 transition-transform hover:-rotate-12" />
      )}
    </button>
  )
}
