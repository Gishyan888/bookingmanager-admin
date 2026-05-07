/**
 * Display helpers for dates, times and money.
 * The whole app standardises on:
 *   - dd/MM/yyyy date display
 *   - HH:mm (24h) time display
 *   - AMD currency, no decimals, thousand separators
 */

const pad = (n) => String(n).padStart(2, '0')

/** "07/05/2026" */
export function formatDate(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** "14:00" — always 24h, never AM/PM. */
export function formatTime(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "07/05/2026 14:00" */
export function formatDateTime(value) {
  const date = formatDate(value)
  const time = formatTime(value)
  return date && time ? `${date} ${time}` : date || time
}

/** "1,234 AMD" — no fraction, thousand separators. */
export function formatAMD(value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0 AMD'
  return `${Math.round(n).toLocaleString('en-US')} AMD`
}

/** Number of nights between two ISO datetimes. Hotel rule: a partial
 *  calendar day still counts as one night. So 14:00 → 12:00 next day = 1. */
export function computeNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  const ms = b.getTime() - a.getTime()
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24) - 0.25))
}
