import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { auth as authApi } from '../api/endpoints'
import i18n from '../i18n'
import { setAuthToken } from '../api/client'
import { useTheme } from './ThemeContext'

const AuthContext = createContext(null)

export const ROLE = {
  ADMIN: 'admin',
  OWNER: 'owner',
  MANAGER: 'manager',
}

const HOME_FOR_ROLE = {
  [ROLE.ADMIN]: '/admin',
  [ROLE.OWNER]: '/owner',
  [ROLE.MANAGER]: '/manager',
}

export function homeForRole(role) {
  return HOME_FOR_ROLE[role] || '/login'
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('bm_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const { setTheme } = useTheme()
  const [user, setUser] = useState(loadStoredUser)
  const [loading, setLoading] = useState(true)

  const applyUserPreferences = useCallback(
    (u) => {
      const lang = u?.preferredLanguage || 'hy'
      const theme = u?.preferredTheme || 'light'
      try {
        localStorage.setItem('bm_lang', lang)
        localStorage.setItem('bm_theme', theme)
      } catch {
        // ignore
      }
      i18n.changeLanguage(lang)
      setTheme(theme)
    },
    [setTheme],
  )

  useEffect(() => {
    const token = localStorage.getItem('bm_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((u) => {
        applyUserPreferences(u)
        setUser(u)
        localStorage.setItem('bm_user', JSON.stringify(u))
      })
      .catch(() => {
        setAuthToken(null)
        localStorage.removeItem('bm_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authApi.login({ email, password })
    setAuthToken(token)
    applyUserPreferences(u)
    localStorage.setItem('bm_user', JSON.stringify(u))
    setUser(u)
    return u
  }, [applyUserPreferences])

  const refreshUser = useCallback(async () => {
    const u = await authApi.me()
    applyUserPreferences(u)
    localStorage.setItem('bm_user', JSON.stringify(u))
    setUser(u)
    return u
  }, [applyUserPreferences])

  /**
   * Self-registration returns a pending response and sends an email OTP.
   * Caller should navigate to verify-email screen with the registered email.
   */
  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload)
    return res
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    localStorage.removeItem('bm_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
