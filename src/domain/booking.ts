export type Attendee = {
  id: string
  name: string
  age: string
}

export type Booking = {
  attendees: Attendee[]
  email: string
}

export type BookingErrors = {
  attendees?: Record<string, { name?: string; age?: string }>
  email?: string
  guardian?: string
  order?: string
}

export const FULL_TICKET_PRICE = 2000
export const CHILD_TICKET_PRICE = 1000
export const MAX_ATTENDEES = 4

export function parseAge(value: string): number | null {
  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) return null
  const age = Number(normalized)
  return Number.isSafeInteger(age) && age <= 120 ? age : null
}

export function getAttendeePrice(age: string): number | null {
  const parsedAge = parseAge(age)
  if (parsedAge === null) return null
  return parsedAge < 14 ? CHILD_TICKET_PRICE : FULL_TICKET_PRICE
}

export function calculateTotal(attendees: Attendee[]): number | null {
  const prices = attendees.map(({ age }) => getAttendeePrice(age))
  if (prices.some((price) => price === null)) return null
  return prices.reduce<number>((total, price) => total + (price ?? 0), 0)
}

export function formatPrice(amount: number | null): string {
  return amount === null ? '—' : `${amount.toLocaleString('ru-RU')} ₽`
}

export function validateBooking(booking: Booking): BookingErrors {
  const errors: BookingErrors = {}
  const attendeeErrors: NonNullable<BookingErrors['attendees']> = {}
  let hasMinor = false
  let hasAdult = false

  if (booking.attendees.length < 1 || booking.attendees.length > MAX_ATTENDEES) {
    errors.order = `В заказе должно быть от 1 до ${MAX_ATTENDEES} участников.`
  }

  booking.attendees.forEach((attendee) => {
    const current: { name?: string; age?: string } = {}
    if (!attendee.name.trim()) current.name = 'Укажите имя участника.'
    const age = parseAge(attendee.age)
    if (age === null) current.age = 'Введите целый возраст от 0 до 120 лет.'
    else {
      if (age < 18) hasMinor = true
      if (age >= 18) hasAdult = true
    }
    if (Object.keys(current).length) attendeeErrors[attendee.id] = current
  })

  if (Object.keys(attendeeErrors).length) errors.attendees = attendeeErrors
  if (hasMinor && !hasAdult) errors.guardian = 'Для участника младше 18 лет добавьте в заказ взрослого от 18 лет.'
  if (!booking.email.trim()) errors.email = 'Укажите email для билетов.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email.trim())) errors.email = 'Проверьте формат email.'
  return errors
}

export function createDemoOrderNumber(date: Date, uuid: string): string {
  const suffix = uuid.replaceAll('-', '').slice(0, 8).toUpperCase()
  return `SQ-${date.getFullYear()}-${suffix}`
}
