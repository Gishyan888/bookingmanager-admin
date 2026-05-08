import { Mail, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo, LogoMark } from '../../components/branding/Logo'
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher'
import { ThemeSwitcher } from '../../components/layout/ThemeSwitcher'

export function AuthLayout({ title, subtitle, children, footer }) {
  const { t } = useTranslation()
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 p-10 text-white lg:flex">
        <Logo wordmark={false} className="!gap-0" />
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={48} />
            <div className="text-2xl font-bold">{t('app.name')}</div>
          </div>
          <h2 className="mt-8 text-4xl font-bold leading-tight tracking-tight">
            {t('auth.heroTitle')}
          </h2>
          <p className="mt-4 max-w-md text-base text-white/85">
            {t('auth.heroBody')}
          </p>
        </div>
        <div className="text-xs text-white/70">
          © {new Date().getFullYear()} {t('app.name')} — {t('app.tagline')}
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center bg-white px-6 py-10 dark:bg-slate-950 sm:px-10">
        {/* top-right switchers */}
        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex shrink-0 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 p-2.5 shadow-md ring-1 ring-slate-900/10 dark:ring-white/20">
              <LogoMark size={40} />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {t('app.name')}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                {t('app.tagline')}
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          <div className="mt-8">{children}</div>
          {footer && (
            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {footer}
            </div>
          )}
        </div>

        {/* bottom-right support contact */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end sm:px-0">
          <div className="pointer-events-auto rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-xs shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
              {t('auth.needHelp', { defaultValue: 'Need help?' })}
            </div>
            <div className="flex flex-col gap-1 text-slate-700 dark:text-slate-200 sm:flex-row sm:items-center sm:gap-3">
              <a
                href="tel:+37491511122"
                className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-300"
              >
                <Phone size={13} className="text-violet-600 dark:text-violet-300" />
                <span className="font-medium">+374 91 511 122</span>
              </a>
              <span className="hidden h-3 w-px bg-slate-300 dark:bg-slate-700 sm:inline-block" />
              <a
                href="mailto:info@bookingmanager.online"
                className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-300"
              >
                <Mail size={13} className="text-violet-600 dark:text-violet-300" />
                <span className="font-medium">info@bookingmanager.online</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
