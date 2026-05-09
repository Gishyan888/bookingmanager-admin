import clsx from 'clsx'
import flatpickr from 'flatpickr'
import { useEffect, useMemo, useRef } from 'react'
import 'flatpickr/dist/flatpickr.min.css'
import { useTranslation } from 'react-i18next'

const pad = (n) => String(n).padStart(2, '0')

/** API wire format (local clock, no TZ suffix). */
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
      0,
      0,
    )
  }
  const dt = new Date(iso)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function parseMinToDate(minIso) {
  if (!minIso || String(minIso).trim() === '') return null
  return parseIsoToDate(minIso)
}

function clampToMin(valueIso, minIso) {
  if (!valueIso) return valueIso
  const min = parseMinToDate(minIso)
  if (!min) return valueIso
  const v = parseIsoToDate(valueIso)
  if (!v) return valueIso
  if (v.getTime() < min.getTime()) return dateToLocalIso(min)
  return valueIso.slice(0, 16)
}

/** Current local time at minute boundary. */
export function localIsoMinutesNow() {
  const d = new Date()
  d.setSeconds(0, 0)
  return dateToLocalIso(d)
}

/** Flatpickr display + parse tokens: fixed dd/mm/yyyy + 24‑hour HH:mm everywhere. */
const FP_FORMAT = 'd/m/Y H:i'

function minuteIncFromSeconds(stepSec) {
  const m = Math.round(Number(stepSec) / 60)
  return Number.isFinite(m) && m > 0 ? m : 15
}

/**
 * Flatpickr: strict calendar + typed input in **dd/MM/yyyy HH:mm** only, **24h**, same in every language.
 * Emits local `YYYY-MM-DDTHH:mm` for the API.
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
  const fpRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const minIsoRef = useRef(minIso)
  minIsoRef.current = minIso
  const displayIsoRef = useRef('')

  const normalizedValue = useMemo(() => {
    if (!value) return ''
    const m = String(value).match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/)
    return m ? m[1] : String(value).slice(0, 16)
  }, [value])

  const displayValue = useMemo(
    () => (minIso ? clampToMin(normalizedValue || '', minIso) : normalizedValue),
    [normalizedValue, minIso],
  )
  displayIsoRef.current = displayValue

  const minDate = useMemo(() => parseMinToDate(minIso), [minIso])
  const minuteInc = useMemo(() => minuteIncFromSeconds(step), [step])

  useEffect(() => {
    if (!minIso || !normalizedValue) return
    const c = clampToMin(normalizedValue, minIso)
    if (c !== normalizedValue) onChangeRef.current?.(c)
  }, [minIso, normalizedValue])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    const fp = flatpickr(el, {
      allowInput: true,
      disableMobile: true,
      appendTo: document.body,
      dateFormat: FP_FORMAT,
      enableTime: true,
      time_24hr: true,
      minuteIncrement: minuteInc,
      closeOnSelect: false,
      defaultHour: 12,
      defaultMinute: 0,
      maxDate: undefined,
      clickOpens: true,

      onOpen(_dates, _s, instance) {
        requestAnimationFrame(() => {
          instance.calendarContainer?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
            behavior: 'smooth',
          })
        })
      },

      parseDate(dateStr) {
        if (!dateStr || dateStr.trim() === '') return null

        const s = dateStr.trim()
        const regex =
          /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/
        const m = s.match(regex)
        if (!m) return null

        let day = Number(m[1])
        let month = Number(m[2])
        const year = Number(m[3])
        const hour = Number(m[4])
        const minute = Number(m[5])

        month -= 1
        if (
          year < 1000 ||
          year > 9999 ||
          Number.isNaN(day) ||
          Number.isNaN(month) ||
          Number.isNaN(hour) ||
          Number.isNaN(minute) ||
          month < 0 ||
          month > 11 ||
          hour < 0 ||
          hour > 23 ||
          minute < 0 ||
          minute > 59
        ) {
          return null
        }

        const maxDay = new Date(year, month + 1, 0).getDate()
        if (day < 1 || day > maxDay) return null

        const d = new Date(year, month, day, hour, minute, 0, 0)
        if (
          Number.isNaN(d.getTime()) ||
          d.getFullYear() !== year ||
          d.getMonth() !== month ||
          d.getDate() !== day
        ) {
          return null
        }
        return d
      },

      formatDate(date) {
        const mm = pad(date.getMonth() + 1)
        const dd = pad(date.getDate())
        const yyyy = date.getFullYear()
        const HH = pad(date.getHours())
        const mins = pad(date.getMinutes())
        return `${dd}/${mm}/${yyyy} ${HH}:${mins}`
      },

      onChange(selectedDates) {
        const d = selectedDates[0]
        if (!d) {
          onChangeRef.current?.('')
          return
        }
        let iso = dateToLocalIso(d)
        const min = minIsoRef.current
        if (iso && min) iso = clampToMin(iso, min)
        onChangeRef.current?.(iso)
      },

      onClose(_dates, _s, fpInstance) {
        const d = fpInstance.selectedDates[0]
        const inputVal = fpInstance.input.value.trim()
        if (!inputVal) {
          onChangeRef.current?.('')
          return
        }
        if (!d) {
          const prev = parseIsoToDate(displayIsoRef.current)
          fpInstance.clear()
          if (prev) fpInstance.setDate(prev, false)
          return
        }
        let iso = dateToLocalIso(d)
        const min = minIsoRef.current
        if (iso && min) iso = clampToMin(iso, min)
        const fixed = iso ? parseIsoToDate(iso) : null
        if (!fixed || !iso) return
        if (fixed.getTime() !== d.getTime()) fpInstance.setDate(fixed, false)
        onChangeRef.current?.(iso)
      },
    })

    fpRef.current = fp

    return () => {
      if (typeof fp?.destroy === 'function') fp.destroy()
      fpRef.current = null
    }
  }, [minuteInc])

  useEffect(() => {
    const fp = fpRef.current
    const inputEl = fp?.input ?? fp?._input
    if (!fp || !inputEl) return
    if (disabled) {
      inputEl.disabled = true
      fp.set('clickOpens', false)
    } else {
      inputEl.disabled = false
      fp.set('clickOpens', true)
    }
  }, [disabled])

  useEffect(() => {
    const fp = fpRef.current
    if (!fp) return
    const d = parseIsoToDate(displayValue)
    const sel = fp.selectedDates[0]
    if (!d) {
      if (!sel) return
      fp.clear()
      return
    }
    if (sel && sel.getTime() === d.getTime()) return
    fp.setDate(d, false)
  }, [displayValue])

  useEffect(() => {
    const fp = fpRef.current
    if (!fp) return
    fp.set('minDate', minDate ?? null)
    const sel = fp.selectedDates[0]
    if (sel && minDate && sel.getTime() < minDate.getTime()) {
      fp.setDate(minDate, false)
      onChangeRef.current?.(dateToLocalIso(minDate))
    }
  }, [minDate])

  const inputClass =
    'block min-h-[2.75rem] w-full rounded-lg border-0 bg-white px-3 py-2 text-base shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 transition focus:ring-2 focus:ring-inset focus:ring-violet-500 md:min-h-0 md:text-sm dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-violet-400 tabular-nums'

  return (
    <div className={clsx('block w-full min-w-0', className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={t('bookings.dateTimePlaceholder')}
        className={inputClass}
        autoComplete="off"
        spellCheck={false}
        aria-required={required}
        readOnly={false}
      />
      {hint && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </div>
  )
}
