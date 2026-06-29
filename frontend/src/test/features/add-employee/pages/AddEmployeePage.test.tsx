import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AddEmployeePage } from '../../../../features/add-employee/pages/AddEmployeePage'
import { createEmployee } from '../../../../features/employees/services/employeesApi'

vi.mock('../../../../features/employees/services/employeesApi')

const mockCreateEmployee = vi.mocked(createEmployee)

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
    background: { default: '#eef2f8', paper: '#ffffff' },
  },
})

function renderAddEmployeePage() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/employees/add']}>
        <Routes>
          <Route path="/employees/add" element={<AddEmployeePage />} />
          <Route path="/employees" element={<div>Employee List</div>} />
          <Route
            path="/employees/:employeeId"
            element={<div>Employee Details</div>}
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

function setDatePickerValue(name: string, value: string) {
  const input = document.querySelector(
    `input[name="${name}"]`,
  ) as HTMLInputElement | null
  expect(input).not.toBeNull()
  fireEvent.change(input!, { target: { value } })
}

describe('AddEmployeePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateEmployee.mockResolvedValue({
      employeeId: 'EMP00120',
      fullName: 'Ari Example',
      email: 'ari@example.com',
      department: 'ENGINEERING',
      designation: 'Engineer',
      basicSalary: 100000,
      currency: 'INR',
      status: 'ACTIVE',
      joiningDate: '2023-01-11',
      employmentType: 'PERMANENT',
      country: 'India',
    })
  })

  it('renders breadcrumb and all required form sections and fields', () => {
    renderAddEmployeePage()

    expect(screen.getByText('Add Employee')).toBeInTheDocument()
    expect(screen.getByText('Employees')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Work Information' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Salary Information' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/date of birth/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/marital status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/designation/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/joining date/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/reporting manager/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/employment type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/basic salary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/allowances/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bonus/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/deduction/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pf applicable/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/esi applicable/i)).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Save Employee' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('blocks save and shows validation errors for required and invalid fields', async () => {
    const user = userEvent.setup()
    renderAddEmployeePage()

    await user.click(screen.getByRole('button', { name: 'Save Employee' }))

    expect(await screen.findByText('Full Name is required')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/full name/i), 'Ari Example')
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/phone number/i), 'abcd1234')
    await user.type(screen.getByLabelText(/designation/i), 'Engineer')
    await user.type(screen.getByLabelText(/reporting manager/i), 'Chris')
    await user.type(screen.getByLabelText(/basic salary/i), '-100')
    setDatePickerValue('select date of birth', '01/01/2050')
    setDatePickerValue('select joining date', '01/01/2020')

    await user.click(screen.getByRole('button', { name: 'Save Employee' }))

    expect(
      await screen.findByText('Enter a valid email address'),
    ).toBeInTheDocument()
    expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument()
    expect(
      screen.getByText('Basic Salary must be zero or higher'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Date of Birth must be in the past'),
    ).toBeInTheDocument()
  })

  it('creates employee via API and navigates to employee details on save', async () => {
    const user = userEvent.setup()

    renderAddEmployeePage()

    await user.type(screen.getByLabelText(/full name/i), 'Ari Example')
    await user.type(screen.getByLabelText(/email/i), 'ari@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+919999999999')
    setDatePickerValue('select date of birth', '01/10/1993')
    await user.click(screen.getByLabelText(/gender/i))
    await user.click(await screen.findByRole('option', { name: 'Female' }))
    await user.click(screen.getByLabelText(/marital status/i))
    await user.click(await screen.findByRole('option', { name: 'Single' }))
    await user.click(screen.getByLabelText(/department/i))
    await user.click(await screen.findByRole('option', { name: 'Engineering' }))
    await user.type(screen.getByLabelText(/designation/i), 'Engineer')
    setDatePickerValue('select joining date', '01/11/2023')
    await user.type(screen.getByLabelText(/reporting manager/i), 'Chris')
    await user.click(screen.getByLabelText(/employment type/i))
    await user.click(await screen.findByRole('option', { name: 'Permanent' }))
    await user.type(screen.getByLabelText(/basic salary/i), '100000')

    await user.click(screen.getByRole('button', { name: 'Save Employee' }))

    await waitFor(() => {
      expect(mockCreateEmployee).toHaveBeenCalledTimes(1)
    })
    expect(mockCreateEmployee).toHaveBeenCalledWith({
      employee: {
        fullName: 'Ari Example',
        email: 'ari@example.com',
        phoneNumber: '+919999999999',
        dateOfBirth: '1993-01-10',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        department: 'ENGINEERING',
        designation: 'Engineer',
        joiningDate: '2023-01-11',
        reportingManagerEmployeeId: 'Chris',
        employmentType: 'PERMANENT',
      },
      salaryStructure: {
        basicSalary: 100000,
        pfApplicable: false,
        esiApplicable: false,
      },
    })
    expect(await screen.findByText('Employee Details')).toBeInTheDocument()
  })

  it('shows API error and stays on form when create fails', async () => {
    const user = userEvent.setup()
    mockCreateEmployee.mockRejectedValue(new Error('Failed to create employee'))

    renderAddEmployeePage()

    await user.type(screen.getByLabelText(/full name/i), 'Ari Example')
    await user.type(screen.getByLabelText(/email/i), 'ari@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+919999999999')
    setDatePickerValue('select date of birth', '01/10/1993')
    await user.click(screen.getByLabelText(/gender/i))
    await user.click(await screen.findByRole('option', { name: 'Female' }))
    await user.click(screen.getByLabelText(/marital status/i))
    await user.click(await screen.findByRole('option', { name: 'Single' }))
    await user.click(screen.getByLabelText(/department/i))
    await user.click(await screen.findByRole('option', { name: 'Engineering' }))
    await user.type(screen.getByLabelText(/designation/i), 'Engineer')
    setDatePickerValue('select joining date', '01/11/2023')
    await user.type(screen.getByLabelText(/reporting manager/i), 'Chris')
    await user.click(screen.getByLabelText(/employment type/i))
    await user.click(await screen.findByRole('option', { name: 'Permanent' }))
    await user.type(screen.getByLabelText(/basic salary/i), '100000')

    await user.click(screen.getByRole('button', { name: 'Save Employee' }))

    expect(
      await screen.findByText('Failed to create employee'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Employee Details')).not.toBeInTheDocument()
  })

  it('returns to employees list when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderAddEmployeePage()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByText('Employee List')).toBeInTheDocument()
  })
})
