import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EmployeeDetailsPage } from '../../../../../features/view-employees/details/pages/EmployeeDetailsPage'
import { fetchEmployeeDetails } from '../../../../../features/employees/services/employeesApi'
import { employeeDetailsFixture } from '../../../../data/employeeDetails'

vi.mock('../../../../../features/employees/services/employeesApi')

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
    background: { default: '#eef2f8', paper: '#ffffff' },
  },
})

const mockFetchEmployeeDetails = vi.mocked(fetchEmployeeDetails)

function renderEmployeeDetailsPage(initialEntry = '/employees/EMP0001') {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/employees/:employeeId"
            element={<EmployeeDetailsPage />}
          />
          <Route
            path="/employees/:employeeId/edit"
            element={<div>Edit Employee Page</div>}
          />
          <Route path="/employees" element={<div>Employees List</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('EmployeeDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchEmployeeDetails.mockResolvedValue(employeeDetailsFixture)
  })

  it('renders employee profile, overview details, and tab content from the API', async () => {
    const user = userEvent.setup()
    renderEmployeeDetailsPage()

    expect(
      await screen.findByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /edit employee/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /employees/i })).toBeInTheDocument()
    expect(screen.getAllByText('john.doe@acme.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('+91 98765 43210').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Senior Developer').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('heading', { name: /personal information/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /job information/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /salary structure/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Basic Salary')).toBeInTheDocument()
    expect(screen.getByText('Provident Fund (Employee)')).toBeInTheDocument()
    expect(screen.getByText('Rs 71,650')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /salary structure/i }))
    expect(
      screen.getByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/current salary breakdown/i)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /salary history/i }))
    expect(
      screen.getByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/salary revision history/i)).toBeInTheDocument()
    // Check that salary history cards are rendered (using hardcoded data from hook)
    expect(screen.getAllByText('Effective From').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Base Salary (Monthly)').length).toBeGreaterThan(
      0,
    )
  })

  it('shows placeholders for missing optional fields and navigates back from breadcrumb', async () => {
    const user = userEvent.setup()
    mockFetchEmployeeDetails.mockResolvedValue({
      ...employeeDetailsFixture,
      summary: {
        ...employeeDetailsFixture.summary,
        bankAccount: null,
      },
      overview: {
        personalInformation: {
          ...employeeDetailsFixture.overview.personalInformation,
          phone: null,
          avatarUrl: null,
        },
        jobInformation: {
          ...employeeDetailsFixture.overview.jobInformation,
          reportingManager: null,
        },
      },
      salaryHistory: [],
    })

    renderEmployeeDetailsPage()

    expect(await screen.findAllByText('Not available')).not.toHaveLength(0)
    expect(screen.getByText('JD')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /employees/i }))

    expect(await screen.findByText('Employees List')).toBeInTheDocument()
  })

  it('shows a recoverable error state and retries the request', async () => {
    const user = userEvent.setup()
    mockFetchEmployeeDetails
      .mockRejectedValueOnce(new Error('Employee not found'))
      .mockResolvedValueOnce(employeeDetailsFixture)

    renderEmployeeDetailsPage()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Employee not found')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(
      await screen.findByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(mockFetchEmployeeDetails).toHaveBeenCalledTimes(2)
    })
  })

  it('navigates to the edit employee page when edit employee is clicked', async () => {
    const user = userEvent.setup()
    renderEmployeeDetailsPage()

    expect(
      await screen.findByRole('heading', { name: 'John Doe' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /edit employee/i }))

    expect(await screen.findByText('Edit Employee Page')).toBeInTheDocument()
  })
})
