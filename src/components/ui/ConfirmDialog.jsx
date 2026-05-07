import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
  loading,
  onCancel,
  onConfirm,
}) {
  const { t } = useTranslation()
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title ?? t('common.areYouSure')}
      size="sm"
    >
      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelText ?? t('common.cancel')}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText ?? t('common.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
