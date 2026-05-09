import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../branding/Logo'
import { SIDEBAR_BY_ROLE } from './sidebar-config'

export function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const cfg = SIDEBAR_BY_ROLE[user?.role] || SIDEBAR_BY_ROLE.manager

  return (
    <>
      {/* mobile overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={clsx(
          // Keep fixed on lg too — lg:static made the bar scroll away with the page.
          'fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-16 items-center border-b border-slate-100 px-5 dark:border-slate-800">
          <Logo />
        </div>

        <div className="px-5 pt-4 pb-2">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={clsx(
              'block rounded-xl bg-gradient-to-br p-3 text-white shadow-sm outline-none ring-offset-2 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/80',
              cfg.accent,
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
              {user?.role ? t(`roles.${user.role}`) : ''}
            </div>
            <div className="mt-0.5 text-sm font-semibold">{t(cfg.labelKey)}</div>
            <div className="mt-1 truncate text-xs text-white/85">
              {user?.name}
            </div>
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {cfg.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={clsx(
                      'shrink-0 transition',
                      isActive
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
                    )}
                  />
                  <span>{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          {t('app.version')} · {t('app.name')}
        </div>
      </aside>
    </>
  )
}
