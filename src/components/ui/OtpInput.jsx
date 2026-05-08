import clsx from 'clsx'
import { useMemo, useRef } from 'react'

export function OtpInput({ value, onChange, length = 6, disabled = false }) {
  const refs = useRef([])
  const digits = useMemo(() => {
    const base = String(value || '').replace(/\D/g, '').slice(0, length)
    return Array.from({ length }, (_, i) => base[i] || '')
  }, [value, length])

  const setAt = (idx, nextDigit) => {
    const next = [...digits]
    next[idx] = nextDigit
    onChange(next.join(''))
  }

  const focusIndex = (idx) => {
    const el = refs.current[idx]
    if (el) el.focus()
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(e) => {
            const char = (e.target.value || '').replace(/\D/g, '').slice(-1)
            setAt(idx, char)
            if (char && idx < length - 1) {
              focusIndex(idx + 1)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
              focusIndex(idx - 1)
            }
            if (e.key === 'ArrowLeft' && idx > 0) {
              e.preventDefault()
              focusIndex(idx - 1)
            }
            if (e.key === 'ArrowRight' && idx < length - 1) {
              e.preventDefault()
              focusIndex(idx + 1)
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            const pasted = e.clipboardData
              .getData('text')
              .replace(/\D/g, '')
              .slice(0, length)
            if (!pasted) return
            onChange(pasted)
            focusIndex(Math.min(pasted.length, length - 1))
          }}
          className={clsx(
            'h-12 w-full rounded-lg border-0 bg-white text-center text-lg font-semibold text-slate-800 shadow-sm ring-1 ring-inset ring-slate-200 transition focus:ring-2 focus:ring-inset focus:ring-violet-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:focus:ring-violet-400',
            disabled && 'cursor-not-allowed opacity-70',
          )}
        />
      ))}
    </div>
  )
}
