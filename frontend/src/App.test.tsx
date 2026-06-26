import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the home page heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /acme salary management system/i }),
    ).toBeInTheDocument()
  })

  it('renders a setup-complete placeholder message', () => {
    render(<App />)
    expect(screen.getByText(/frontend setup is ready/i)).toBeInTheDocument()
  })
})
