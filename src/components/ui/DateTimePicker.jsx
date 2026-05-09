import clsx from 'clsx'
import { isValid, parse } from 'date-fns'
import { enGB, hy, ru } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { useTranslation } from 'react-i18next'

registerLocale('en-GB', enGB)
registerLocale('ru', ru)
registerLocale('hy', hy)

const DATE_FNS_LOCALE = { hy, ru, 'en-GB': enGB }

const pad = (n) => String(n).padStart(2, '0')

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
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

function toLocalIso(d) {
  if (!d || Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localeCodeFor(lang) {
  const base = (lang || 'en').split('-')[0]
  if (base === 'hy') return 'hy'
  if (base === 'ru') return 'ru'
  return 'en-GB'
}

/** Try common typed formats (locale-aware where it matters). */
function parseTypedDateTime(text, locale) {
  if (!text?.trim()) return null
  const t = text.trim()
  const formats = [
    'dd/MM/yyyy HH:mm',
    'dd/MM/yyyy H:mm',
    'dd.MM.yyyy HH:mm',
    'dd.MM.yyyy H:mm',
    "yyyy-MM-dd'T'HH:mm",
    'yyyy-MM-dd HH:mm',
  ]
  for (const fmt of formats) {
    try {
      const d = parse(t, fmt, new Date(), { locale })
      if (isValid(d)) return d
    } catch {
      // try next
    }
  }
  return null
}

const CustomInput = forwardRef(function DateTimePickerInput(
  { value, onClick, disabled, onManualCommit, parseLocale, onKeyDown, ...rest },
  ref,
) {
  const [draft, setDraft] = useState(value ?? '')

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  const fieldClasses = clsx(
    'block w-full cursor-pointer rounded-lg border-0 bg-white py-2 pl-9 pr-3 text-base shadow-sm ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 md:text-sm',
    'text-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:focus:ring-violet-400',
    disabled && 'cursor-not-allowed opacity-60',
  )

  const commitDraft = () => {
    const trimmed = draft?.trim()
    if (!trimmed) {
      onManualCommit?.('')
      return
    }
    const d = parseTypedDateTime(trimmed, parseLocale)
    if (d) {
      onManualCommit?.(toLocalIso(d))
    } else {
      setDraft(value ?? '')
    }
  }

  return (
    <div className="relative w-full">
      <Calendar
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        aria-hidden
      />
      <input
        ref={ref}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onClick={onClick}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commitDraft()
            e.currentTarget.blur()
          }
          onKeyDown?.(e)
        }}
        disabled={disabled}
        className={fieldClasses}
        autoComplete="off"
        placeholder="dd/mm/yyyy HH:mm"
        {...rest}
      />
    </div>
  )
})

CustomInput.displayName = 'DateTimePickerInput'

/**
 * Date + time (calendar + time list). Emits local `YYYY-MM-DDTHH:mm` for the API.
 * Styles load from `main.jsx` so the calendar grid is not broken by CSS `@import` order.
 */
export function DateTimePicker({
  label,
  value,
  onChange,
  hint,
  required,
  className,
  disabled,
}) {
  const { t, i18n } = useTranslation()
  const selected = useMemo(() => parseIsoToDate(value), [value])
  const locale = useMemo(
    () => localeCodeFor(i18n.language),
    [i18n.language],
  )
  const parseLocale = DATE_FNS_LOCALE[locale] ?? enGB
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const customInput = useMemo(
    () => (
      <CustomInput
        parseLocale={parseLocale}
        onManualCommit={(iso) => onChangeRef.current?.(iso)}
      />
    ),
    [parseLocale],
  )

  return (
    <div className={clsx('block', className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
      )}
      <DatePicker
        selected={selected}
        onChange={(d) => onChange?.(d ? toLocalIso(d) : '')}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="dd/MM/yyyy HH:mm"
        timeCaption={t('common.time')}
        locale={locale}
        shouldCloseOnSelect={false}
        disabled={disabled}
        showPopperArrow={false}
        withPortal
        calendarClassName="bm-datepicker"
        popperClassName="bm-datepicker-popper"
        customInput={customInput}
        isClearable={false}
        popperProps={{ strategy: 'fixed' }}
      />
      {hint && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </div>
  )
}
