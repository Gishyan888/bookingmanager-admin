import clsx from 'clsx'
import { Calendar } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const pad = (n) => String(n).padStart(2, '0')

/** `YYYY-MM-DDTHH:mm` for datetime-local and API */
export function dateToLocalIso(d) {
  if (!d || Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function parseIsoToDate(iso) {
  if (!iso) return null
  const m = String(iso).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
  )
  if (m) {
    return new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
    )
  }
  const dt = new Date(iso)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function parseMinToDate(minIso) {
  if (!minIso || String(minIso).trim() === '') return null
  return parseIsoToDate(minIso)
}

/** Clamp ISO string (minutes) so it is not before minIso */
function clampToMin(valueIso, minIso) {
  if (!valueIso) return valueIso
  const min = parseMinToDate(minIso)
  if (!min) return valueIso
  const v = parseIsoToDate(valueIso)
  if (!v) return valueIso
  if (v.getTime() < min.getTime()) return dateToLocalIso(min)
  return valueIso.slice(0, 16)
}

/** Current local time at minute boundary (no seconds churn in min=). */
export function localIsoMinutesNow() {
  const d = new Date()
  d.setSeconds(0, 0)
  return dateToLocalIso(d)
}

/**
 * Native datetime field + explicit “Choose” (showPicker).
 * Same wire format `YYYY-MM-DDTHH:mm` as the API.
 */
export function DateTimePicker({
  label,
  value,
  onChange,
  hint,
  required,
  className,
  disabled,
  minIso,
  step = 900,
}) {
  const { t } = useTranslation()
  const inputRef = useRef(null)

  const normalizedValue = useMemo(() => {
    if (!value) return ''
    const m = String(value).match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/)
    return m ? m[1] : String(value).slice(0, 16)
  }, [value])

  const displayValue = useMemo(
    () => (minIso ? clampToMin(normalizedValue || '', minIso) : normalizedValue),
    [normalizedValue, minIso],
  )

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!minIso) return
    if (!normalizedValue) return
    const c = clampToMin(normalizedValue, minIso)
    if (c !== normalizedValue) onChangeRef.current?.(c)
  }, [minIso, normalizedValue])

  const fieldShell = clsx(
    'flex w-full min-w-0 items-stretch overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-inset ring-slate-200 transition focus-within:ring-2 focus-within:ring-violet-500 dark:bg-slate-900 dark:ring-slate-700 dark:focus-within:ring-violet-400',
    disabled && 'pointer-events-none opacity-60',
  )

  const apply = (raw) => {
    const trimmed = raw?.slice(0, 16) ?? ''
    if (!trimmed) {
      onChange?.('')
      return
    }
    const next = minIso ? clampToMin(trimmed, minIso) : trimmed
    onChange?.(next)
  }

  const openPicker = () => {
    const el = inputRef.current
    if (!el || disabled) return
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker()
      } catch {
        el.focus()
      }
    } else {
      el.focus()
    }
  }

  const minAttr =
    minIso && String(minIso).trim() !== ''
      ? String(minIso).slice(0, 16)
      : undefined

  return (
    <div className={clsx('block w-full min-w-0', className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
      )}
      <div className={fieldShell}>
        <input
          ref={inputRef}
          type="datetime-local"
          disabled={disabled}
          required={required}
          step={step}
          min={minAttr}
          value={displayValue}
          onChange={(e) => apply(e.target.value)}
          className={clsx(
            'min-h-[2.75rem] min-w-0 flex-1 border-0 bg-transparent py-2 pl-3 pr-2 text-base text-slate-800 outline-none md:min-h-0 md:py-2 md:text-sm dark:text-slate-100',
            '[color-scheme:light] dark:[color-scheme:dark]',
          )}
          autoComplete="off"
          aria-required={required}
        />
        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => {
            /* keep focus chain for showPicker without stealing from input oddly */
            e.preventDefault()
          }}
          onClick={openPicker}
          title={t('bookings.pickDateTime')}
          aria-label={t('bookings.pickDateTime')}
          className="inline-flex shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 border-l border-slate-200 px-3 py-2 text-[10px] font-semibold uppercase leading-tight tracking-wide text-violet-700 transition hover:bg-violet-50 sm:flex-row sm:gap-2 sm:text-xs dark:border-slate-700 dark:text-violet-300 dark:hover:bg-violet-500/15"
        >
          <Calendar size={18} className="shrink-0" aria-hidden />
          <span>{t('bookings.pickDateTimeBtn')}</span>
        </button>
      </div>
      {hint && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </div>
  )
}
