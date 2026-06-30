import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material'
import { describe, expect, it, vi } from 'vitest'
import { OverviewTabPanel } from '../../../../../features/view-employees/details/components/OverviewTabPanel'
import { employeeDetailsFixture } from '../../../../data/employeeDetails'

const salaryBreakdownSectionSpy = vi.fn()

vi.mock(
  '../../../../../features/view-employees/details/components/SalaryBreakdownSection',
  () => ({
    SalaryBreakdownSection: (props: unknown) => {
      salaryBreakdownSectionSpy(props)
      return <div data-testid="salary-breakdown-section" />
    },
  }),
)

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

describe('OverviewTabPanel', () => {
  it('renders the overview salary section without extra container padding', () => {
    render(
      <ThemeProvider theme={theme}>
        <OverviewTabPanel details={employeeDetailsFixture} />
      </ThemeProvider>,
    )

    expect(
      screen.getByRole('heading', { name: /personal information/i }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('salary-breakdown-section')).toBeInTheDocument()
    expect(salaryBreakdownSectionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        salaryStructure: employeeDetailsFixture.salaryStructure,
        title: 'Salary Structure (Monthly)',
        disableContainerPadding: true,
      }),
    )
  })
})
