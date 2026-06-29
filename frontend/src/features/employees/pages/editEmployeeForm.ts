import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type {
  EditableEmployeeStatus,
  EditableEmploymentType,
  EmployeeDetailsResponse,
} from '../types/employees'

dayjs.extend(customParseFormat)

export interface EditEmployeeFormState {
  fullName: string
  employeeId: string
  email: string
  phone: string
  department: string
  designation: string
  employmentType: EditableEmploymentType | ''
  status: EditableEmployeeStatus | ''
  joiningDate: string
  country: string
  currency: string
  bankAccount: string
  baseMonthlySalary: string
  effectiveFrom: string
}

export type EditEmployeeFormErrors = Partial<
  Record<keyof EditEmployeeFormState, string>
>

export type EditEmployeeSetField = <K extends keyof EditEmployeeFormState>(
  field: K,
  value: EditEmployeeFormState[K],
) => void

export const employmentTypeOptions: Array<{
  value: EditableEmploymentType
  label: string
}> = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
]

export const statusOptions: Array<{
  value: EditableEmployeeStatus
  label: string
}> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
]

export const departmentOptions = [
  'Engineering',
  'Marketing',
  'Finance',
  'HR',
  'Sales',
]

export const currencyOptions = ['INR', 'USD']

function parseDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return ''
  }

  const formats = ['YYYY-MM-DD', 'DD MMM YYYY', 'DD MMMM YYYY', 'MM/DD/YYYY']

  for (const format of formats) {
    const parsed = dayjs(value, format, true)
    if (parsed.isValid()) {
      return parsed.format('YYYY-MM-DD')
    }
  }

  const fallback = dayjs(value)
  return fallback.isValid() ? fallback.format('YYYY-MM-DD') : ''
}

function normalizeEmploymentType(value: string | null | undefined) {
  switch ((value || '').toUpperCase().replace(/\s+/g, '_')) {
    case 'FULL_TIME':
    case 'PERMANENT':
      return 'FULL_TIME' as const
    case 'PART_TIME':
      return 'PART_TIME' as const
    case 'CONTRACT':
      return 'CONTRACT' as const
    default:
      return ''
  }
}

function normalizeStatus(value: string | null | undefined) {
  switch ((value || '').toUpperCase()) {
    case 'ACTIVE':
    case 'INACTIVE':
    case 'ON_LEAVE':
      return value?.toUpperCase() as EditableEmployeeStatus
    default:
      return ''
  }
}

export function buildInitialEditEmployeeForm(
  details: EmployeeDetailsResponse,
): EditEmployeeFormState {
  return {
    fullName: details.summary.fullName,
    employeeId: details.summary.employeeId,
    email: details.summary.email,
    phone: details.summary.phone ?? '',
    department: details.summary.department,
    designation: details.summary.designation,
    employmentType: normalizeEmploymentType(details.summary.employmentType),
    status: normalizeStatus(details.summary.status),
    joiningDate: parseDisplayDate(
      details.overview.personalInformation.joiningDate,
    ),
    country: details.summary.country,
    currency: details.summary.currency,
    bankAccount: details.summary.bankAccount ?? '',
    baseMonthlySalary: String(details.salaryStructure.baseSalaryMonthly),
    effectiveFrom: parseDisplayDate(details.salaryStructure.effectiveFrom),
  }
}

const requiredFields: Array<keyof EditEmployeeFormState> = [
  'fullName',
  'email',
  'phone',
  'department',
  'designation',
  'employmentType',
  'status',
  'joiningDate',
  'country',
  'currency',
  'bankAccount',
  'baseMonthlySalary',
  'effectiveFrom',
]

const fieldLabels: Partial<Record<keyof EditEmployeeFormState, string>> = {
  fullName: 'Full Name',
  employmentType: 'Employment Type',
  joiningDate: 'Joining Date',
  bankAccount: 'Bank Account',
  baseMonthlySalary: 'Base Monthly Salary',
  effectiveFrom: 'Effective From',
}

export function validateEditEmployeeForm(
  form: EditEmployeeFormState,
  todayIso: string,
): EditEmployeeFormErrors {
  const nextErrors: EditEmployeeFormErrors = {}

  requiredFields.forEach((field) => {
    if (!String(form[field] || '').trim()) {
      const fieldLabel =
        fieldLabels[field] ??
        field.charAt(0).toUpperCase() +
          field.slice(1).replace(/([A-Z])/g, ' $1')

      nextErrors[field] = `${fieldLabel} is required`
    }
  })

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextErrors.email = 'Enter a valid email address'
  }

  if (form.phone && !/^\+?[0-9 ]{10,15}$/.test(form.phone)) {
    nextErrors.phone = 'Enter a valid phone number'
  }

  if (form.joiningDate && form.joiningDate > todayIso) {
    nextErrors.joiningDate = 'Joining Date cannot be in the future'
  }

  const baseMonthlySalary = Number(form.baseMonthlySalary)
  if (
    form.baseMonthlySalary &&
    (Number.isNaN(baseMonthlySalary) || baseMonthlySalary <= 0)
  ) {
    nextErrors.baseMonthlySalary =
      'Base Monthly Salary must be greater than zero'
  }

  if (
    form.effectiveFrom &&
    form.joiningDate &&
    form.effectiveFrom < form.joiningDate
  ) {
    nextErrors.effectiveFrom =
      'Effective From cannot be earlier than Joining Date'
  }

  return nextErrors
}
