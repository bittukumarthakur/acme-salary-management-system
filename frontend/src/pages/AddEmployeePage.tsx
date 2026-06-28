import { useMemo, useState } from 'react'
import {
  Alert,
  Breadcrumbs,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { isEmployeeIdAvailable } from '../services/employeesApi'
import {
  initialFormState,
  type AddEmployeeFormState,
  type FormErrors,
} from './addEmployee/formModel'
import { validateAddEmployeeForm } from './addEmployee/formValidation'
import { PersonalInfoSection } from './addEmployee/components/PersonalInfoSection'
import { WorkInfoSection } from './addEmployee/components/WorkInfoSection'
import { SalaryInfoSection } from './addEmployee/components/SalaryInfoSection'
import { AddEmployeeActions } from './addEmployee/components/AddEmployeeActions'

export function AddEmployeePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<AddEmployeeFormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveInfoMessage, setSaveInfoMessage] = useState<string | null>(null)
  const [isSaving] = useState(false)

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const setField = <K extends keyof AddEmployeeFormState>(
    key: K,
    value: AddEmployeeFormState[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
    setSubmitError(null)
  }

  const onCancel = () => {
    navigate('/employees')
  }

  const onSave = async () => {
    setSaveInfoMessage("We're working on this feature. Please come back soon.")

    const validationErrors = validateAddEmployeeForm(form, todayIso)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const employeeIdAvailable = await isEmployeeIdAvailable(form.employeeId)
    if (!employeeIdAvailable) {
      setErrors((previous) => ({
        ...previous,
        employeeId: 'Employee ID must be unique',
      }))
    }
  }

  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: 1 }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/employees"
        >
          Employees
        </Link>
        <Typography color="text.primary">Add Employee</Typography>
      </Breadcrumbs>

      {submitError && <Alert severity="error">{submitError}</Alert>}
      {saveInfoMessage && <Alert severity="info">{saveInfoMessage}</Alert>}

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <PersonalInfoSection
                form={form}
                errors={errors}
                setField={setField}
              />
              <WorkInfoSection
                form={form}
                errors={errors}
                setField={setField}
              />
              <SalaryInfoSection
                form={form}
                errors={errors}
                setField={setField}
              />
            </Stack>
          </CardContent>
        </Card>
      </LocalizationProvider>

      <AddEmployeeActions
        isSaving={isSaving}
        onCancel={onCancel}
        onSave={onSave}
      />
    </Stack>
  )
}

export default AddEmployeePage
