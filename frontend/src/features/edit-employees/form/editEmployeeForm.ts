import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type {
  EditableEmployeeStatus,
  EditableEmploymentType,
  EmployeeDetailsResponse,
} from '../../employees/types/employees'

dayjs.extend(customParseFormat)

export interface EditEmployeeFormState {
  fullName: string
  employeeId: string
  email: string
  phoneCountryCode: string
  phoneNumber: string
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
  earnings: Record<string, string>
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
  { value: 'PERMANENT', label: 'Full Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Part Time' },
  { value: 'INTERN', label: 'Intern' },
]

export const statusOptions: Array<{
  value: EditableEmployeeStatus
  label: string
}> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'TERMINATED', label: 'Terminated' },
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
      return 'PERMANENT' as const
    case 'PART_TIME':
    case 'TEMPORARY':
      return 'TEMPORARY' as const
    case 'CONTRACT':
      return 'CONTRACT' as const
    case 'INTERN':
      return 'INTERN' as const
    default:
      return ''
  }
}

function normalizeStatus(value: string | null | undefined) {
  switch ((value || '').toUpperCase()) {
    case 'ACTIVE':
    case 'INACTIVE':
    case 'ON_LEAVE':
    case 'TERMINATED':
      return value?.toUpperCase() as EditableEmployeeStatus
    default:
      return ''
  }
}

function isBaseSalaryComponent(component: string): boolean {
  return component.toLowerCase().includes('basic salary')
}

function parsePhoneParts(value: string | null | undefined): {
  phoneCountryCode: string
  phoneNumber: string
} {
  const fallback = {
    phoneCountryCode: '+91',
    phoneNumber: '',
  }

  if (!value) {
    return fallback
  }

  const normalized = value.trim()
  if (!normalized) {
    return fallback
  }

  const plusPrefixedMatch = normalized.match(/^(\+\d{1,4})[\s-]*(.*)$/)
  if (plusPrefixedMatch) {
    return {
      phoneCountryCode: plusPrefixedMatch[1],
      phoneNumber: plusPrefixedMatch[2].replace(/\D/g, ''),
    }
  }

  const swappedPlusMatch = normalized.match(/^(\d{1,4})\+\s*(.*)$/)
  if (swappedPlusMatch) {
    return {
      phoneCountryCode: `+${swappedPlusMatch[1]}`,
      phoneNumber: swappedPlusMatch[2].replace(/\D/g, ''),
    }
  }

  const digitsOnly = normalized.replace(/\D/g, '')
  if (!digitsOnly) {
    return fallback
  }

  if (digitsOnly.length > 10) {
    return {
      phoneCountryCode: `+${digitsOnly.slice(0, digitsOnly.length - 10)}`,
      phoneNumber: digitsOnly.slice(-10),
    }
  }

  return {
    phoneCountryCode: '+91',
    phoneNumber: digitsOnly,
  }
}

export function composePhoneNumber(form: EditEmployeeFormState): string {
  return `${form.phoneCountryCode.trim()} ${form.phoneNumber.trim()}`.trim()
}

export function buildInitialEditEmployeeForm(
  details: EmployeeDetailsResponse,
): EditEmployeeFormState {
  const phoneParts = parsePhoneParts(details.summary.phone)

  const earnings = details.salaryStructure.earnings
    .filter((item) => !isBaseSalaryComponent(item.component))
    .reduce<Record<string, string>>((acc, item) => {
      acc[item.component] = String(item.amount)
      return acc
    }, {})

  return {
    fullName: details.summary.fullName,
    employeeId: details.summary.employeeId,
    email: details.summary.email,
    phoneCountryCode: phoneParts.phoneCountryCode,
    phoneNumber: phoneParts.phoneNumber,
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
    earnings,
  }
}

const requiredFields: Array<keyof EditEmployeeFormState> = [
  'fullName',
  'email',
  'phoneCountryCode',
  'phoneNumber',
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
  phoneCountryCode: 'Country Code',
  phoneNumber: 'Phone Number',
  employmentType: 'Employment Type',
  joiningDate: 'Joining Date',
  bankAccount: 'Bank Account',
  baseMonthlySalary: 'Base Monthly Salary',
  effectiveFrom: 'Effective From',
  earnings: 'Earnings',
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

  if (form.phoneCountryCode && !/^\+\d{1,4}$/.test(form.phoneCountryCode)) {
    nextErrors.phoneCountryCode = 'Enter a valid country code (example: +91)'
  }

  if (form.phoneNumber && !/^\d{6,14}$/.test(form.phoneNumber)) {
    nextErrors.phoneNumber = 'Enter a valid phone number'
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

  for (const [component, amount] of Object.entries(form.earnings)) {
    const numericAmount = Number(amount)
    if (!amount.trim() || Number.isNaN(numericAmount) || numericAmount < 0) {
      nextErrors.earnings = `${component} must be a valid non-negative amount`
      break
    }
  }

  return nextErrors
}
