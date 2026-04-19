import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const THEME_KEY = 'outcome.theme.mode'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function readStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(THEME_KEY)
    return raw === 'light' || raw === 'dark' ? raw : null
  } catch {
    return null
  }
}

function getInitialTheme(): ThemeMode {
  const stored = readStoredTheme()
  if (stored) return stored

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }

  return 'dark'
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme

  const sparkRoot = document.getElementById('spark-app')
  if (sparkRoot) {
    sparkRoot.classList.toggle('dark-theme', theme === 'dark')
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme())

  useEffect(() => {
    applyTheme(theme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, theme)
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
