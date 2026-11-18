import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'corpus_theme'

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved
  }
  return 'system'
}

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  const isDark = theme === 'system' ? getSystemTheme() === 'dark' : theme === 'dark'

  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem(STORAGE_KEY, theme)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getSavedTheme())
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme())

  useEffect(() => {
    applyTheme(theme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const currentSys = mediaQuery.matches ? 'dark' : 'light'
      setSystemTheme(currentSys)
      if (getSavedTheme() === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemTheme : theme
  const isDark = resolvedTheme === 'dark'

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    // If currently dark (via system or explicit), toggle to light.
    // If currently light (via system or explicit), toggle to dark.
    const nextTheme: 'light' | 'dark' = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return { theme, resolvedTheme, isDark, setTheme, toggleTheme }
}
