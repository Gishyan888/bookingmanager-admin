/**
 * @param {{ type?: string, title?: string, body?: string, metadata?: Record<string, unknown> | null }} n
 * @param {import('i18next').TFunction} t
 */
export function getTranslatedNotification(n, t) {
  const meta =
    n.metadata && typeof n.metadata === 'object' ? n.metadata : {}
  const type = n.type

  switch (type) {
    case 'owner_registered': {
      return {
        title: t('notifications.content.owner_registered.title'),
        body: t('notifications.content.owner_registered.body', {
          ownerName: String(meta.ownerName ?? ''),
          ownerEmail: String(meta.ownerEmail ?? ''),
        }),
      }
    }
    case 'account_activated':
      return {
        title: t('notifications.content.account_activated.title'),
        body: t('notifications.content.account_activated.body'),
      }
    case 'account_deactivated':
      return {
        title: t('notifications.content.account_deactivated.title'),
        body: t('notifications.content.account_deactivated.body'),
      }
    case 'owner_deactivated_manager':
      return {
        title: t('notifications.content.owner_deactivated_manager.title'),
        body: t('notifications.content.owner_deactivated_manager.body'),
      }
    case 'booking_created': {
      if (!('customerName' in meta)) break
      return {
        title: t('notifications.content.booking_created.title'),
        body: t('notifications.content.booking_created.body', {
          customerName: String(meta.customerName ?? ''),
          hotelName: String(meta.hotelName ?? ''),
          roomNumber: String(meta.roomNumber ?? ''),
        }),
      }
    }
    case 'booking_updated': {
      if (!('customerName' in meta)) break
      const cur = meta.status != null ? String(meta.status) : ''
      const prev =
        meta.prevStatus != null ? String(meta.prevStatus) : ''
      const statusPart =
        prev && cur && prev !== cur
          ? t('notifications.content.booking_updated.statusFromTo', {
              from: t(`bookings.status.${prev}`),
              to: t(`bookings.status.${cur}`),
            })
          : t('notifications.content.booking_updated.statusCurrent', {
              status: t(`bookings.status.${cur}`),
            })
      return {
        title: t('notifications.content.booking_updated.title'),
        body: t('notifications.content.booking_updated.body', {
          customerName: String(meta.customerName ?? ''),
          hotelName: String(meta.hotelName ?? ''),
          statusPart,
        }),
      }
    }
    case 'booking_removed': {
      if (!('customerName' in meta)) break
      return {
        title: t('notifications.content.booking_removed.title'),
        body: t('notifications.content.booking_removed.body', {
          customerName: String(meta.customerName ?? ''),
          hotelName: String(meta.hotelName ?? ''),
        }),
      }
    }
    default:
      break
  }
  return {
    title: n.title ?? '',
    body: n.body ?? '',
  }
}
