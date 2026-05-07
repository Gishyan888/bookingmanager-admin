import { Phone } from 'lucide-react'
import { Input } from './Input'

const CC = '374'
const MAX_NATIONAL = 8

/** Digits after country code (max 8), Armenian mobiles. */
export function nationalFromAnyStored(stored) {
  if (stored == null || stored === '') return ''
  const d = String(stored).replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith(CC)) return d.slice(3, 3 + MAX_NATIONAL)
  return d.slice(0, MAX_NATIONAL)
}

function formatNationalPairs(nat) {
  if (!nat) return ''
  const parts = []
  for (let i = 0; i < nat.length; i += 2) {
    parts.push(nat.slice(i, Math.min(i + 2, nat.length)))
  }
  return parts.join(' ')
}

/** Display: "+374" or "+374 99 99 99 99" */
export function formatArmeniaPhoneDisplay(nat) {
  const body = formatNationalPairs(nat)
  return body ? `+${CC} ${body}` : `+${CC}`
}

/**
 * Empty / prefix-only → no subscriber digits to send.
 */
export function phoneForSubmit(stored) {
  const nat = nationalFromAnyStored(stored)
  if (!nat) return ''
  return formatArmeniaPhoneDisplay(nat)
}

export function PhoneInput({
  value,
  onChange,
  leadingIcon = <Phone size={16} />,
  placeholder = '+374 99 99 99 99',
  ...rest
}) {
  const nat = nationalFromAnyStored(value)
  const display = formatArmeniaPhoneDisplay(nat)

  const handleChange = (e) => {
    const raw = e.target.value
    const digits = raw.replace(/\D/g, '')
    let national = ''
    if (!digits) {
      national = ''
    } else if (digits.startsWith(CC)) {
      national = digits.slice(3, 3 + MAX_NATIONAL)
    } else {
      national = digits.slice(0, MAX_NATIONAL)
    }
    const next = formatArmeniaPhoneDisplay(national)
    onChange?.({ ...e, target: { ...e.target, value: next } })
  }

  return (
    <Input
      {...rest}
      type="text"
      inputMode="tel"
      autoComplete="tel"
      leadingIcon={leadingIcon}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
    />
  )
}
