import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { EmployeesPage } from './EmployeesPage'
import { useEmployeesData } from '../hooks/useEmployeesData'

vi.mock('../hooks/useEmployeesData')

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
    background: { default: '#eef2f8', paper: '#ffffff' },
  },
})

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)

const mockUseEmployeesData = vi.mocked(useEmployeesData)

const baseHookResult: ReturnType<typeof useEmployeesData> = {
  state: 'success' as const,
  error: null,
  employees: [
    {
      employeeId: 'EMP00001',
      fullName: 'Jalyn Koch',
      email: 'jalyn.koch.1@acme.com',
      department: 'FINANCE',
      designation: 'MARKETING_MANAGER',
      basicSalary: 1504143,
      currency: 'INR',
      status: 'ACTIVE' as const,
      joiningDate: '2018-05-24',
      employmentType: 'PERMANENT',
      country: 'India',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    },
  ],
  meta: {
    page: 1,
    pageLimit: 10,
    totalRecords: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    currency: 'INR',
    targetCurrency: 'INR',
    conversion: {
      rate: 1,
      convertedAt: '2026-06-28T12:10:47.363Z',
    },
  },
  searchTerm: '',
  department: '',
  status: '',
  setSearchTerm: vi.fn(),
  setDepartment: vi.fn(),
  setStatus: vi.fn(),
  setPage: vi.fn(),
  setPageLimit: vi.fn(),
  retry: vi.fn(),
}

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseEmployeesData.mockReturnValue(baseHookResult)
  })

  it('renders employees table with expected columns and values', () => {
    renderWithTheme(<EmployeesPage />)

    expect(screen.getByText('Employee Details')).toBeInTheDocument()
    expect(screen.getByText('Employee ID')).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Department' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Designation' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Basic Salary' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Actions' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Jalyn Koch')).toBeInTheDocument()
    expect(screen.getByText('EMP00001')).toBeInTheDocument()
  })

  it('shows placeholder feedback when Add Employee is clicked', async () => {
    const user = userEvent.setup()
    const onAddEmployeeClick = vi.fn()
    renderWithTheme(<EmployeesPage onAddEmployeeClick={onAddEmployeeClick} />)

    await user.click(screen.getByRole('button', { name: /add employee/i }))

    expect(onAddEmployeeClick).toHaveBeenCalledTimes(1)
  })

  it('opens row action menu with Edit and View actions', async () => {
    const user = userEvent.setup()
    renderWithTheme(<EmployeesPage />)

    const row = screen.getByRole('row', { name: /jalyn koch/i })
    await user.click(within(row).getByRole('button', { name: /open actions/i }))

    expect(
      await screen.findByRole('menuitem', { name: 'Edit' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'View' })).toBeInTheDocument()
  })

  it('shows empty state when no employees are returned', () => {
    mockUseEmployeesData.mockReturnValue({
      ...baseHookResult,
      employees: [],
      meta: {
        ...baseHookResult.meta,
        totalRecords: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })

    renderWithTheme(<EmployeesPage />)

    expect(screen.getByText('No rows')).toBeInTheDocument()
  })

  it('shows recoverable error state', async () => {
    const retry = vi.fn()
    mockUseEmployeesData.mockReturnValue({
      ...baseHookResult,
      state: 'error',
      error: 'Network error',
      retry,
    })

    const user = userEvent.setup()
    renderWithTheme(<EmployeesPage />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(retry).toHaveBeenCalled()
  })
})
