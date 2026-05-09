import { Check, CheckCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { notifications as notificationsApi } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { PageLoader } from '../../components/ui/PageLoader'
import { PaginationBar } from '../../components/ui/PaginationBar'
import { useNotifications } from '../../context/NotificationContext'
import { formatDateTime } from '../../utils/format'
import { getTranslatedNotification } from '../../utils/notificationI18n'
import { clsx } from 'clsx'

const PAGE_SIZE = 20

export function NotificationsPage() {
  const { t } = useTranslation()
  const { refresh: refreshHeader, unreadCount } = useNotifications()
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async (p) => {
    setLoading(true)
    try {
      const res = await notificationsApi.list({ page: p, limit: PAGE_SIZE })
      setData(res.data ?? [])
      setTotal(res.total ?? 0)
      setTotalPages(res.totalPages ?? 1)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page)
  }, [page, load])

  useEffect(() => {
    void refreshHeader()
  }, [refreshHeader])

  const onMarkRead = async (id) => {
    await notificationsApi.markRead(id)
    setData((rows) =>
      rows.map((n) =>
        n.id === id
          ? { ...n, readAt: new Date().toISOString() }
          : n,
      ),
    )
    void refreshHeader()
  }

  const onMarkAllRead = async () => {
    await notificationsApi.markAllRead()
    void refreshHeader()
    await load(page)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('notifications.allTitle')}
        description={t('notifications.pageSubtitle')}
        actions={
          unreadCount > 0 ? (
            <Button variant="secondary" onClick={() => void onMarkAllRead()}>
              <CheckCheck size={16} />
              {t('notifications.markAllRead')}
            </Button>
          ) : null
        }
      />

      {loading ? (
        <PageLoader />
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          {t('notifications.empty')}
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {data.map((n) => {
            const unread = !n.readAt
            const { title: displayTitle, body: displayBody } =
              getTranslatedNotification(n, t)
            return (
              <li key={n.id}>
                <div
                  className={clsx(
                    'flex gap-4 px-4 py-4 sm:px-6',
                    unread && 'bg-violet-50/50 dark:bg-violet-500/5',
                  )}
                >
                  <div
                    className={clsx(
                      'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                      unread
                        ? 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.55)]'
                        : 'bg-slate-200 dark:bg-slate-600',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {displayTitle}
                      </h2>
                      <div className="flex shrink-0 items-center gap-2">
                        {unread ? (
                          <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                            {t('notifications.unread')}
                          </span>
                        ) : (
                          <Check
                            size={16}
                            className="text-emerald-500"
                            aria-hidden
                          />
                        )}
                        {unread ? (
                          <button
                            type="button"
                            onClick={() => void onMarkRead(n.id)}
                            className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
                          >
                            {t('notifications.markOneRead')}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {displayBody}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && totalPages > 1 ? (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
