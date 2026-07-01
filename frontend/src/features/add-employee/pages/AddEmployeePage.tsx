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
import { createEmployee } from '../../employees/services/employeesApi'
import {
  initialFormState,
  type AddEmployeeFormState,
  type FormErrors,
} from '../form/formModel'
import { validateAddEmployeeForm } from '../form/formValidation'
import { PersonalInfoSection } from '../form/components/PersonalInfoSection'
import { WorkInfoSection } from '../form/components/WorkInfoSection'
import { SalaryInfoSection } from '../form/components/SalaryInfoSection'
import { AddEmployeeActions } from '../form/components/AddEmployeeActions'

export function AddEmployeePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<AddEmployeeFormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const setField = <K extends keyof AddEmployeeFormState>(
    key: K,
    value: AddEmployeeFormState[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
    setSubmitError(null)
  }

  const buildCreateEmployeePayload = () => ({
    employee: {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      department: form.department,
      designation: form.designation.trim(),
      joiningDate: form.joiningDate,
      employmentType: form.employmentType,
    },
    salaryStructure: {
      basicSalary: Number(form.basicSalary),
      pfApplicable: form.pfApplicable,
      esiApplicable: form.esiApplicable,
    },
  })

  const onCancel = () => {
    navigate('/employees')
  }

  const onSave = async () => {
    const validationErrors = validateAddEmployeeForm(form, todayIso)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setIsSaving(true)
      const createdEmployee = await createEmployee(buildCreateEmployeePayload())
      navigate(`/employees/${createdEmployee.employeeId}`)
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Failed to create employee')
      }
    } finally {
      setIsSaving(false)
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
