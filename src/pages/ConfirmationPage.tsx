import type { Booking } from '../domain/booking'

type Props = {
  booking: Booking
  total: number
  error: string
  onEdit: () => void
  onConfirm: () => void
}

export function ConfirmationPage({ booking, total, error, onEdit, onConfirm }: Props) {
  return (
    <div className="booking-content confirmation-content">
      <div className="section-heading"><span className="section-kicker">ПОСЛЕДНИЙ ШАГ</span><h2 id="booking-heading">Всё верно?</h2><p>Проверьте данные перед подтверждением заказа.</p></div>
      {error && <div className="soldout-banner" role="alert"><span className="soldout-icon">!</span><div><strong>Не удалось оформить билеты</strong><p>{error}</p></div></div>}
      <section className="review-card" aria-label="Участники заказа">
        <div className="review-card-heading"><strong>Участники</strong><button type="button" className="text-button" onClick={onEdit}>Изменить</button></div>
        {booking.attendees.map((attendee) => <div className="review-attendee" key={attendee.id}><span className="review-avatar">{attendee.name.trim().charAt(0).toUpperCase()}</span><div><strong>{attendee.name}</strong><small>{attendee.age} лет · {Number(attendee.age) < 14 ? 'Детский билет' : 'Полный билет'}</small></div><b>{Number(attendee.age) < 14 ? '1 000' : '2 000'} ₽</b></div>)}
        <div className="review-email"><span className="email-icon">✉</span><div><small>Билеты придут на</small><strong>{booking.email}</strong></div></div>
      </section>
      <section className="payment-summary"><span>Итого к оплате</span><strong>{total.toLocaleString('ru-RU')} ₽</strong><small>Никаких дополнительных сборов</small></section>
      <button className="primary-button confirm-button" type="button" onClick={onConfirm}>Подтвердить заказ <span>→</span></button>
      <p className="confirm-legal">Нажимая кнопку, вы подтверждаете данные участников и согласие с правилами посещения.</p>
      <button className="back-link" type="button" onClick={onEdit}>← Вернуться к данным</button>
    </div>
  )
}
