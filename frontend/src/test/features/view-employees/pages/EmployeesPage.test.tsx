import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EmployeesPage } from '../../../../features/view-employees/pages/EmployeesPage'
import { useEmployeesData } from '../../../../features/view-employees/hooks/useEmployeesData'

vi.mock('../../../../features/view-employees/hooks/useEmployeesData')

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
    background: { default: '#eef2f8', paper: '#ffffff' },
  },
})

const renderWithTheme = (initialEntry = '/employees') =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/add" element={<div>Add Employee Page</div>} />
          <Route
            path="/employees/:employeeId"
            element={<div>Employee Details Page</div>}
          />
          <Route
            path="/employees/:employeeId/edit"
            element={<div>Edit Employee Page</div>}
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )

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
    renderWithTheme()

    expect(screen.getByText('Employee Details')).toBeInTheDocument()
    expect(screen.getByText('Employee ID')).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Actions' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Jalyn Koch')).toBeInTheDocument()
    expect(screen.getByText('EMP00001')).toBeInTheDocument()
  })

  it('navigates to add employee page when Add Employee is clicked', async () => {
    renderWithTheme()

    fireEvent.click(screen.getByRole('button', { name: /add employee/i }))

    expect(await screen.findByText('Add Employee Page')).toBeInTheDocument()
  })

  it('navigates to employee details page when View action is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme()

    const row = screen.getByRole('row', { name: /jalyn koch/i })
    await user.click(within(row).getByRole('button', { name: /open actions/i }))
    await user.click(await screen.findByRole('menuitem', { name: 'View' }))

    expect(await screen.findByText('Employee Details Page')).toBeInTheDocument()
  })

  it('navigates to edit employee page when Edit action is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme()

    const row = screen.getByRole('row', { name: /jalyn koch/i })
    await user.click(within(row).getByRole('button', { name: /open actions/i }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(await screen.findByText('Edit Employee Page')).toBeInTheDocument()
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

    renderWithTheme()

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
    renderWithTheme()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(retry).toHaveBeenCalled()
  })
})
