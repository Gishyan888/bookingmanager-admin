import { useTranslation } from 'react-i18next'
import { Input, Select, Textarea } from '../ui/Input'
import { NumberInput } from '../ui/NumberInput'
import { Button } from '../ui/Button'

const ROOM_TYPES = ['single', 'double', 'suite', 'deluxe', 'family']
const ROOM_STATUS = ['available', 'occupied', 'maintenance']

export function RoomForm({
  value,
  hotels,
  onChange,
  onSubmit,
  onCancel,
  busy,
  isEdit,
}) {
  const { t } = useTranslation()
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Select
        label={t('hotels.hotel')}
        value={value.hotelId}
        onChange={(e) => onChange({ ...value, hotelId: e.target.value })}
        required
        disabled={isEdit}
      >
        <option value="" disabled>
          {t('rooms.selectHotel')}
        </option>
        {hotels.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('rooms.roomNumber')}
          value={value.roomNumber}
          onChange={(e) => onChange({ ...value, roomNumber: e.target.value })}
          required
        />
        <Select
          label={t('rooms.type')}
          value={value.type}
          onChange={(e) => onChange({ ...value, type: e.target.value })}
        >
          {ROOM_TYPES.map((tt) => (
            <option key={tt} value={tt}>
              {t(`rooms.type_${tt}`)}
            </option>
          ))}
        </Select>
        <NumberInput
          label={t('rooms.priceAmd')}
          value={value.price}
          onChange={(e) => onChange({ ...value, price: e.target.value })}
          min={0}
          required
          placeholder="20000"
        />
        <NumberInput
          label={t('rooms.capacity')}
          value={value.capacity}
          onChange={(e) => onChange({ ...value, capacity: e.target.value })}
          min={1}
        />
        <Select
          label={t('common.status')}
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value })}
        >
          {ROOM_STATUS.map((s) => (
            <option key={s} value={s}>
              {t(`rooms.status_${s}`)}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        label={t('hotels.description')}
        rows={3}
        value={value.description || ''}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
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
