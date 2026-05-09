import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

const ICONS = { light: Sun, dark: Moon, system: Monitor }

export function ThemeSwitcher() {
  const { mode, setTheme, resolved } = useTheme()
  const { t } = useTranslation()
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

  const ButtonIcon = ICONS[mode === 'system' ? resolved : mode]

  const items = [
    { id: 'light', label: t('common.themeLight'), icon: Sun },
    { id: 'dark', label: t('common.themeDark'), icon: Moon },
    { id: 'system', label: t('common.themeSystem'), icon: Monitor },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t('common.theme')}
        className="rounded-lg p-2 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
      >
        <ButtonIcon size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('common.theme')}
          </div>
          {items.map((it) => {
            const active = mode === it.id
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  setTheme(it.id)
                  localStorage.setItem('bm_theme', it.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <it.icon size={14} />
                  {it.label}
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
