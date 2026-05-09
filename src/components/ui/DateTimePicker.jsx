import clsx from 'clsx'
import { format, isValid, parse } from 'date-fns'
import { Calendar } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { pickerHtmlLang } from '../../utils/localeUi'

const pad = (n) => String(n).padStart(2, '0')

/** Always show & type as day-first (per product requirement). */
const DISPLAY_FMT = 'dd/MM/yyyy HH:mm'

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

/** Parse typed dd/mm/yyyy (and ISO fallbacks). */
function parseFlexibleDisplay(text, refBase) {
  const t = text.trim()
  if (!t) return null
  const primary = parse(t, DISPLAY_FMT, refBase)
  if (isValid(primary)) return primary

  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (m) {
    const d = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
    )
    return isValid(d) ? d : null
  }

  const slash = t.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
  )
  if (slash) {
    const d = new Date(
      Number(slash[3]),
      Number(slash[2]) - 1,
      Number(slash[1]),
      Number(slash[4]),
      Number(slash[5]),
    )
    return isValid(d) ? d : null
  }

  return null
}

/**
 * Visible value: **dd/MM/yyyy HH:mm** (24-hour). Wire value: `YYYY-MM-DDTHH:mm` for the API.
 * Hidden `datetime-local`: OS picker respects `lang`/`documentElement.lang` where possible (not all browsers).
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
  const { t, i18n } = useTranslation()
  const nativeRef = useRef(null)
  const [textDraft, setTextDraft] = useState('')

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

  useEffect(() => {
    const d = parseIsoToDate(displayValue)
    setTextDraft(d ? format(d, DISPLAY_FMT) : '')
  }, [displayValue])

  const fieldShell = clsx(
    'flex w-full min-w-0 items-stretch overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-inset ring-slate-200 transition focus-within:ring-2 focus-within:ring-violet-500 dark:bg-slate-900 dark:ring-slate-700 dark:focus-within:ring-violet-400',
    disabled && 'pointer-events-none opacity-60',
  )

  const applyIso = (raw) => {
    const trimmed = raw?.slice(0, 16) ?? ''
    if (!trimmed) {
      onChange?.('')
      return
    }
    const next = minIso ? clampToMin(trimmed, minIso) : trimmed
    onChange?.(next)
  }

  const commitText = () => {
    const raw = textDraft.trim()
    if (!raw) {
      onChange?.('')
      return
    }
    const refBase = new Date()
    const d = parseFlexibleDisplay(raw, refBase)
    if (!d) {
      const keep = parseIsoToDate(displayValue)
      setTextDraft(keep ? format(keep, DISPLAY_FMT) : '')
      return
    }
    let iso = dateToLocalIso(d)
    if (minIso) iso = clampToMin(iso, minIso)
    onChange?.(iso)
  }

  const openPicker = () => {
    const el = nativeRef.current
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
        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={openPicker}
          title={t('bookings.pickDateTime')}
          aria-label={t('bookings.pickDateTime')}
          className="flex w-11 shrink-0 cursor-pointer items-center justify-center border-0 border-r border-slate-200 bg-transparent text-slate-500 transition hover:bg-slate-50 hover:text-violet-600 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-violet-400"
        >
          <Calendar size={18} className="shrink-0" aria-hidden />
        </button>
        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          required={required}
          value={textDraft}
          onChange={(e) => setTextDraft(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitText()
              e.currentTarget.blur()
            }
          }}
          placeholder={t('bookings.dateTimePlaceholder')}
          className={clsx(
            'min-h-[2.75rem] min-w-0 flex-1 border-0 bg-transparent py-2 pr-3 pl-2 font-mono text-base tabular-nums text-slate-800 outline-none md:min-h-0 md:py-2 md:text-sm dark:text-slate-100',
          )}
          autoComplete="off"
          spellCheck={false}
          aria-required={required}
        />
        {/* Hidden native control: min/step + showPicker; value stays ISO */}
        <input
          ref={nativeRef}
          type="datetime-local"
          disabled={disabled}
          step={step}
          min={minAttr}
          value={displayValue}
          onChange={(e) => applyIso(e.target.value)}
          lang={pickerHtmlLang(i18n.language)}
          tabIndex={-1}
          className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0"
          aria-hidden
        />
      </div>
      {hint && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </div>
  )
}
