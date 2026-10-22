import type { Booking } from '../domain/booking'
import { CHILD_TICKET_PRICE, formatPrice, getAttendeePrice } from '../domain/booking'

type Props = {
  booking: Booking
  total: number
  error: string
  soldOut: boolean
  onToggleSoldOut: () => void
  onEdit: () => void
  onConfirm: () => void
}

export function ConfirmationPage({ booking, total, error, soldOut, onToggleSoldOut, onEdit, onConfirm }: Props) {
  return (
    <div className="booking-content confirmation-content">
      <div className="section-heading"><span className="section-kicker">ПОСЛЕДНИЙ ШАГ</span><h2 id="booking-heading">Всё верно?</h2><p>Проверьте данные перед подтверждением заказа.</p></div>
      {error && <div className="soldout-banner" role="alert"><span className="soldout-icon">!</span><div><strong>Места закончились</strong><p>{error}</p></div></div>}
      <section className="review-card" aria-label="Участники заказа">
        <div className="review-card-heading"><strong>Участники</strong><button type="button" className="text-button" onClick={onEdit}>Изменить</button></div>
        {booking.attendees.map((attendee) => <div className="review-attendee" key={attendee.id}><span className="review-avatar">{attendee.name.trim().charAt(0).toUpperCase()}</span><div><strong>{attendee.name}</strong><small>{attendee.age} лет · {getAttendeePrice(attendee.age) === CHILD_TICKET_PRICE ? 'Детский билет' : 'Полный билет'}</small></div><b>{formatPrice(getAttendeePrice(attendee.age))}</b></div>)}
        <div className="review-email"><span className="email-icon"><MailIcon /></span><div><small>Email для демо-заказа · без отправки письма</small><strong>{booking.email}</strong></div></div>
      </section>
      <section className="payment-summary"><span>Итог демо-заказа</span><strong>{formatPrice(total)}</strong><small>Оплата и отправка писем не подключены.</small></section>
      <section className="demo-control mobile-demo-control" aria-label="Демонстрационный сценарий">
        <span className="demo-kicker">ДЕМО-СЦЕНАРИЙ</span>
        <button type="button" className={`scenario-toggle ${soldOut ? 'active' : ''}`} onClick={onToggleSoldOut} aria-pressed={soldOut}>
          <span className="toggle-track"><span /></span>
          <span><strong>Места закончились</strong><small>{soldOut ? 'Сработает при подтверждении' : 'Проверить сценарий отказа'}</small></span>
        </button>
        <p>Переключатель только для проверки оформления.</p>
      </section>
      <button className="primary-button confirm-button" type="button" onClick={onConfirm} disabled={Boolean(error)}>Создать демо-заказ <span>→</span></button>
      <p className="confirm-legal">Перед созданием можно изменить участников и контактный email.</p>
    </div>
  )
}

function MailIcon() { return <svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="4" width="13" height="10" rx="2"/><path d="m3.5 5.5 5.5 4 5.5-4"/></svg> }
