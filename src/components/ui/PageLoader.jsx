import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Spinner } from './Spinner'

/**
 * @param {{ variant?: 'fullscreen' | 'content', className?: string, message?: string }} props
 */
export function PageLoader({ variant = 'content', className, message }) {
  const { t } = useTranslation()
  const label = message ?? t('common.loading')

  return (
    <div
      className={clsx(
        'grid place-items-center',
        variant === 'fullscreen' &&
          'min-h-screen bg-slate-50 dark:bg-slate-950',
        variant === 'content' && 'min-h-[40vh]',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
        <Spinner size="lg" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}
