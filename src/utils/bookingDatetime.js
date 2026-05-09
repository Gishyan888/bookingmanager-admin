/** Local clock booking fields: wire format `YYYY-MM-DDTHH:mm` (no seconds, no TZ). */

const pad = (n) => String(n).padStart(2, '0')

export function localIsoMinutesNow() {
  const d = new Date()
  d.setSeconds(0, 0)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function splitLocalIso(iso) {
  if (!iso) return { date: '', time: '' }
  const m = String(iso).match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/)
  if (!m) return { date: '', time: '' }
  return { date: m[1], time: `${m[2]}:${m[3]}` }
}

export function joinLocalIso(date, time) {
  if (!date) return ''
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00'
  return `${date}T${t}`
}

export function parseLocalIso(iso) {
  if (!iso) return null
  const m = String(iso).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
  )
  if (!m) return null
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    0,
    0,
  )
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatLocalIsoFromDate(d) {
  if (!d || Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Earliest allowed check-out moment (creation: max(now, check-in); edit: check-in only). */
export function checkoutMinInstant(isEdit, checkInIso) {
  const now = new Date()
  now.setSeconds(0, 0)
  const cin = parseLocalIso(checkInIso)
  if (isEdit && cin) return cin
  if (!cin) return now
  return cin.getTime() >= now.getTime() ? cin : now
}

export function isoNotBeforeFloor(iso, floor) {
  if (!iso || !floor) return iso
  const t = parseLocalIso(iso)
  if (!t) return iso
  if (t.getTime() < floor.getTime()) return formatLocalIsoFromDate(floor)
  return iso.slice(0, 16)
}

export function isoNotBeforeNow(iso) {
  if (!iso) return iso
  const t = parseLocalIso(iso)
  const now = parseLocalIso(localIsoMinutesNow())
  if (!t || !now) return iso
  if (t.getTime() < now.getTime()) return localIsoMinutesNow()
  return iso.slice(0, 16)
}
