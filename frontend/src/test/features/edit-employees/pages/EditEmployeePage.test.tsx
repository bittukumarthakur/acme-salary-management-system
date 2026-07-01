import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EditEmployeePage } from '../../../../features/edit-employees/pages/EditEmployeePage'
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

function renderEditEmployeePage(initialEntry = '/employees/EMP00001/edit') {
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
      id: 'EMP00001',
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
      screen.getByRole('heading', { name: /salary information/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/employee id/i)).toBeDisabled()
    expect(screen.getByDisplayValue('EMP00001')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.doe@acme.com')).toBeInTheDocument()
    expect(
      screen.getByLabelText(/base salary \(monthly\)/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: /effective from/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /base salary/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /salary components/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /deductions/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /net pay/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
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
      'EMP00001',
      expect.objectContaining({
        fullName: 'John Doe Updated',
        email: 'john.doe@acme.com',
        phone: '+91 9876543210',
        employmentType: 'PERMANENT',
        salary: {
          baseMonthlySalary: 60000,
          effectiveFrom: new Date().toISOString().slice(0, 10),
          earnings: [
            { component: 'DA (Dearness Allowance)', amount: 12000 },
            { component: 'HRA (House Rent Allowance)', amount: 15000 },
            { component: 'Conveyance Allowance', amount: 1600 },
          ],
        },
      }),
    )
    expect(await screen.findByText('Employee Details Page')).toBeInTheDocument()
  })

  it('saves edited earnings amounts from the salary components section', async () => {
    const user = userEvent.setup()
    renderEditEmployeePage()

    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument()

    const daInput = screen.getByLabelText(/da \(dearness allowance\)/i)
    await user.clear(daInput)
    await user.type(daInput, '14000')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateEmployee).toHaveBeenCalledTimes(1)
    })

    expect(mockUpdateEmployee).toHaveBeenCalledWith(
      'EMP00001',
      expect.objectContaining({
        salary: expect.objectContaining({
          earnings: expect.arrayContaining([
            expect.objectContaining({
              component: 'DA (Dearness Allowance)',
              amount: 14000,
            }),
          ]),
        }),
      }),
    )
  })

  it('updates net pay preview when base salary is edited', async () => {
    const user = userEvent.setup()
    renderEditEmployeePage()

    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: /rs 71,650/i }),
    ).toBeInTheDocument()

    const baseSalaryInput = screen.getByLabelText(/base salary \(monthly\)/i)
    await user.clear(baseSalaryInput)
    await user.type(baseSalaryInput, '65000')

    expect(
      screen.getByRole('heading', { name: /rs 76,050/i }),
    ).toBeInTheDocument()
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
