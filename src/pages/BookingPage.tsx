import { formatPrice, getAttendeePrice, MAX_ATTENDEES, parseAge, validateBooking } from '../domain/booking'
import type { Attendee, Booking } from '../domain/booking'

type Props = {
  booking: Booking
  showValidation: boolean
  total: number | null
  onUpdateAttendee: (id: string, changes: Partial<Attendee>) => void
  onAddAttendee: () => void
  onRemoveAttendee: (id: string) => void
  onEmailChange: (email: string) => void
  onContinue: () => void
}

export function BookingPage({ booking, showValidation, total, onUpdateAttendee, onAddAttendee, onRemoveAttendee, onEmailChange, onContinue }: Props) {
  const errors = showValidation ? validateBooking(booking) : {}
  return (
    <form className="booking-content" noValidate onSubmit={(event) => { event.preventDefault(); onContinue() }}>
      <div className="section-heading">
        <span className="section-kicker">ВАШ ВЕЧЕР НАЧИНАЕТСЯ ЗДЕСЬ</span>
        <h2 id="booking-heading">Кто пойдёт?</h2>
        <p>Добавьте участников — подберём билет для каждого.</p>
        <p className="mobile-price-note">До 14 лет — 1 000 ₽ · от 14 лет — 2 000 ₽</p>
      </div>

      <div className="attendee-list">
        {booking.attendees.map((attendee, index) => {
          const error = errors.attendees?.[attendee.id]
          const age = parseAge(attendee.age)
          const ticketLabel = age === null
            ? attendee.age === '' ? 'Тип билета определится по возрасту' : 'Проверьте возраст'
            : age < 14 ? 'Детский билет · 1 000 ₽' : 'Полный билет · 2 000 ₽'
          return (
            <article className="attendee-card" key={attendee.id}>
              <div className="attendee-card-top"><div className="attendee-number"><span>0{index + 1}</span> УЧАСТНИК</div>{booking.attendees.length > 1 && <button className="remove-button" type="button" onClick={() => onRemoveAttendee(attendee.id)} aria-label={`Убрать участника ${index + 1}`}>Убрать</button>}</div>
              <div className="attendee-fields">
                <div className="form-field name-field"><label htmlFor={`name-${attendee.id}`}>Имя и фамилия</label><input id={`name-${attendee.id}`} type="text" autoComplete="name" placeholder="Например, Анна Иванова" value={attendee.name} onChange={(event) => onUpdateAttendee(attendee.id, { name: event.target.value })} aria-invalid={Boolean(error?.name)} aria-describedby={error?.name ? `name-${attendee.id}-error` : undefined} />{error?.name && <small className="field-error" id={`name-${attendee.id}-error`}>{error.name}</small>}</div>
                <div className="form-field age-field"><label htmlFor={`age-${attendee.id}`}>Возраст</label><div className="age-input-wrap"><input id={`age-${attendee.id}`} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="28" value={attendee.age} onChange={(event) => onUpdateAttendee(attendee.id, { age: event.target.value })} aria-invalid={Boolean(error?.age)} aria-describedby={error?.age ? `age-${attendee.id}-error` : undefined} /><span>лет</span></div>{error?.age && <small className="field-error" id={`age-${attendee.id}-error`}>{error.age}</small>}</div>
              </div>
              <div className="ticket-type"><span className="ticket-type-icon"><TicketIcon /></span><span>{ticketLabel}</span><strong>{formatPrice(getAttendeePrice(attendee.age))}</strong></div>
            </article>
          )
        })}
      </div>

      {errors.order && <p className="validation-banner" id="booking-order-error" role="alert" tabIndex={-1}><span>!</span>{errors.order}</p>}
      {errors.guardian && <p className="validation-banner" id="guardian-error" role="alert" tabIndex={-1}><span>!</span>{errors.guardian}</p>}
      {booking.attendees.length < MAX_ATTENDEES && <button className="add-attendee" type="button" onClick={onAddAttendee}><span>＋</span> Добавить участника <small>{booking.attendees.length}/{MAX_ATTENDEES}</small></button>}

      <div className="email-block">
        <div className="email-heading"><span className="section-kicker">КУДА ОТПРАВИТЬ БИЛЕТЫ</span><span>Один адрес на заказ</span></div>
        <div className="form-field"><label htmlFor="booking-email">Email для билетов</label><input id="booking-email" type="email" autoComplete="email" placeholder="you@example.com" value={booking.email} onChange={(event) => onEmailChange(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />{errors.email && <small className="field-error" id="email-error">{errors.email}</small>}</div>
        <p className="privacy-note"><LockMiniIcon /> Email нужен для демонстрации. Письмо не отправляется.</p>
      </div>

      <div className="continue-row"><div><small>{total === null ? 'Укажите корректный возраст' : `Итого за ${booking.attendees.length} ${booking.attendees.length === 1 ? 'участника' : 'участников'}`}</small><strong aria-live="polite">{formatPrice(total)}</strong></div><button className="primary-button" type="submit">Проверить заказ <span>→</span></button></div>
      <p className="age-note">Детям до 18 лет нужно прийти со взрослым участником этого заказа.</p>
    </form>
  )
}

function LockMiniIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg> }
function TicketIcon() { return <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12v2a2 2 0 0 0 0 4v2H3v-2a2 2 0 0 0 0-4V5Z"/><path d="M9 6.5v1m0 2v2"/></svg> }
