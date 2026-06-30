import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CurrentBadge } from '../../../../../src/features/view-employees/details/components/CurrentBadge'

describe('CurrentBadge', () => {
  it('renders a badge with "Current" text', () => {
    render(<CurrentBadge />)
    const badge = screen.getByText('Current')
    expect(badge).toBeInTheDocument()
  })

  it('has the correct styling classes applied', () => {
    render(<CurrentBadge />)
    const badge = screen.getByText('Current')
    expect(badge).toHaveClass('MuiTypography-caption')
  })

  it('displays badge as a small pill-shaped element', () => {
    const { container } = render(<CurrentBadge />)
    const badgeBox = container.querySelector('[class*="MuiBox"]')
    expect(badgeBox).toBeInTheDocument()
  })
})
