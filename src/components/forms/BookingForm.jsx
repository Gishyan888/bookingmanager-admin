import clsx from 'clsx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  checkoutMinInstant,
  isoNotBeforeFloor,
  isoNotBeforeNow,
  joinLocalIso,
  localIsoMinutesNow,
  splitLocalIso,
} from '../../utils/bookingDatetime'
import { computeNights, formatAMD } from '../../utils/format'
import { Button } from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'
import { PhoneInput } from '../ui/PhoneInput'

const pickerInputClass =
  'block min-h-[2.75rem] w-full rounded-lg border-0 bg-white px-3 py-2 text-base shadow-sm ring-1 ring-inset ring-slate-200 transition focus:ring-2 focus:ring-inset focus:ring-violet-500 md:min-h-0 md:text-sm dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:focus:ring-violet-400 [color-scheme:light] dark:[color-scheme:dark]'

const STATUS = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
]

const NEW_GUEST = '__new_guest__'

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
    <form className="space-y-4" onSubmit={onSubmit}>
      <Select
        label={t('bookings.room')}
        value={value.roomId}
        onChange={(e) => onChange({ ...value, roomId: e.target.value })}
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

      {!isEdit && value.useNewCustomer ? (
        <div className="space-y-3 rounded-xl border border-violet-200/80 bg-violet-50/40 p-4 dark:border-violet-500/25 dark:bg-violet-500/5">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {t('bookings.newGuestSection')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('bookings.newGuestHint')}
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

      {/* en-GB nudges browsers toward dd/mm/yyyy and 24-hour time */}
      <section lang="en-GB" className="rounded-xl px-px">
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          {t('bookings.dateFormatHint')}
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('bookings.checkIn')}
              <span className="ml-0.5 text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t('bookings.startDate')}
                </span>
                <input
                  type="date"
                  className={clsx(pickerInputClass, 'tabular-nums')}
                  value={inDateStr}
                  required
                  min={checkInDateMin}
                  onChange={(e) => {
                    const d = e.target.value
                    const tm = splitLocalIso(value.checkIn).time || '14:00'
                    let iso = d ? joinLocalIso(d, tm) : ''
                    if (iso && !isEdit)
                      iso = isoNotBeforeNow(iso.slice(0, 16))
                    onChange({
                      ...value,
                      checkIn: iso,
                      checkOut: autoCheckOutFromCheckIn(iso),
                    })
                  }}
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t('bookings.startTime')}
                </span>
                <input
                  type="time"
                  className={clsx(pickerInputClass, 'tabular-nums')}
                  value={inTimeStr}
                  required={Boolean(inDateStr)}
                  step={60}
                  min={checkInTimeMin}
                  onChange={(e) => {
                    const tm = e.target.value
                    const d = splitLocalIso(value.checkIn).date
                    let iso = d ? joinLocalIso(d, tm || '00:00') : ''
                    if (iso && !isEdit)
                      iso = isoNotBeforeNow(iso.slice(0, 16))
                    onChange({
                      ...value,
                      checkIn: iso,
                      checkOut: autoCheckOutFromCheckIn(iso),
                    })
                  }}
                />
              </label>
            </div>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {t('bookings.defaultCheckInHint')}
            </span>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('bookings.checkOut')}
              <span className="ml-0.5 text-rose-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t('bookings.endDate')}
                </span>
                <input
                  type="date"
                  className={clsx(pickerInputClass, 'tabular-nums')}
                  value={outDateStr}
                  required
                  min={checkoutMinDay}
                  onChange={(e) => {
                    const d = e.target.value
                    const tm = splitLocalIso(value.checkOut).time || '12:00'
                    let iso = d ? joinLocalIso(d, tm) : ''
                    iso = iso
                      ? isoNotBeforeFloor(iso.slice(0, 16), checkoutFloor)
                      : ''
                    onChange({ ...value, checkOut: iso })
                  }}
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t('bookings.endTime')}
                </span>
                <input
                  type="time"
                  className={clsx(pickerInputClass, 'tabular-nums')}
                  value={outTimeStr}
                  required={Boolean(outDateStr)}
                  step={60}
                  min={checkOutTimeMin}
                  onChange={(e) => {
                    const tm = e.target.value
                    const d = splitLocalIso(value.checkOut).date
                    let iso = d ? joinLocalIso(d, tm || '00:00') : ''
                    iso = iso
                      ? isoNotBeforeFloor(iso.slice(0, 16), checkoutFloor)
                      : ''
                    onChange({ ...value, checkOut: iso })
                  }}
                />
              </label>
            </div>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {t('bookings.defaultCheckOutHint')}
            </span>
          </div>
        </div>
      </section>

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

      {/* Auto-computed total — read-only display */}
      <div className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3 ring-1 ring-violet-100 dark:bg-violet-500/10 dark:ring-violet-500/20">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
            {t('bookings.computedTotal')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {nights > 0
              ? t('bookings.nightsCalc', {
                  nights,
                  rate: room ? formatAMD(room.price) : '—',
                })
              : t('bookings.pickDates')}
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {formatAMD(computedTotal)}
        </div>
      </div>

      <Textarea
        label={t('bookings.notes')}
        rows={2}
        value={value.notes || ''}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={busy}>
          {isEdit ? t('common.save') : t('common.create')}
        </Button>
      </div>
    </form>
  )
}
