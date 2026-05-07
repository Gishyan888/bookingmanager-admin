import { Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGS } from '../../i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentCode = (i18n.resolvedLanguage || i18n.language || 'en')
    .split('-')[0]
    .toLowerCase()
  const current =
    SUPPORTED_LANGS.find((l) => l.code === currentCode) ?? SUPPORTED_LANGS[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t('common.language')}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
      >
        <Globe size={14} />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('common.language')}
          </div>
          {SUPPORTED_LANGS.map((l) => {
            const active = l.code === currentCode
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{l.flag}</span>
                  {l.native}
                </span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
