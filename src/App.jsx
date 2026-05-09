import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider, ROLE, homeForRole, useAuth } from './context/AuthContext'
import { ApiLoadingProvider } from './context/ApiLoadingContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminHotelsPage } from './pages/admin/HotelsPage'
import { OwnersPage } from './pages/admin/OwnersPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { HelpPage } from './pages/help/HelpPage'
import { ManagerDashboard } from './pages/manager/ManagerDashboard'
import { OwnerDashboard } from './pages/owner/OwnerDashboard'
import { OwnerHotelsPage } from './pages/owner/OwnerHotelsPage'
import { OwnerManagersPage } from './pages/owner/OwnerManagersPage'
import { BookingsPage } from './pages/shared/BookingsPage'
import { CustomersPage } from './pages/shared/CustomersPage'
import { NotificationsPage } from './pages/shared/NotificationsPage'
import { ProfilePage } from './pages/shared/ProfilePage'
import { RoomsPage } from './pages/shared/RoomsPage'
import { PageLoader } from './components/ui/PageLoader'
import { RedirectIfAuthed, RequireAuth } from './routes/RequireAuth'
import { pickerHtmlLang } from './utils/localeUi'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader variant="fullscreen" />
  return <Navigate to={user ? homeForRole(user.role) : '/login'} replace />
}

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="text-center">
        <div className="text-6xl font-bold text-violet-600 dark:text-violet-400">
          {t('notFound.title')}
        </div>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          {t('notFound.body')}
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          {t('notFound.goHome')}
        </a>
      </div>
    </div>
  )
}

function SyncDocumentLang() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const apply = () => {
      document.documentElement.lang = pickerHtmlLang(i18n.resolvedLanguage)
    }
    apply()
    i18n.on('languageChanged', apply)
    return () => {
      i18n.off('languageChanged', apply)
    }
  }, [i18n])

  return null
}

function ToasterAdapter() {
  const { resolved } = useTheme()
  const dark = resolved === 'dark'
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontSize: 14,
          borderRadius: 10,
          background: dark ? '#1e293b' : '#ffffff',
          color: dark ? '#e2e8f0' : '#0f172a',
          border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
        },
        success: { iconTheme: { primary: '#7c3aed', secondary: 'white' } },
      }}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SyncDocumentLang />
      <ThemeProvider>
        <ApiLoadingProvider>
          <AuthProvider>
            <NotificationProvider>
              <ToasterAdapter />
              <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <LoginPage />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuthed>
                  <RegisterPage />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/verify-email"
              element={
                <RedirectIfAuthed>
                  <VerifyEmailPage />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <RedirectIfAuthed>
                  <ForgotPasswordPage />
                </RedirectIfAuthed>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <RequireAuth roles={[ROLE.ADMIN]}>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="owners" element={<OwnersPage />} />
              <Route path="hotels" element={<AdminHotelsPage />} />
            </Route>

            {/* Owner */}
            <Route
              path="/owner"
              element={
                <RequireAuth roles={[ROLE.OWNER]}>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<OwnerDashboard />} />
              <Route path="hotels" element={<OwnerHotelsPage />} />
              <Route path="managers" element={<OwnerManagersPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="bookings" element={<BookingsPage />} />
            </Route>

            {/* Manager */}
            <Route
              path="/manager"
              element={
                <RequireAuth roles={[ROLE.MANAGER]}>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<ManagerDashboard />} />
              <Route path="rooms" element={<RoomsPage readOnly />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="bookings" element={<BookingsPage />} />
            </Route>

            {/* Help — available to any signed-in role */}
            <Route
              path="/help"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<HelpPage />} />
            </Route>

            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<NotificationsPage />} />
            </Route>

            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route index element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </ApiLoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
