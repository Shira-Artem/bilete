import { useMemo } from 'react'
import { calculateTotal, getAttendeePrice, MAX_ATTENDEES, validateBooking } from '../domain/booking'
import type { Attendee, Booking } from '../domain/booking'

type Props = {
  booking: Booking
  showValidation: boolean
  onUpdateAttendee: (id: string, changes: Partial<Attendee>) => void
  onAddAttendee: () => void
  onRemoveAttendee: (id: string) => void
  onEmailChange: (email: string) => void
  onContinue: () => void
}

export function BookingPage({ booking, showValidation, onUpdateAttendee, onAddAttendee, onRemoveAttendee, onEmailChange, onContinue }: Props) {
  const errors = useMemo(() => showValidation ? validateBooking(booking) : {}, [booking, showValidation])
  const total = calculateTotal(booking.attendees)
  return (
    <div className="booking-content">
      <div className="section-heading">
        <span className="section-kicker">ВАШ ВЕЧЕР НАЧИНАЕТСЯ ЗДЕСЬ</span>
        <h2 id="booking-heading">Кто пойдёт?</h2>
        <p>Добавьте участников — подберём билет для каждого.</p>
      </div>

      <div className="attendee-list">
        {booking.attendees.map((attendee, index) => {
          const error = errors.attendees?.[attendee.id]
          const age = Number(attendee.age)
          const ticketLabel = attendee.age === '' ? 'Тип билета определится по возрасту' : age < 14 ? 'Детский билет · 1 000 ₽' : 'Полный билет · 2 000 ₽'
          return (
            <article className="attendee-card" key={attendee.id}>
              <div className="attendee-card-top"><div className="attendee-number"><span>0{index + 1}</span> УЧАСТНИК</div>{booking.attendees.length > 1 && <button className="remove-button" type="button" onClick={() => onRemoveAttendee(attendee.id)} aria-label={`Убрать участника ${index + 1}`}>Убрать</button>}</div>
              <div className="attendee-fields">
                <label className="form-field name-field"><span>Имя и фамилия</span><input type="text" autoComplete="name" placeholder="Например, Анна Иванова" value={attendee.name} onChange={(event) => onUpdateAttendee(attendee.id, { name: event.target.value })} aria-invalid={Boolean(error?.name)} aria-describedby={error?.name ? `name-${attendee.id}-error` : undefined} />{error?.name && <small className="field-error" id={`name-${attendee.id}-error`}>{error.name}</small>}</label>
                <label className="form-field age-field"><span>Возраст</span><div className="age-input-wrap"><input type="number" min="0" max="120" inputMode="numeric" placeholder="28" value={attendee.age} onChange={(event) => onUpdateAttendee(attendee.id, { age: event.target.value })} aria-invalid={Boolean(error?.age)} aria-describedby={error?.age ? `age-${attendee.id}-error` : undefined} /><span>лет</span></div>{error?.age && <small className="field-error" id={`age-${attendee.id}-error`}>{error.age}</small>}</label>
              </div>
              <div className="ticket-type"><span className="ticket-type-icon"><TicketIcon /></span><span>{ticketLabel}</span><strong>{getAttendeePrice(attendee.age).toLocaleString('ru-RU')} ₽</strong></div>
            </article>
          )
        })}
      </div>

      {errors.guardian && <p className="validation-banner" role="alert"><span>!</span>{errors.guardian}</p>}
      {booking.attendees.length < MAX_ATTENDEES && <button className="add-attendee" type="button" onClick={onAddAttendee}><span>＋</span> Добавить участника <small>{booking.attendees.length}/{MAX_ATTENDEES}</small></button>}

      <div className="email-block">
        <div className="email-heading"><span className="section-kicker">КУДА ОТПРАВИТЬ БИЛЕТЫ</span><span>Один адрес на заказ</span></div>
        <label className="form-field"><span>Email для билетов</span><input type="email" autoComplete="email" placeholder="you@example.com" value={booking.email} onChange={(event) => onEmailChange(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{errors.email && <small className="field-error" id="email-error">{errors.email}</small>}</label>
        <p className="privacy-note"><LockMiniIcon /> Используем адрес только для отправки билетов и важных деталей события.</p>
      </div>

      <div className="continue-row"><div><small>Всего за {booking.attendees.length} {booking.attendees.length === 1 ? 'участника' : 'участников'}</small><strong>{total.toLocaleString('ru-RU')} ₽</strong></div><button className="primary-button" type="button" onClick={onContinue}>Проверить заказ <span>→</span></button></div>
      <p className="age-note">Детям до 18 лет нужно прийти со взрослым участником этого заказа.</p>
    </div>
  )
}

function LockMiniIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg> }
function TicketIcon() { return <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12v2a2 2 0 0 0 0 4v2H3v-2a2 2 0 0 0 0-4V5Z"/><path d="M9 6.5v1m0 2v2"/></svg> }
