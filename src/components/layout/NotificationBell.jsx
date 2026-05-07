import { Bell, Check, CheckCheck } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { formatDateTime } from '../../utils/format'
import { getTranslatedNotification } from '../../utils/notificationI18n'
import { clsx } from 'clsx'

/** Above sidebar (z-50), mobile overlay (z-40), topbar (z-30). */
const PANEL_Z = 200

function usePanelGeometry(anchorRef, open) {
  const [geom, setGeom] = useState(null)

  const measure = useCallback(() => {
    const anchor = anchorRef.current
    if (!open || !anchor) {
      setGeom(null)
      return
    }
    const r = anchor.getBoundingClientRect()
    const maxW = Math.min(22 * 16, window.innerWidth - 16)
    let left = r.right - maxW
    left = Math.max(8, Math.min(left, window.innerWidth - maxW - 8))
    const top = r.bottom + 8
    const maxH = Math.max(
      120,
      Math.min(window.innerHeight * 0.72, window.innerHeight - top - 12),
    )
    setGeom({ left, top, width: maxW, maxH })
  }, [anchorRef, open])

  useLayoutEffect(() => {
    measure()
  }, [measure])

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [open, measure])

  return geom
}

export function NotificationBell() {
  const { t } = useTranslation()
  const { items, unreadCount, refresh, markRead, markAllRead } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const panelRef = useRef(null)
  const geom = usePanelGeometry(wrapRef, open)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      const tEl = e.target
      if (!(tEl instanceof Node)) return
      if (wrapRef.current?.contains(tEl)) return
      if (panelRef.current?.contains(tEl)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc, true)
    return () => document.removeEventListener('mousedown', onDoc, true)
  }, [open])

  useEffect(() => {
    if (open) void refresh()
  }, [open, refresh])

  const panel =
    open &&
    geom &&
    createPortal(
      <div
        ref={panelRef}
        className="fixed box-border overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        style={{
          left: geom.left,
          top: geom.top,
          width: geom.width,
          maxHeight: geom.maxH,
          zIndex: PANEL_Z,
        }}
        role="dialog"
        aria-label={t('notifications.title')}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('notifications.title')}
          </div>
          {items.length > 0 && unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              <CheckCheck size={14} />
              {t('notifications.markAllRead')}
            </button>
          ) : null}
        </div>
        <div
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight: geom.maxH - 52 }}
        >
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('notifications.empty')}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((n) => {
                const unread = !n.readAt
                const { title: displayTitle, body: displayBody } =
                  getTranslatedNotification(n, t)
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={clsx(
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/80',
                        unread && 'bg-violet-50/60 dark:bg-violet-500/10',
                      )}
                      onClick={() => {
                        if (unread) void markRead(n.id)
                      }}
                    >
                      <div
                        className={clsx(
                          'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                          unread
                            ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                            : 'bg-slate-200 dark:bg-slate-600',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {displayTitle}
                          </span>
                          {unread ? (
                            <span className="shrink-0 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                              {t('notifications.unread')}
                            </span>
                          ) : (
                            <Check
                              size={14}
                              className="shrink-0 text-emerald-500"
                              aria-hidden
                            />
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {displayBody}
                        </p>
                        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
          <Link
            to="/notifications"
            className="block w-full rounded-lg py-2 text-center text-sm font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
            onClick={() => setOpen(false)}
          >
            {t('notifications.viewAll')}
          </Link>
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('notifications.title')}
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-100 hover:text-violet-600 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-violet-400"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white shadow-sm dark:bg-violet-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>
      {panel}
    </div>
  )
}
