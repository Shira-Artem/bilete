import { useMemo, useState } from 'react'
import { BookingPage } from './pages/BookingPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { SuccessPage } from './pages/SuccessPage'
import { calculateTotal, validateBooking } from './domain/booking'
import type { Attendee, Booking } from './domain/booking'

const initialBooking: Booking = {
  attendees: [{ id: crypto.randomUUID(), name: '', age: '' }],
  email: '',
}

function App() {
  const [booking, setBooking] = useState<Booking>(initialBooking)
  const [step, setStep] = useState<'details' | 'confirmation' | 'success'>('details')
  const [soldOut, setSoldOut] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const total = useMemo(() => calculateTotal(booking.attendees), [booking.attendees])

  function updateAttendee(id: string, changes: Partial<Attendee>) {
    setBooking((current) => ({
      ...current,
      attendees: current.attendees.map((attendee) => attendee.id === id ? { ...attendee, ...changes } : attendee),
    }))
  }

  function addAttendee() {
    setBooking((current) => current.attendees.length >= 4 ? current : ({
      ...current,
      attendees: [...current.attendees, { id: crypto.randomUUID(), name: '', age: '' }],
    }))
  }

  function removeAttendee(id: string) {
    setBooking((current) => current.attendees.length <= 1 ? current : ({
      ...current,
      attendees: current.attendees.filter((attendee) => attendee.id !== id),
    }))
  }

  function continueToConfirmation() {
    const errors = validateBooking(booking)
    setShowValidation(true)
    if (Object.keys(errors).length) {
      const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      firstInvalid?.focus()
      return
    }
    setBookingError('')
    setStep('confirmation')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function confirmBooking() {
    if (soldOut) {
      setBookingError('Пока вы оформляли заказ, свободные места закончились. Билеты не списаны, данные заказа сохранены.')
      return
    }
    setBookingError('')
    setStep('success')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startOver() {
    setBooking({ ...initialBooking, attendees: [{ id: crypto.randomUUID(), name: '', age: '' }] })
    setStep('details')
    setBookingError('')
    setShowValidation(false)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Sqoch — на главную"><span className="brand-symbol">s</span><span>sqoch</span></a>
        <a className="help-link" href="mailto:help@sqoch.ru">Нужна помощь?</a>
      </header>

      {step !== 'success' ? (
        <>
          <section className="event-hero" id="top">
            <div className="hero-copy">
              <span className="event-label"><span className="live-dot" /> ВСТРЕЧАЕМСЯ ВМЕСТЕ</span>
              <h1>Город звучит<br /><em>по-новому.</em></h1>
              <p>Один вечер, который захочется повторить. Выбирайте билеты и приходите всей семьёй.</p>
              <div className="event-meta"><span><CalendarIcon /> 24 октября, 19:00</span><span><PinIcon /> Москва, Музей «Гараж»</span></div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="sun-disc" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="art-sticker">LIVE<br />2026</div><div className="art-caption">SOUND<br />OF THE CITY</div>
            </div>
          </section>

          <div className="content-layout">
            <section className="booking-panel" aria-labelledby="booking-heading">
              <div className="progress-row">
                <div className={`progress-step ${step === 'details' ? 'current' : 'done'}`}><span>01</span><b>Участники</b></div>
                <span className="progress-line" />
                <div className={`progress-step ${step === 'confirmation' ? 'current' : ''}`}><span>02</span><b>Проверка заказа</b></div>
              </div>
              {step === 'details' ? (
                <BookingPage booking={booking} showValidation={showValidation} onUpdateAttendee={updateAttendee} onAddAttendee={addAttendee} onRemoveAttendee={removeAttendee} onEmailChange={(email) => setBooking((current) => ({ ...current, email }))} onContinue={continueToConfirmation} />
              ) : (
                <ConfirmationPage booking={booking} total={total} error={bookingError} onEdit={() => { setBookingError(''); setStep('details'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onConfirm={confirmBooking} />
              )}
            </section>

            <aside className="order-aside" aria-label="Информация о заказе">
              <section className="price-card">
                <div className="aside-heading"><span>ВАШ ЗАКАЗ</span><span className="secure-mark"><LockIcon /> защищено</span></div>
                <h2>Билеты на событие</h2>
                <p className="aside-subtitle">24 октября · Москва</p>
                <div className="price-divider" />
                <div className="price-row"><span>Полный билет <small>от 14 лет</small></span><strong>2 000 ₽</strong></div>
                <div className="price-row"><span>Детский билет <small>до 14 лет</small></span><strong>1 000 ₽</strong></div>
                <div className="price-divider" />
                <div className="total-row"><span>Итого</span><strong>{total.toLocaleString('ru-RU')} ₽</strong></div>
                <p className="no-fees">Без скрытых комиссий</p>
              </section>
              <section className="trust-note"><span className="check-icon"><CheckIcon /></span><p><strong>Спокойно планируйте</strong><br />Данные можно изменить до подтверждения заказа.</p></section>
              <section className="demo-control">
                <span className="demo-kicker">ДЕМО-СЦЕНАРИЙ</span>
                <button type="button" className={`scenario-toggle ${soldOut ? 'active' : ''}`} onClick={() => { setSoldOut((value) => !value); setBookingError('') }} aria-pressed={soldOut}>
                  <span className="toggle-track"><span /></span>
                  <span><strong>Места закончились</strong><small>{soldOut ? 'Сработает при подтверждении' : 'Проверить сценарий отказа'}</small></span>
                </button>
                <p>Переключи для проверки обоих вариантов оформления.</p>
              </section>
            </aside>
          </div>
          <footer className="page-footer"><span>sqoch · билеты без лишнего</span><span>Оплата защищена <LockIcon /></span></footer>
        </>
      ) : <SuccessPage booking={booking} total={total} onStartOver={startOver} />}
    </main>
  )
}

function CalendarIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M6.5 3v4M13.5 3v4M3 9h14"/></svg> }
function PinIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 8c0 4.2-6 9-6 9S4 12.2 4 8a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/></svg> }
function LockIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg> }
function CheckIcon() { return <svg viewBox="0 0 18 18" aria-hidden="true"><path d="m4 9 3.2 3.2L14 5.5"/></svg> }

export default App
