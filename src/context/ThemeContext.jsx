import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'bm_theme'
export const THEMES = ['light', 'dark', 'system']

function getSystemPref() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyTheme(mode) {
  const effective = mode === 'system' ? getSystemPref() : mode
  const root = document.documentElement
  if (effective === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  return effective
}

function loadInitial() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (THEMES.includes(v)) return v
  } catch {
    // ignore
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(loadInitial)
  const [resolved, setResolved] = useState(() =>
    mode === 'system' ? getSystemPref() : mode,
  )

  // apply on mount + when mode changes
  useEffect(() => {
    const eff = applyTheme(mode)
    setResolved(eff)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ignore
    }
  }, [mode])

  // listen to system preference changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolved(applyTheme('system'))
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [mode])

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setMode(next)
  }, [])

  const toggle = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ mode, resolved, setTheme, toggle }),
    [mode, resolved, setTheme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
