import { useTranslation } from 'react-i18next'
import { Input, Select, Textarea } from '../ui/Input'
import { PhoneInput } from '../ui/PhoneInput'
import { Button } from '../ui/Button'
import { DateTimePicker } from '../ui/DateTimePicker'
import { computeNights, formatAMD } from '../../utils/format'

const STATUS = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
]

const NEW_GUEST = '__new_guest__'

function emptyNewCustomer() {
  return { name: '', email: '', phone: '', idDocument: '', address: '' }
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
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.email ? ` — ${c.email}` : ''}
          </option>
        ))}
        {!isEdit ? (
          <option value={NEW_GUEST}>{t('bookings.newGuestOption')}</option>
        ) : null}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label={t('auth.email')}
              type="email"
              value={value.newCustomer?.email ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  newCustomer: {
                    ...(value.newCustomer ?? emptyNewCustomer()),
                    email: e.target.value,
                  },
                })
              }
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
          </div>
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
            label={t('customers.address')}
            rows={2}
            value={value.newCustomer?.address ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                newCustomer: {
                  ...(value.newCustomer ?? emptyNewCustomer()),
                  address: e.target.value,
                },
              })
            }
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DateTimePicker
          label={t('bookings.checkIn')}
          value={value.checkIn}
          onChange={(v) => onChange({ ...value, checkIn: v })}
          hint={t('bookings.defaultCheckInHint')}
          required
        />
        <DateTimePicker
          label={t('bookings.checkOut')}
          value={value.checkOut}
          onChange={(v) => onChange({ ...value, checkOut: v })}
          hint={t('bookings.defaultCheckOutHint')}
          required
        />
      </div>

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
