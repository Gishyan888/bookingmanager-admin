import { LogOut, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NotificationBell } from './NotificationBell'
import { ThemeSwitcher } from './ThemeSwitcher'

export function Topbar({ onOpenSidebar }) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button
        type="button"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        onClick={onOpenSidebar}
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <NotificationBell />
      <LanguageSwitcher />
      <ThemeSwitcher />

      <div className="hidden items-center gap-3 sm:flex">
        <Link to="/profile" className="text-right">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {user?.name}
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {user?.role ? t(`roles.${user.role}`) : ''}
          </div>
        </Link>
        <Link
          to="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white"
          title="Edit profile"
        >
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </Link>
      </div>

      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-rose-600 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-rose-400"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">{t('common.signOut')}</span>
      </button>
    </header>
  )
}
