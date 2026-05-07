import { useTranslation } from 'react-i18next'
import { Input, Textarea } from '../ui/Input'
import { PhoneInput } from '../ui/PhoneInput'
import { Button } from '../ui/Button'

export function CustomerForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  busy,
  isEdit,
}) {
  const { t } = useTranslation()
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        label={t('auth.fullName')}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('auth.email')}
          type="email"
          value={value.email || ''}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
        <PhoneInput
          label={t('auth.phone')}
          value={value.phone || ''}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
      </div>
      <Input
        label={t('customers.idDocument')}
        value={value.idDocument || ''}
        onChange={(e) => onChange({ ...value, idDocument: e.target.value })}
      />
      <Textarea
        label={t('customers.address')}
        rows={2}
        value={value.address || ''}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
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
