import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getPageWindow } from '../../utils/pagination'

const btnBase =
  'inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-sm tabular-nums ring-1 transition disabled:cursor-not-allowed disabled:opacity-40'
const btnGhost =
  'text-slate-600 ring-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-800'
const btnActive = 'bg-violet-600 text-white ring-violet-600 hover:bg-violet-700'

/**
 * Prev / numbered pages (sliding window) / next. Used by DataTable and any list view.
 */
export function PaginationBar({
  page = 1,
  totalPages = 1,
  onPageChange,
  total,
  windowSize = 10,
  className,
}) {
  const { t } = useTranslation()
  const tp = Math.max(1, totalPages)
  const pages = getPageWindow(page, tp, windowSize)

  return (
    <div
      className={clsx(
        'flex flex-col items-stretch gap-3 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <span className="shrink-0">
        {t('common.page')} <strong>{page}</strong> {t('common.of')} {tp}
        {total !== undefined ? (
          <span className="ml-2 text-slate-400 dark:text-slate-500">
            · {total} {t('common.total')}
          </span>
        ) : null}
      </span>
      <div className="flex flex-wrap items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={clsx(btnBase, btnGhost, 'px-2')}
          aria-label={t('common.prev')}
        >
          <ChevronLeft size={16} /> {t('common.prev')}
        </button>
        <div className="mx-0.5 flex flex-wrap items-center gap-1">
          {pages.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              aria-current={num === page ? 'page' : undefined}
              className={clsx(
                btnBase,
                'min-w-[2.25rem] px-2',
                num === page ? btnActive : btnGhost,
              )}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(tp, page + 1))}
          disabled={page >= tp}
          className={clsx(btnBase, btnGhost, 'px-2')}
          aria-label={t('common.next')}
        >
          {t('common.next')} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
