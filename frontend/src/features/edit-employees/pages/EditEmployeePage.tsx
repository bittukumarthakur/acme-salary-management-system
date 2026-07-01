import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { AddEmployeeActions } from '../../add-employee/form/components/AddEmployeeActions'
import { EditEmployeeBasicInfoSection } from '../components/EditEmployeeBasicInfoSection'
import { EditEmployeeSalarySection } from '../components/EditEmployeeSalarySection'
import { getInitials } from '../../view-employees/details/components/utils'
import {
  buildInitialEditEmployeeForm,
  composePhoneNumber,
  type EditEmployeeFormErrors,
  type EditEmployeeFormState,
  validateEditEmployeeForm,
} from '../form/editEmployeeForm'
import {
  EmployeeApiError,
  fetchEmployeeDetails,
  updateEmployee,
} from '../../employees/services/employeesApi'
import type {
  EditableEmployeeStatus,
  EditableEmploymentType,
  EmployeeDetailsResponse,
  UpdateEmployeePayload,
} from '../../employees/types/employees'

interface EmployeeErrorLike {
  message?: string
  fieldErrors?: Record<string, string>
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      details: EmployeeDetailsResponse
      form: EditEmployeeFormState
    }

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as EmployeeErrorLike).message === 'string'
  ) {
    return (error as EmployeeErrorLike).message as string
  }

  return fallbackMessage
}

function getFieldErrors(error: unknown) {
  if (error instanceof EmployeeApiError) {
    return error.fieldErrors
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'fieldErrors' in error &&
    typeof (error as EmployeeErrorLike).fieldErrors === 'object'
  ) {
    return (error as EmployeeErrorLike).fieldErrors
  }
  return undefined
}

function EditEmployeeLoading() {
  return (
    <Stack spacing={2} aria-label="Loading employee form">
      <Skeleton variant="text" width={220} height={28} />
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={48} />
            <Skeleton variant="rectangular" height={48} />
            <Skeleton variant="rectangular" height={48} />
            <Skeleton variant="rectangular" height={260} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

function EditEmployeeError({ message }: { message: string }) {
  return (
    <Stack spacing={2}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/employees"
        >
          Employees
        </Link>
        <Typography color="text.primary">Edit Employee</Typography>
      </Breadcrumbs>
      <Alert
        severity="error"
        action={
          <Link
            component={RouterLink}
            to="/employees"
            color="inherit"
            underline="hover"
          >
            Go back to Employees
          </Link>
        }
      >
        {message}
      </Alert>
    </Stack>
  )
}

export function EditEmployeePage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [errors, setErrors] = useState<EditEmployeeFormErrors>({})
  const [touched, setTouched] = useState<
    Partial<Record<keyof EditEmployeeFormState, boolean>>
  >({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const requestIdRef = useRef(0)
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    if (!employeeId) {
      return
    }

    const requestId = ++requestIdRef.current

    void fetchEmployeeDetails(employeeId)
      .then((details) => {
        if (requestId !== requestIdRef.current) {
          return
        }

        setLoadState({
          status: 'ready',
          details,
          form: buildInitialEditEmployeeForm(details, todayIso),
        })
      })
      .catch((error) => {
        if (requestId !== requestIdRef.current) {
          return
        }

        setLoadState({
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Failed to load employee',
        })
      })
  }, [employeeId, todayIso])

  if (!employeeId) {
    return <EditEmployeeError message="Employee not found" />
  }

  const handleFieldChange = <K extends keyof EditEmployeeFormState>(
    field: K,
    value: EditEmployeeFormState[K],
  ) => {
    if (loadState.status !== 'ready') {
      return
    }

    const nextForm = { ...loadState.form, [field]: value }
    setLoadState({ ...loadState, form: nextForm })
    setSubmitError(null)

    if (touched[field]) {
      const nextErrors = validateEditEmployeeForm(nextForm, todayIso)
      setErrors((previous) => ({ ...previous, [field]: nextErrors[field] }))
    } else {
      setErrors((previous) => ({ ...previous, [field]: undefined }))
    }
  }

  const handleFieldBlur = (field: keyof EditEmployeeFormState) => {
    if (loadState.status !== 'ready') {
      return
    }

    setTouched((previous) => ({ ...previous, [field]: true }))
    const nextErrors = validateEditEmployeeForm(loadState.form, todayIso)
    setErrors((previous) => ({ ...previous, [field]: nextErrors[field] }))
  }

  const handleCancel = () => {
    if (employeeId) {
      navigate(`/employees/${employeeId}`)
      return
    }

    navigate('/employees')
  }

  const handleSave = async () => {
    if (loadState.status !== 'ready' || !employeeId) {
      return
    }

    const nextErrors = validateEditEmployeeForm(loadState.form, todayIso)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setTouched({
        fullName: true,
        employeeId: true,
        email: true,
        phoneCountryCode: true,
        phoneNumber: true,
        department: true,
        designation: true,
        employmentType: true,
        status: true,
        joiningDate: true,
        country: true,
        currency: true,
        bankAccount: true,
        baseMonthlySalary: true,
        effectiveFrom: true,
        earnings: true,
      })
      return
    }

    const payload: UpdateEmployeePayload = {
      fullName: loadState.form.fullName.trim(),
      email: loadState.form.email.trim(),
      phone: composePhoneNumber(loadState.form),
      ...(loadState.form.dateOfBirth
        ? { dateOfBirth: loadState.form.dateOfBirth }
        : {}),
      ...(loadState.form.gender ? { gender: loadState.form.gender } : {}),
      department: loadState.form.department.trim(),
      designation: loadState.form.designation.trim(),
      employmentType: loadState.form.employmentType as EditableEmploymentType,
      status: loadState.form.status as EditableEmployeeStatus,
      joiningDate: loadState.form.joiningDate,
      country: loadState.form.country.trim(),
      currency: loadState.form.currency.trim(),
      bankAccount: loadState.form.bankAccount.trim(),
      salary: {
        baseMonthlySalary: Number(loadState.form.baseMonthlySalary),
        effectiveFrom: loadState.form.effectiveFrom,
        earnings: Object.entries(loadState.form.earnings).map(
          ([component, amount]) => ({
            component,
            amount: Number(amount),
          }),
        ),
      },
    }

    try {
      setIsSaving(true)
      await updateEmployee(employeeId, payload)
      navigate(`/employees/${employeeId}`, {
        state: { successMessage: 'Employee updated successfully' },
      })
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (fieldErrors) {
        setErrors((previous) => ({ ...previous, ...fieldErrors }))
      }

      setSubmitError(getErrorMessage(error, 'Failed to update employee'))
    } finally {
      setIsSaving(false)
    }
  }

  if (loadState.status === 'loading') {
    return <EditEmployeeLoading />
  }

  if (loadState.status === 'error') {
    return <EditEmployeeError message={loadState.message} />
  }

  const { details, form } = loadState
  const profileInitials = getInitials(form.fullName || details.summary.fullName)
  const profileAvatarUrl =
    details.overview.personalInformation.avatarUrl ?? undefined

  return (
    <Stack
      spacing={2}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        pb: 1,
        pr: 0.5,
        '& > *': {
          flexShrink: 0,
        },
      }}
    >
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/employees"
        >
          Employees
        </Link>
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to={`/employees/${form.employeeId}`}
        >
          View Employee
        </Link>
        <Typography color="text.primary">Edit Employee</Typography>
      </Breadcrumbs>

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <EditEmployeeBasicInfoSection
                form={form}
                errors={errors}
                profileAvatarUrl={profileAvatarUrl}
                profileInitials={profileInitials}
                onFieldBlur={handleFieldBlur}
                onFieldChange={handleFieldChange}
              />
            </LocalizationProvider>
          </Stack>
        </CardContent>
      </Card>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <EditEmployeeSalarySection
          form={form}
          errors={errors}
          salaryStructure={details.salaryStructure}
          onFieldBlur={handleFieldBlur}
          onFieldChange={handleFieldChange}
        />
      </LocalizationProvider>

      <Box sx={{ pt: 1.5 }}>
        <AddEmployeeActions
          isSaving={isSaving}
          onCancel={handleCancel}
          onSave={handleSave}
          saveLabel="Save Changes"
          sticky={false}
        />
      </Box>
    </Stack>
  )
}

export default EditEmployeePage
