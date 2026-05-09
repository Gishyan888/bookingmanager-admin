import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  buildYmd,
  checkoutMinInstant,
  clampDayInMonth,
  daysInCalendarMonth,
  hmJoin,
  hmSplit,
  isoNotBeforeFloor,
  isoNotBeforeNow,
  joinLocalIso,
  localIsoMinutesNow,
  parseYmdStrict,
  splitLocalIso,
  ymBefore,
  ymdBefore,
} from '../../utils/bookingDatetime'
import { computeNights, formatAMD } from '../../utils/format'
import { Button } from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'
import { PhoneInput } from '../ui/PhoneInput'
import { NumberInput } from '../ui/NumberInput'

const pickerInputClass =
  'block min-h-[2.75rem] w-full rounded-lg border-0 bg-white px-3 py-2 text-base shadow-sm ring-1 ring-inset ring-slate-200 transition focus:ring-2 focus:ring-inset focus:ring-violet-500 md:min-h-0 md:text-sm dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:focus:ring-violet-400'

const HM24 = [...Array(24)].map((_, i) =>
  String(i).padStart(2, '0'),
)
const MIN60 = [...Array(60)].map((_, i) =>
  String(i).padStart(2, '0'),
)

function dayOptionDisabled(day, year, month, minYmd) {
  const ymd = buildYmd(year, month, day)
  return Boolean(minYmd && ymdBefore(ymd, minYmd))
}

/** Dropdowns **day · month · year** (explicit dd/mm/yyyy order in the UI). */
function InlineDmyPick({
  ymd,
  minYmd,
  onChangeYmd,
}) {
  const now = new Date()
  const nowY = now.getFullYear()
  const floor = parseYmdStrict(minYmd || '')
  let p = parseYmdStrict(ymd || '')
  if (!p) {
    const fb = parseYmdStrict(minYmd || '')
    p = fb ?? {
      y: nowY,
      mo: now.getMonth() + 1,
      d: now.getDate(),
    }
  }

  let y = p.y
  let mo = p.mo
  let d = clampDayInMonth(y, mo, p.d)

  const yearLow = Math.min(nowY - 2, y)
  const yearHigh = Math.max(nowY + 8, y, floor?.y ?? y)

  const emit = (py, pm, pd) => {
    const dc = clampDayInMonth(py, pm, pd)
    onChangeYmd(buildYmd(py, pm, dc))
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <select
        className={pickerInputClass}
        aria-label="Day"
        value={String(d).padStart(2, '0')}
        required
        onChange={(e) => {
          const nextD = Number(e.target.value)
          emit(y, mo, nextD)
        }}
      >
        {[...Array(daysInCalendarMonth(y, mo))].map((_, i) => {
          const dv = i + 1
          const dis = dayOptionDisabled(dv, y, mo, minYmd)
          return (
            <option key={dv} value={String(dv).padStart(2, '0')} disabled={dis}>
              {dv}
            </option>
          )
        })}
      </select>
      <select
        className={pickerInputClass}
        aria-label="Month"
        value={String(mo).padStart(2, '0')}
        required
        onChange={(e) => {
          const nextMo = Number(e.target.value)
          const clampedDay = clampDayInMonth(y, nextMo, d)
          emit(y, nextMo, clampedDay)
        }}
      >
        {[...Array(12)].map((_, ix) => {
          const cand = ix + 1
          const dis = ymBefore(y, cand, minYmd)
          return (
            <option key={cand} value={String(cand).padStart(2, '0')} disabled={dis}>
              {String(cand).padStart(2, '0')}
            </option>
          )
        })}
      </select>
      <select
        className={pickerInputClass}
        aria-label="Year"
        value={String(y)}
        required
        onChange={(e) => {
          const nextY = Number(e.target.value)
          const clampedDay = clampDayInMonth(nextY, mo, d)
          emit(nextY, mo, clampedDay)
        }}
      >
        {[...Array(yearHigh - yearLow + 1)].map((_, i) => {
          const yy = yearLow + i
          const dis = floor && yy < floor.y
          return (
            <option key={yy} value={String(yy)} disabled={dis}>
              {yy}
            </option>
          )
        })}
      </select>
    </div>
  )
}

/** 24-hour **hour : minute** dropdowns (no AM/PM). */
function InlineHmPick({ hm, minHm, onChangeHm }) {
  const { h, mi } = hmSplit(hm || '00:00')
  const mh = minHm ? hmSplit(minHm) : null

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <select
        className={pickerInputClass}
        aria-label="Hour (24h)"
        required
        value={String(h).padStart(2, '0')}
        onChange={(e) => {
          const nextH = Number(e.target.value)
          let nextMi = mi
          if (mh && nextH === mh.h && mi < mh.mi) nextMi = mh.mi
          onChangeHm(hmJoin(nextH, nextMi))
        }}
      >
        {HM24.map((hhLabel) => {
          const hh = Number(hhLabel)
          const dis = Boolean(mh && hh < mh.h)
          return (
            <option key={hhLabel} value={hhLabel} disabled={dis}>
              {hhLabel}
            </option>
          )
        })}
      </select>
      <select
        className={pickerInputClass}
        aria-label="Minute"
        required
        value={String(mi).padStart(2, '0')}
        onChange={(e) =>
          onChangeHm(hmJoin(h, Number(e.target.value)))
        }
      >
        {MIN60.map((lab) => {
          const mv = Number(lab)
          const dis = Boolean(mh && h === mh.h && mv < mh.mi)
          return (
            <option key={lab} value={lab} disabled={dis}>
              {lab}
            </option>
          )
        })}
      </select>
    </div>
  )
}

const STATUS = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
]

const NEW_GUEST = '__new_guest__'

/** When room / stay dates change, recompute default total from list price × nights. */
function withListedTotal(patch, prev, rooms) {
  const next = { ...prev, ...patch }
  const rr = rooms.find((r) => r.id === next.roomId)
  const nts = computeNights(next.checkIn, next.checkOut)
  const c = rr && nts > 0 ? Math.round(Number(rr.price) * nts) : 0
  return { ...next, customTotalAmount: String(c) }
}

function emptyNewCustomer() {
  return { name: '', phone: '', idDocument: '', description: '' }
}

export function BookingForm({
  value,
  rooms,
  customers,
  onChange,
  onSubmit,
  onCancel,
  busy,
  isEdit,
}) {
  const { t } = useTranslation()

  const room = rooms.find((r) => r.id === value.roomId)
  const nights = computeNights(value.checkIn, value.checkOut)
  const computedTotal = room ? Number(room.price) * nights : 0
  const computedRounded = Math.round(computedTotal || 0)
  const rawTotalStr = String(value.customTotalAmount ?? '').trim()
  const totalInputParsed = Number(rawTotalStr.replace(/\s/g, ''))
  const displayTotalAMD =
    rawTotalStr !== '' && Number.isFinite(totalInputParsed)
      ? Math.max(0, Math.round(totalInputParsed))
      : computedRounded

  const autoCheckOutFromCheckIn = (checkInValue) => {
    if (!checkInValue) return value.checkOut
    const ci = new Date(checkInValue)
    if (Number.isNaN(ci.getTime())) return value.checkOut

    const currentCo = value.checkOut ? new Date(value.checkOut) : null
    const next = new Date(ci)
    next.setDate(next.getDate() + 1)

    // Keep chosen checkout time; fallback to default 12:00.
    if (currentCo && !Number.isNaN(currentCo.getTime())) {
      next.setHours(currentCo.getHours(), currentCo.getMinutes(), 0, 0)
    } else {
      next.setHours(12, 0, 0, 0)
    }

    const pad = (n) => String(n).padStart(2, '0')
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`
  }

  const checkoutFloor = useMemo(
    () => checkoutMinInstant(isEdit, value.checkIn),
    [isEdit, value.checkIn],
  )
  const checkoutMinDay = useMemo(() => {
    const f = checkoutFloor
    const y = f.getFullYear()
    const m = String(f.getMonth() + 1).padStart(2, '0')
    const d = String(f.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [checkoutFloor])
  const checkoutMinHm = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(checkoutFloor.getHours())}:${pad(checkoutFloor.getMinutes())}`
  }, [checkoutFloor])

  const todayParts = !isEdit ? splitLocalIso(localIsoMinutesNow()) : { date: '', time: '' }
  const { date: inDateStr, time: inTimeStr } = splitLocalIso(value.checkIn)
  const { date: outDateStr, time: outTimeStr } = splitLocalIso(value.checkOut)

  const checkInDateMin = !isEdit ? todayParts.date : undefined
  const checkInTimeMin =
    !isEdit && inDateStr && checkInDateMin && inDateStr === checkInDateMin
      ? todayParts.time
      : undefined

  const checkOutTimeMin =
    outDateStr && checkoutMinDay && outDateStr === checkoutMinDay
      ? checkoutMinHm
      : undefined

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 shrink-0 grow sm:basis-[min(100%,14rem)] sm:max-w-[17rem]">
          <Select
            label={t('bookings.room')}
            value={value.roomId}
            onChange={(e) =>
              onChange(withListedTotal({ roomId: e.target.value }, value, rooms))
            }
            required
            disabled={isEdit}
          >
            <option value="" disabled>
              {t('bookings.selectRoom')}
            </option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.hotel?.name ? `${r.hotel.name} · ` : ''}#{r.roomNumber} (
                {t(`rooms.type_${r.type}`)}) — {formatAMD(r.price)}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 grow sm:basis-[min(100%,14rem)] sm:max-w-[20rem]">
          <Select
            label={t('customers.customer')}
            value={
              !isEdit && value.useNewCustomer ? NEW_GUEST : value.customerId
            }
            onChange={(e) => {
              const v = e.target.value
              if (!isEdit && v === NEW_GUEST) {
                onChange({
                  ...value,
                  useNewCustomer: true,
                  customerId: '',
                  newCustomer: value.newCustomer ?? emptyNewCustomer(),
                })
              } else {
                onChange({
                  ...value,
                  useNewCustomer: false,
                  customerId: v,
                })
              }
            }}
            required
          >
            <option value="" disabled>
              {t('bookings.selectCustomer')}
            </option>
            {!isEdit ? (
              <option value={NEW_GUEST}>{t('bookings.newGuestOption')}</option>
            ) : null}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 shrink-0 sm:w-44">
          <Select
            label={t('common.status')}
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e.target.value })}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {t(`bookings.status.${s}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!isEdit && value.useNewCustomer ? (
        <div className="grid gap-2 rounded-lg border border-violet-200/70 bg-violet-50/30 p-2.5 sm:grid-cols-2 dark:border-violet-500/25 dark:bg-violet-500/5">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 sm:col-span-2">
            {t('bookings.newGuestSection')}
          </p>
          <Input
            label={t('auth.fullName')}
            value={value.newCustomer?.name ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                newCustomer: {
                  ...(value.newCustomer ?? emptyNewCustomer()),
                  name: e.target.value,
                },
              })
            }
            required
          />
          <PhoneInput
            label={t('auth.phone')}
            value={value.newCustomer?.phone ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                newCustomer: {
                  ...(value.newCustomer ?? emptyNewCustomer()),
                  phone: e.target.value,
                },
              })
            }
          />
          <Input
            label={t('customers.idDocument')}
            value={value.newCustomer?.idDocument ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                newCustomer: {
                  ...(value.newCustomer ?? emptyNewCustomer()),
                  idDocument: e.target.value,
                },
              })
            }
          />
          <Textarea
            className="min-h-[3.25rem] sm:col-span-2"
            label={t('customers.description')}
            rows={2}
            value={value.newCustomer?.description ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                newCustomer: {
                  ...(value.newCustomer ?? emptyNewCustomer()),
                  description: e.target.value,
                },
              })
            }
          />
        </div>
      ) : null}

      <section className="rounded-lg border border-slate-200/90 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
        <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
          {t('bookings.dateFormatHint')}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('bookings.checkIn')}
              <span className="text-rose-500">*</span>
            </div>
            <div>
              <span className="mb-0.5 block text-xs text-slate-600 dark:text-slate-400">
                {t('bookings.startDate')}
              </span>
              <InlineDmyPick
                ymd={inDateStr}
                minYmd={checkInDateMin}
                onChangeYmd={(nextYmd) => {
                  const tm = splitLocalIso(value.checkIn).time || '14:00'
                  let iso = nextYmd ? joinLocalIso(nextYmd, tm) : ''
                  if (iso && !isEdit)
                    iso = isoNotBeforeNow(iso.slice(0, 16))
                  onChange(
                    withListedTotal(
                      {
                        checkIn: iso,
                        checkOut: autoCheckOutFromCheckIn(iso),
                      },
                      value,
                      rooms,
                    ),
                  )
                }}
              />
            </div>
            <div>
              <span className="mb-0.5 block text-xs text-slate-600 dark:text-slate-400">
                {t('bookings.startTime')}
              </span>
              <InlineHmPick
                hm={inTimeStr || '14:00'}
                minHm={checkInTimeMin}
                onChangeHm={(nextHm) => {
                  const d = splitLocalIso(value.checkIn).date
                  let iso = d ? joinLocalIso(d, nextHm) : ''
                  if (iso && !isEdit)
                    iso = isoNotBeforeNow(iso.slice(0, 16))
                  onChange(
                    withListedTotal(
                      {
                        checkIn: iso,
                        checkOut: autoCheckOutFromCheckIn(iso),
                      },
                      value,
                      rooms,
                    ),
                  )
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('bookings.defaultCheckInHint')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t('bookings.checkOut')}
              <span className="text-rose-500">*</span>
            </div>
            <div>
              <span className="mb-0.5 block text-xs text-slate-600 dark:text-slate-400">
                {t('bookings.endDate')}
              </span>
              <InlineDmyPick
                ymd={outDateStr}
                minYmd={checkoutMinDay}
                onChangeYmd={(nextYmd) => {
                  const tm = splitLocalIso(value.checkOut).time || '12:00'
                  let iso = nextYmd ? joinLocalIso(nextYmd, tm) : ''
                  iso = iso
                    ? isoNotBeforeFloor(iso.slice(0, 16), checkoutFloor)
                    : ''
                  onChange(withListedTotal({ checkOut: iso }, value, rooms))
                }}
              />
            </div>
            <div>
              <span className="mb-0.5 block text-xs text-slate-600 dark:text-slate-400">
                {t('bookings.endTime')}
              </span>
              <InlineHmPick
                hm={outTimeStr || '12:00'}
                minHm={checkOutTimeMin}
                onChangeHm={(nextHm) => {
                  const d = splitLocalIso(value.checkOut).date
                  let iso = d ? joinLocalIso(d, nextHm) : ''
                  iso = iso
                    ? isoNotBeforeFloor(iso.slice(0, 16), checkoutFloor)
                    : ''
                  onChange(withListedTotal({ checkOut: iso }, value, rooms))
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('bookings.defaultCheckOutHint')}
            </p>
          </div>
        </div>
      </section>

      <Textarea
        label={t('bookings.notes')}
        rows={2}
        className="min-h-[3.75rem]"
        value={value.notes || ''}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
      />

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 dark:border-slate-700 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
          <div className="w-full shrink-0 sm:w-40">
            <NumberInput
              label={t('bookings.totalAmd')}
              min={0}
              value={value.customTotalAmount ?? ''}
              onChange={(e) =>
                onChange({ ...value, customTotalAmount: e.target.value })
              }
              className="tabular-nums"
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {t('bookings.totalAmdFootnote')}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 pb-0.5 text-slate-700 dark:text-slate-200">
            {nights > 0 && room ? (
              <span className="text-xs tabular-nums">
                {nights} × {formatAMD(room.price)}
              </span>
            ) : (
              <span className="text-xs text-slate-500">{t('bookings.pickDates')}</span>
            )}
            {computedRounded > 0 &&
            Math.round(displayTotalAMD) !== computedRounded ? (
              <span className="text-sm text-slate-400 line-through dark:text-slate-500">
                {formatAMD(computedRounded)}
              </span>
            ) : null}
            <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
              {formatAMD(displayTotalAMD)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={busy}>
            {isEdit ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </div>
    </form>
  )
}
