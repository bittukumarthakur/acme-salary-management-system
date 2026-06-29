import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { describe, expect, it, vi } from 'vitest'
import { EditEmployeeBasicInfoSection } from '../../../../../features/employees/components/edit/EditEmployeeBasicInfoSection'
import { buildInitialEditEmployeeForm } from '../../../../../features/employees/pages/editEmployeeForm'
import { employeeDetailsFixture } from '../../../../data/employeeDetails'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0d1f4f' },
    secondary: { main: '#4f6cd9' },
    background: { default: '#eef2f8', paper: '#ffffff' },
  },
})

function renderSection(overrides?: {
  errors?: Record<string, string>
  onFieldBlur?: (field: string) => void
  onFieldChange?: (field: string, value: string) => void
}) {
  const form = buildInitialEditEmployeeForm(employeeDetailsFixture)
  const onFieldBlur = vi.fn()
  const onFieldChange = vi.fn()

  render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <EditEmployeeBasicInfoSection
          form={form}
          errors={overrides?.errors ?? {}}
          profileAvatarUrl={undefined}
          profileInitials="JD"
          onFieldBlur={
            (overrides?.onFieldBlur as typeof onFieldBlur | undefined) ??
            onFieldBlur
          }
          onFieldChange={
            (overrides?.onFieldChange as typeof onFieldChange | undefined) ??
            onFieldChange
          }
        />
      </LocalizationProvider>
    </ThemeProvider>,
  )

  return { form, onFieldBlur, onFieldChange }
}

describe('<EditEmployeeBasicInfoSection />', () => {
  it('renders the profile block and pre-populated basic information fields', async () => {
    const user = userEvent.setup()
    renderSection()

    expect(
      screen.getByRole('heading', { name: /basic information/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByLabelText(/employee id/i)).toBeDisabled()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.doe@acme.com')).toBeInTheDocument()

    const changePhotoButton = screen.getByRole('button', {
      name: /change photo/i,
    })
    expect(changePhotoButton).toBeDisabled()
    expect(screen.getByText(/jpg, png \(max\. 2mb\)/i)).toBeInTheDocument()

    const tooltipTrigger = changePhotoButton.parentElement as HTMLElement | null
    expect(tooltipTrigger).not.toBeNull()
    await user.hover(tooltipTrigger!)

    expect(await screen.findByText(/coming soon/i)).toBeInTheDocument()
  })

  it('calls field change and blur handlers for editable inputs', async () => {
    const { onFieldBlur, onFieldChange } = renderSection()

    const fullNameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(fullNameInput, {
      target: { value: 'John Doe Updated' },
    })
    fireEvent.blur(fullNameInput)

    expect(onFieldChange).toHaveBeenCalledWith('fullName', 'John Doe Updated')
    expect(onFieldBlur).toHaveBeenCalledWith('fullName')
  })

  it('shows provided validation errors inline', () => {
    renderSection({
      errors: {
        fullName: 'Full Name is required',
        department: 'Department is required',
      },
    })

    expect(screen.getByText('Full Name is required')).toBeInTheDocument()
    expect(screen.getByText('Department is required')).toBeInTheDocument()
  })
})
