import { useLayoutEffect, useRef, useState } from 'react'
import { BookingPage } from './pages/BookingPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { SuccessPage } from './pages/SuccessPage'
import { calculateTotal, createDemoOrderNumber, formatPrice, validateBooking } from './domain/booking'
import type { Attendee, Booking } from './domain/booking'

function createInitialBooking(): Booking {
  return { attendees: [{ id: crypto.randomUUID(), name: '', age: '' }], email: '' }
}

function App() {
  const [booking, setBooking] = useState<Booking>(createInitialBooking)
  const [step, setStep] = useState<'details' | 'confirmation' | 'success'>('details')
  const [soldOut, setSoldOut] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const [focusFirstError, setFocusFirstError] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const confirmingRef = useRef(false)
  const total = calculateTotal(booking.attendees)

  useLayoutEffect(() => {
    if (!focusFirstError) return
    const target = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?? document.querySelector<HTMLElement>('#booking-order-error')
      ?? document.querySelector<HTMLElement>('#guardian-error')
    target?.focus()
    setFocusFirstError(false)
  }, [focusFirstError])

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
      setFocusFirstError(true)
      return
    }
    setBooking((current) => ({ ...current, email: current.email.trim() }))
    setBookingError('')
    setStep('confirmation')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function confirmBooking() {
    if (confirmingRef.current || step !== 'confirmation') return

    const errors = validateBooking(booking)
    if (Object.keys(errors).length || total === null) {
      setShowValidation(true)
      setStep('details')
      setFocusFirstError(true)
      setBookingError('')
      return
    }

    if (soldOut) {
      setBookingError('Демо-заказ не создан: свободные места закончились. Данные сохранены — измените заказ или попробуйте ещё раз.')
      return
    }

    confirmingRef.current = true
    setOrderNumber(createDemoOrderNumber(new Date(), crypto.randomUUID()))
    setBookingError('')
    setStep('success')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleSoldOut() {
    setSoldOut((value) => !value)
    setBookingError('')
  }

  function startOver() {
    setBooking(createInitialBooking())
    setStep('details')
    setSoldOut(false)
    setBookingError('')
    setShowValidation(false)
    setFocusFirstError(false)
    setOrderNumber(null)
    confirmingRef.current = false
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Sqoch — на главную"><span className="brand-symbol">s</span><span>sqoch</span></a>
        <a className="help-link" href="#demo-note">О демо</a>
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
                <BookingPage booking={booking} showValidation={showValidation} total={total} onUpdateAttendee={updateAttendee} onAddAttendee={addAttendee} onRemoveAttendee={removeAttendee} onEmailChange={(email) => setBooking((current) => ({ ...current, email }))} onContinue={continueToConfirmation} />
              ) : (
                <ConfirmationPage booking={booking} total={total ?? 0} error={bookingError} soldOut={soldOut} onToggleSoldOut={toggleSoldOut} onEdit={() => { setBookingError(''); setStep('details'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onConfirm={confirmBooking} />
              )}
            </section>

            <aside className="order-aside" aria-label="Информация о заказе">
              <section className="price-card">
                <div className="aside-heading"><span>ВАШ ЗАКАЗ</span><span className="secure-mark">ДЕМО</span></div>
                <h2>Билеты на событие</h2>
                <p className="aside-subtitle">24 октября · Москва</p>
                <div className="price-divider" />
                <div className="price-row"><span>Полный билет <small>от 14 лет</small></span><strong>2 000 ₽</strong></div>
                <div className="price-row"><span>Детский билет <small>младше 14 лет</small></span><strong>1 000 ₽</strong></div>
                <div className="price-divider" />
                <div className="total-row"><span>Итого</span><strong>{formatPrice(total)}</strong></div>
                <p className="no-fees">Оплата не подключена</p>
              </section>
              <section className="trust-note"><span className="check-icon"><CheckIcon /></span><p><strong>Спокойно планируйте</strong><br />Данные можно изменить до подтверждения заказа.</p></section>
              <section className="demo-control" id="demo-note">
                <span className="demo-kicker">ДЕМО-СЦЕНАРИЙ</span>
                <button type="button" className={`scenario-toggle ${soldOut ? 'active' : ''}`} onClick={toggleSoldOut} aria-pressed={soldOut}>
                  <span className="toggle-track"><span /></span>
                  <span><strong>Места закончились</strong><small>{soldOut ? 'Сработает при подтверждении' : 'Проверить сценарий отказа'}</small></span>
                </button>
                <p>Переключи для проверки обоих вариантов. Заказ не уйдёт в реальную систему.</p>
              </section>
            </aside>
          </div>
          <footer className="page-footer"><span>sqoch · билеты без лишнего</span><span>Демонстрационная версия</span></footer>
        </>
      ) : <SuccessPage booking={booking} total={total || 0} orderNumber={orderNumber ?? ''} onStartOver={startOver} />}
    </main>
  )
}

function CalendarIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M6.5 3v4M13.5 3v4M3 9h14"/></svg> }
function PinIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 8c0 4.2-6 9-6 9S4 12.2 4 8a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/></svg> }
function CheckIcon() { return <svg viewBox="0 0 18 18" aria-hidden="true"><path d="m4 9 3.2 3.2L14 5.5"/></svg> }

export default App
