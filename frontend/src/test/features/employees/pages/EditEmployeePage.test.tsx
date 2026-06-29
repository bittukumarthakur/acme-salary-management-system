import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EditEmployeePage } from '../../../../features/employees/pages/EditEmployeePage'
import {
  fetchEmployeeDetails,
  updateEmployee,
} from '../../../../features/employees/services/employeesApi'
import { employeeDetailsFixture } from '../../../data/employeeDetails'

vi.mock('../../../../features/employees/services/employeesApi')

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
    background: { default: '#eef2f8', paper: '#ffffff' },
  },
})

const mockFetchEmployeeDetails = vi.mocked(fetchEmployeeDetails)
const mockUpdateEmployee = vi.mocked(updateEmployee)

function renderEditEmployeePage(initialEntry = '/employees/EMP0001/edit') {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/employees/:employeeId/edit"
            element={<EditEmployeePage />}
          />
          <Route
            path="/employees/:employeeId"
            element={<div>Employee Details Page</div>}
          />
          <Route path="/employees" element={<div>Employees List</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('EditEmployeePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchEmployeeDetails.mockResolvedValue(employeeDetailsFixture)
    mockUpdateEmployee.mockResolvedValue({
      id: 'EMP0001',
      updatedAt: '2026-06-29T10:00:00.000Z',
    })
  })

  it('shows a loading state and then pre-populates the editable form', async () => {
    renderEditEmployeePage()

    expect(screen.getByLabelText(/loading employee form/i)).toBeInTheDocument()

    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /basic information/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /salary information/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText(/employee id/i)).toBeDisabled()
    expect(screen.getByDisplayValue('EMP0001')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.doe@acme.com')).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/base monthly salary/i),
    ).not.toBeInTheDocument()
  })

  it('submits the edited employee and navigates back to employee details on success', async () => {
    const user = userEvent.setup()
    renderEditEmployeePage()

    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/full name/i))
    await user.type(screen.getByLabelText(/full name/i), 'John Doe Updated')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateEmployee).toHaveBeenCalledTimes(1)
    })
    expect(mockUpdateEmployee).toHaveBeenCalledWith(
      'EMP0001',
      expect.objectContaining({
        fullName: 'John Doe Updated',
        email: 'john.doe@acme.com',
        salary: {
          baseMonthlySalary: 60000,
          effectiveFrom: '2024-04-01',
        },
      }),
    )
    expect(await screen.findByText('Employee Details Page')).toBeInTheDocument()
  })

  it('maps server field errors to the form when save returns a conflict', async () => {
    const user = userEvent.setup()
    mockUpdateEmployee.mockRejectedValue({
      message: 'Email already in use by another employee',
      fieldErrors: {
        email: 'Email already in use by another employee',
      },
    })

    renderEditEmployeePage()

    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(
      await screen.findAllByText('Email already in use by another employee'),
    ).not.toHaveLength(0)
  })

  it('shows an employee not found state when the initial load returns 404', async () => {
    mockFetchEmployeeDetails.mockRejectedValue(new Error('Employee not found'))

    renderEditEmployeePage()

    expect(await screen.findByText('Employee not found')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /go back to employees/i }),
    ).toBeInTheDocument()
  })

  it('returns to the employee details page when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderEditEmployeePage()

    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(await screen.findByText('Employee Details Page')).toBeInTheDocument()
  })
})
