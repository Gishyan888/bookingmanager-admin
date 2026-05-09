import i18n from '../i18n'

/** Exact NestJS `message` (string) → i18n key */
const API_MESSAGE_KEYS = {
  'Manager has no assigned hotel': 'errors.api.managerNoHotel',
  'Customer not found': 'errors.api.customerNotFound',
  'No access to this customer': 'errors.api.noAccessCustomer',
  'No write access to this customer': 'errors.api.noWriteCustomer',
  'checkOut must be after checkIn': 'errors.api.checkOutAfterCheckIn',
  'Room not found': 'errors.api.roomNotFound',
  'Room has another booking that overlaps these dates':
    'errors.api.roomBookingOverlap',
  'Booking not found': 'errors.api.bookingNotFound',
  'Managers cannot delete bookings': 'errors.api.managersCannotDeleteBooking',
  'No access to this room': 'errors.api.noAccessRoom',
  'No read access to this booking': 'errors.api.noReadBooking',
  'No write access to this booking': 'errors.api.noWriteBooking',
  'Email already in use': 'errors.api.emailInUse',
  'User not found': 'errors.api.userNotFound',
  'Email already registered': 'errors.api.emailRegistered',
  'Invalid credentials': 'errors.api.invalidCredentials',
  'Your account is inactive. An administrator must activate it.':
    'errors.api.accountInactive',
  'Your account is inactive. Verify your email with OTP first.':
    'errors.api.accountInactive',
  'The hotel owner account is currently disabled.':
    'errors.api.ownerAccountDisabled',
  'Invalid or expired OTP': 'errors.api.invalidOtp',
  'Notification not found': 'errors.api.notificationNotFound',
  'Not authenticated': 'errors.api.notAuthenticated',
  'Invalid or inactive user': 'errors.api.invalidOrInactiveUser',
  'Hotel owner is currently inactive — manager access disabled.':
    'errors.api.ownerInactiveManagerBlocked',
  'Hotel not found': 'errors.api.hotelNotFound',
  'No access to this hotel': 'errors.api.noAccessHotel',
  'No write access to this hotel': 'errors.api.noWriteHotel',
  'ownerId is required for admin': 'errors.api.ownerIdRequired',
  'Owner not found': 'errors.api.ownerNotFound',
  'Managers cannot create hotels': 'errors.api.managersCannotCreateHotels',
  'Owner user not found': 'errors.api.ownerUserNotFound',
}

const VALIDATION_HINT =
  /must be longer|must be shorter|must not be empty|should not be empty|must be an? |must be a valid|must match|is invalid|should be|each value in nested property/i

function translateOne(msg) {
  const s = typeof msg === 'string' ? msg.trim() : ''
  if (!s) return i18n.t('errors.generic')
  const exact = API_MESSAGE_KEYS[s]
  if (exact) return i18n.t(exact)
  if (s.startsWith('Forbidden: requires ')) {
    return i18n.t('errors.api.forbiddenRole')
  }
  if (s.startsWith('property ') && s.includes(' should not exist')) {
    const field = s
      .replace(/^property\s+/i, '')
      .replace(/\s+should not exist$/i, '')
    return `${field}: ${i18n.t('errors.validation')}`
  }
  if (VALIDATION_HINT.test(s)) {
    return s
  }
  if (s === 'Network Error') {
    return i18n.t('errors.network')
  }
  return s
}

/**
 * Turn API / axios error `message` (string | string[]) into a user-facing string in the current locale.
 */
export function translateApiErrorMessage(message) {
  if (message == null) return i18n.t('errors.generic')
  const list = Array.isArray(message) ? message : [message]
  const out = []
  const seen = new Set()
  for (const part of list) {
    if (part == null || part === '') continue
    const line = translateOne(String(part))
    if (!seen.has(line)) {
      seen.add(line)
      out.push(line)
    }
  }
  return out.length ? out.join(' ') : i18n.t('errors.generic')
}
