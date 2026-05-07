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
          <div className="mb-8 lg:hidden">
            <Logo />
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
      </div>
    </div>
  )
}
