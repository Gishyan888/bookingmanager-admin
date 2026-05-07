import { Navigate, useLocation } from 'react-router-dom'
import { PageLoader } from '../components/ui/PageLoader'
import { homeForRole, useAuth } from '../context/AuthContext'

export function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader variant="fullscreen" />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return children
}

export function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader variant="fullscreen" />
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return children
}
