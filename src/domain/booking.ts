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
}

export const FULL_TICKET_PRICE = 2000
export const CHILD_TICKET_PRICE = 1000
export const MAX_ATTENDEES = 4

export function getAttendeePrice(age: string): number {
  const parsedAge = Number(age)
  return age !== '' && parsedAge < 14 ? CHILD_TICKET_PRICE : FULL_TICKET_PRICE
}

export function calculateTotal(attendees: Attendee[]): number {
  return attendees.reduce((total, attendee) => total + getAttendeePrice(attendee.age), 0)
}

export function validateBooking(booking: Booking): BookingErrors {
  const errors: BookingErrors = {}
  const attendeeErrors: NonNullable<BookingErrors['attendees']> = {}
  let hasMinor = false
  let hasAdult = false

  booking.attendees.forEach((attendee) => {
    const current: { name?: string; age?: string } = {}
    if (!attendee.name.trim()) current.name = 'Укажите имя участника.'
    const age = Number(attendee.age)
    if (attendee.age.trim() === '') current.age = 'Укажите возраст.'
    else if (!Number.isInteger(age) || age < 0 || age > 120) current.age = 'Введите возраст от 0 до 120 лет.'
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
