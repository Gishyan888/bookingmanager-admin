import { Input } from './Input'

/**
 * A text input that only accepts numeric characters. Replaces the native
 * `<input type="number">` (which has bad UX, spinners, scroll-to-change,
 * locale-dependent decimal separators, etc.).
 *
 * Props:
 *  - value / onChange    : controlled string value
 *  - decimal             : when true, allows a single '.' decimal separator
 *  - allowNegative       : when true, allows a single leading '-'
 *  - min / max           : numeric guards applied on blur (clamps the value)
 *  - any other Input props (label, placeholder, leadingIcon, hint, …)
 */
export function NumberInput({
  value,
  onChange,
  decimal = false,
  allowNegative = false,
  min,
  max,
  inputMode,
  ...rest
}) {
  const sanitize = (raw) => {
    if (raw == null) return ''
    let s = String(raw)
    // Allowed characters
    let pattern = '0-9'
    if (decimal) pattern += '.'
    s = s.replace(new RegExp(`[^${pattern}${allowNegative ? '\\-' : ''}]`, 'g'), '')
    if (allowNegative) {
      // only at start, only one
      const neg = s.startsWith('-')
      s = (neg ? '-' : '') + s.replace(/-/g, '')
    }
    if (decimal) {
      // keep only first dot
      const i = s.indexOf('.')
      if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '')
    }
    return s
  }

  const handleChange = (e) => {
    const next = sanitize(e.target.value)
    onChange?.({ ...e, target: { ...e.target, value: next } })
  }

  const handleBlur = (e) => {
    let s = sanitize(e.target.value)
    if (s !== '' && s !== '-' && s !== '.') {
      const n = Number(s)
      if (Number.isFinite(n)) {
        let clamped = n
        if (typeof min === 'number' && clamped < min) clamped = min
        if (typeof max === 'number' && clamped > max) clamped = max
        if (clamped !== n) {
          s = String(clamped)
          onChange?.({ ...e, target: { ...e.target, value: s } })
        }
      }
    }
    rest.onBlur?.(e)
  }

  return (
    <Input
      {...rest}
      value={value ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode={inputMode ?? (decimal ? 'decimal' : 'numeric')}
      autoComplete="off"
    />
  )
}
