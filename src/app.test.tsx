import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import App from './app'

test('renders without crashing', () => {
  render(<App />)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('renders initial code', async () => {
  render(<App initialCode="<h1>Hello world</h1>" />)
  expect(await screen.findByRole('heading')).toHaveTextContent('Hello world')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('updates when user types', async () => {
  render(<App />)
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  userEvent.type(await screen.findByRole('textbox'), '<h1>Hello world</h1>')
  expect(await screen.findByRole('heading')).toHaveTextContent('Hello world')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('handles parsing error', async () => {
  render(<App initialCode="<h1>Hello world</h1" />)
  expect(await screen.findByRole('alert')).toHaveTextContent(/error/i)
})

test('handles runtime error', async () => {
  render(<App initialCode="<h1 style={{ foo }}>Hello world</h1>" />)
  expect(await screen.findByRole('alert')).toHaveTextContent(/error/i)
})
