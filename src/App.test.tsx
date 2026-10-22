// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

let uuidCounter = 0

beforeEach(() => {
  uuidCounter = 0
  vi.stubGlobal('crypto', { randomUUID: () => `${String(++uuidCounter).padStart(8, '0')}-0000-4000-8000-000000000000` })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ticket booking flow', () => {
  it('moves focus to the first invalid field after rendering validation errors', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Проверить заказ/ }))

    expect(document.activeElement).toBe(screen.getByLabelText(/Имя и фамилия/))
    expect(screen.getByText('Укажите имя участника.')).toBeTruthy()
    expect(screen.getByText('Укажите email для билетов.')).toBeTruthy()
  })

  it('submits the details form from the keyboard', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/Возраст/))
    await user.keyboard('{Enter}')

    expect(screen.getByText('Укажите имя участника.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText(/Имя и фамилия/))
  })

  it('keeps details, catches removing the adult, and lets the user correct the order', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Имя и фамилия'), 'Маша')
    await user.type(screen.getByLabelText(/Возраст/), '13')
    await user.click(screen.getByRole('button', { name: /Добавить участника/ }))
    const names = screen.getAllByLabelText('Имя и фамилия')
    const ages = screen.getAllByLabelText(/Возраст/)
    await user.type(names[1], 'Иван')
    await user.type(ages[1], '40')
    await user.type(screen.getByLabelText('Email для билетов'), 'family@example.com')
    await user.click(screen.getByRole('button', { name: /Проверить заказ/ }))

    expect(screen.getByText('Маша')).toBeTruthy()
    expect(screen.getByText('Иван')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Изменить' }))
    expect((screen.getAllByLabelText('Имя и фамилия')[0] as HTMLInputElement).value).toBe('Маша')
    expect((screen.getByLabelText('Email для билетов') as HTMLInputElement).value).toBe('family@example.com')
    await user.click(screen.getByRole('button', { name: 'Убрать участника 2' }))
    await user.click(screen.getByRole('button', { name: /Проверить заказ/ }))

    const guardianError = screen.getByText(/добавьте в заказ взрослого от 18 лет/)
    expect(guardianError).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(guardianError))
  })

  it('caps the order at four attendees', async () => {
    const user = userEvent.setup()
    render(<App />)
    const addButton = screen.getByRole('button', { name: /Добавить участника/ })
    await user.click(addButton)
    await user.click(addButton)
    await user.click(addButton)

    expect(screen.getAllByLabelText('Имя и фамилия')).toHaveLength(4)
    expect(screen.queryByRole('button', { name: /Добавить участника/ })).toBeNull()
  })

  it('shows all errors together for four attendees with long names', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Добавить участника/ }))
    await user.click(screen.getByRole('button', { name: /Добавить участника/ }))
    await user.click(screen.getByRole('button', { name: /Добавить участника/ }))
    const longName = 'Александра-Длинная-Фамилия-'.repeat(3)
    for (const input of screen.getAllByLabelText('Имя и фамилия')) fireEvent.change(input, { target: { value: longName } })
    fireEvent.change(screen.getByLabelText('Email для билетов'), { target: { value: 'invalid' } })
    await user.click(screen.getByRole('button', { name: /Проверить заказ/ }))

    expect(screen.getAllByText('Введите целый возраст от 0 до 120 лет.')).toHaveLength(4)
    expect(screen.getByText('Проверьте формат email.')).toBeTruthy()
    expect(screen.getAllByLabelText('Имя и фамилия')).toHaveLength(4)
  })

  it('shows the sold-out result, prevents repeated confirmation, and creates a unique demo success', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Имя и фамилия'), 'Анна Иванова')
    await user.type(screen.getByLabelText(/Возраст/), '35')
    await user.type(screen.getByLabelText('Email для билетов'), 'anna@example.com')
    await user.click(screen.getByRole('button', { name: /Проверить заказ/ }))
    await user.click(screen.getAllByRole('button', { name: /Места закончились/ })[0])
    await user.click(screen.getByRole('button', { name: /Создать демо-заказ/ }))

    expect(screen.getByRole('alert').textContent).toMatch(/свободные места закончились/)
    expect((screen.getByRole('button', { name: /Создать демо-заказ/ }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText('Анна Иванова')).toBeTruthy()

    await user.click(screen.getAllByRole('button', { name: /Места закончились/ })[0])
    await user.click(screen.getByRole('button', { name: /Создать демо-заказ/ }))
    expect(screen.getByText('ДЕМО-ЗАКАЗ СОЗДАН')).toBeTruthy()
    expect(screen.getByText(/Письмо и билет не отправлялись/)).toBeTruthy()
    const firstReference = screen.getByText(/^SQ-2026-/).textContent

    await user.click(screen.getByRole('button', { name: /Начать новый демо-заказ/ }))
    expect((screen.getByLabelText('Имя и фамилия') as HTMLInputElement).value).toBe('')
    expect((screen.getAllByRole('button', { name: /Места закончились/ })[0] as HTMLButtonElement).getAttribute('aria-pressed')).toBe('false')
    await user.type(screen.getByLabelText('Имя и фамилия'), 'Пётр Иванов')
    await user.type(screen.getByLabelText(/Возраст/), '42')
    await user.type(screen.getByLabelText('Email для билетов'), 'petr@example.com')
    await user.click(screen.getByRole('button', { name: /Проверить заказ/ }))
    await user.click(screen.getByRole('button', { name: /Создать демо-заказ/ }))

    const secondReference = screen.getByText(/^SQ-2026-/).textContent
    expect(secondReference).not.toBe(firstReference)
  })

  it('does not allow an invalid email through the details step', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Имя и фамилия'), 'Анна')
    await user.type(screen.getByLabelText(/Возраст/), '30')
    await user.type(screen.getByLabelText('Email для билетов'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /Проверить заказ/ }))

    expect(screen.getByText('Проверьте формат email.')).toBeTruthy()
    expect(screen.queryByText('Всё верно?')).toBeNull()
  })
})
