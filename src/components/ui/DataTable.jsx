import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from './Spinner'

export function DataTable({
  columns,
  data,
  loading,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  onSearch,
  searchPlaceholder,
  emptyText,
  toolbar,
  rowKey = (r) => r.id,
}) {
  const { t } = useTranslation()
  const [term, setTerm] = useState('')

  useEffect(() => {
    if (!onSearch) return undefined
    const tm = setTimeout(() => onSearch(term), 300)
    return () => clearTimeout(tm)
  }, [term, onSearch])

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      {(onSearch || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          {onSearch ? (
            <div className="relative w-full max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={searchPlaceholder ?? t('common.search')}
                className="block w-full rounded-lg border-0 bg-slate-50 py-2 pl-9 pr-3 text-base text-slate-800 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 transition focus:bg-white focus:ring-2 focus:ring-inset focus:ring-violet-500 md:text-sm dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-violet-400"
              />
            </div>
          ) : (
            <div />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/70 dark:bg-slate-800/40">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={clsx(
                    'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400',
                    c.headerClass,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <div
                    className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400"
                    role="status"
                    aria-live="polite"
                    aria-busy="true"
                    aria-label={t('common.loading')}
                  >
                    <Spinner size="md" />
                    <span className="text-sm">{t('common.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-slate-400 dark:text-slate-500"
                >
                  {emptyText ?? t('common.noRecords')}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={clsx(
                        'px-4 py-3 text-sm text-slate-700 dark:text-slate-200',
                        c.cellClass,
                      )}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="flex flex-col items-stretch gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {t('common.page')} <strong>{page}</strong> {t('common.of')}{' '}
            {Math.max(1, totalPages)}
            {total !== undefined ? (
              <span className="ml-2 text-slate-400 dark:text-slate-500">
                · {total} {t('common.total')}
              </span>
            ) : null}
          </span>
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} /> {t('common.prev')}
            </button>
            <button
              type="button"
              onClick={() =>
                onPageChange(Math.min(Math.max(1, totalPages), page + 1))
              }
              disabled={page >= Math.max(1, totalPages)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
            >
              {t('common.next')} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
