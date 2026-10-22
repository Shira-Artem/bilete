import type { Booking } from '../domain/booking'

type Props = { booking: Booking; total: number; orderNumber: string; onStartOver: () => void }

export function SuccessPage({ booking, total, orderNumber, onStartOver }: Props) {
  return (
    <section className="success-screen" aria-labelledby="success-title">
      <div className="success-top"><span className="success-check">✓</span><span className="success-label">ДЕМО-ЗАКАЗ СОЗДАН</span></div>
      <h1 id="success-title">До встречи<br /><em>на событии.</em></h1>
      <p className="success-lede">Это успешный демонстрационный сценарий для <strong>{booking.email}</strong>. Письмо и билет не отправлялись.</p>
      <div className="success-ticket">
        <div className="ticket-top"><div><small>ДЕМО-НОМЕР ЗАКАЗА</small><strong>{orderNumber}</strong></div><span className="ticket-stamp">SQOCH<br />DEMO</span></div>
        <div className="ticket-dashes" />
        <div className="ticket-event"><div><small>СОБЫТИЕ</small><strong>Город звучит по-новому</strong></div><div><small>КОГДА</small><strong>24 октября · 19:00</strong></div><div><small>УЧАСТНИКИ</small><strong>{booking.attendees.length} {booking.attendees.length === 1 ? 'билет' : 'билета'}</strong></div></div>
        <div className="ticket-bottom"><span>Итог демо-заказа</span><strong>{total.toLocaleString('ru-RU')} ₽</strong></div>
      </div>
      <div className="success-actions"><button className="primary-button" type="button" onClick={onStartOver}>Начать новый демо-заказ</button><span><span className="mail-dot" /> Оплата не выполнялась</span></div>
      <p className="success-footer">Демо-номер создан только для этой сессии.</p>
    </section>
  )
}
