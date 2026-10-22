import type { Booking } from '../domain/booking'

type Props = { booking: Booking; total: number; onStartOver: () => void }

export function SuccessPage({ booking, total, onStartOver }: Props) {
  const orderNumber = `SQ-${new Date().getFullYear()}-${String(booking.attendees.length * 1847 + 302).padStart(5, '0')}`
  return (
    <section className="success-screen" aria-labelledby="success-title">
      <div className="success-top"><span className="success-check">✓</span><span className="success-label">ЗАКАЗ ОФОРМЛЕН</span></div>
      <h1 id="success-title">До встречи<br /><em>на событии.</em></h1>
      <p className="success-lede">Билеты уже отправлены на <strong>{booking.email}</strong>. Сохраните номер заказа — он пригодится на входе.</p>
      <div className="success-ticket">
        <div className="ticket-top"><div><small>НОМЕР ЗАКАЗА</small><strong>{orderNumber}</strong></div><span className="ticket-stamp">SQOCH<br />LIVE</span></div>
        <div className="ticket-dashes" />
        <div className="ticket-event"><div><small>СОБЫТИЕ</small><strong>Город звучит по-новому</strong></div><div><small>КОГДА</small><strong>24 октября · 19:00</strong></div><div><small>УЧАСТНИКИ</small><strong>{booking.attendees.length} {booking.attendees.length === 1 ? 'билет' : 'билета'}</strong></div></div>
        <div className="ticket-bottom"><span>Итого оплачено</span><strong>{total.toLocaleString('ru-RU')} ₽</strong></div>
      </div>
      <div className="success-actions"><button className="primary-button" type="button" onClick={onStartOver}>Оформить ещё заказ</button><span><span className="mail-dot" /> Письмо уже в пути</span></div>
      <p className="success-footer">Возник вопрос? <a href="mailto:help@sqoch.ru">Напишите нам</a></p>
    </section>
  )
}
