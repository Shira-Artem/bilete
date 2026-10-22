import { describe, expect, it } from 'vitest'
import {
  calculateTotal,
  createDemoOrderNumber,
  getAttendeePrice,
  parseAge,
  validateBooking,
} from './booking'
import type { Attendee, Booking } from './booking'

function attendee(age: string, name = 'Анна Иванова'): Attendee {
  return { id: `person-${name}-${age}`, name, age }
}

function booking(attendees: Attendee[], email = 'anna@example.com'): Booking {
  return { attendees, email }
}

describe('ticket prices and ages', () => {
  it.each([
    ['13', 1000],
    ['14', 2000],
    ['17', 2000],
    ['18', 2000],
  ])('uses the correct price at age %s', (age, price) => {
    expect(getAttendeePrice(age)).toBe(price)
  })

  it.each(['', '-1', '1.5', '1e2', '121', 'Infinity', '  '])('rejects an invalid age value %j and does not calculate a price', (age) => {
    expect(parseAge(age)).toBeNull()
    expect(getAttendeePrice(age)).toBeNull()
    expect(calculateTotal([attendee(age)])).toBeNull()
  })

  it('allows zero and rejects values outside the supported range', () => {
    expect(parseAge('0')).toBe(0)
    expect(parseAge('120')).toBe(120)
    expect(parseAge('121')).toBeNull()
  })

  it('calculates a mixed order only when every age is valid', () => {
    expect(calculateTotal([attendee('13'), attendee('14'), attendee('17'), attendee('18')])).toBe(7000)
  })
})

describe('booking validation', () => {
  it('accepts a single adult', () => {
    expect(validateBooking(booking([attendee('18')]))).toEqual({})
  })

  it('requires an adult when any attendee is under 18', () => {
    expect(validateBooking(booking([attendee('13')])).guardian).toBeTruthy()
    expect(validateBooking(booking([attendee('17')])).guardian).toBeTruthy()
  })

  it('accepts a child and a participant aged 18 or older together', () => {
    expect(validateBooking(booking([attendee('13'), attendee('18', 'Пётр Иванов')]))).toEqual({})
  })

  it('accepts four attendees and rejects an order with a fifth', () => {
    const four = [attendee('18', 'A'), attendee('17', 'B'), attendee('14', 'C'), attendee('0', 'D')]
    expect(validateBooking(booking(four))).toEqual({})
    expect(validateBooking(booking([...four, attendee('20', 'E')])).order).toBeTruthy()
  })

  it('reports missing name, missing age, and malformed email', () => {
    const result = validateBooking(booking([{ id: 'empty', name: '  ', age: '' }], 'wrong-email'))
    expect(result.attendees?.empty).toEqual({ name: 'Укажите имя участника.', age: 'Введите целый возраст от 0 до 120 лет.' })
    expect(result.email).toBeTruthy()
  })

  it('creates different demo references independently of attendee count', () => {
    const date = new Date('2026-10-22T12:00:00Z')
    expect(createDemoOrderNumber(date, 'a1a1a1a1-0000-0000-0000-000000000000'))
      .not.toBe(createDemoOrderNumber(date, 'b2b2b2b2-0000-0000-0000-000000000000'))
  })
})
