import type { AddEmployeeFormState, FormErrors } from './formModel'

const requiredFields: Array<keyof AddEmployeeFormState> = [
  'fullName',
  'email',
  'phoneNumber',
  'dateOfBirth',
  'gender',
  'department',
  'designation',
  'joiningDate',
  'employmentType',
  'basicSalary',
]

const fieldLabels: Partial<Record<keyof AddEmployeeFormState, string>> = {
  fullName: 'Full Name',
  phoneNumber: 'Phone Number',
  dateOfBirth: 'Date of Birth',
  joiningDate: 'Joining Date',
  employmentType: 'Employment Type',
  basicSalary: 'Basic Salary',
}

export function validateAddEmployeeForm(
  form: AddEmployeeFormState,
  todayIso: string,
): FormErrors {
  const nextErrors: FormErrors = {}

  requiredFields.forEach((field) => {
    const value = form[field]
    if (typeof value === 'string' && !value.trim()) {
      const fieldLabel =
        fieldLabels[field] ?? field.charAt(0).toUpperCase() + field.slice(1)

      nextErrors[field] = `${fieldLabel} is required`
    }
  })

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextErrors.email = 'Enter a valid email address'
  }

  if (form.phoneNumber && !/^\+?[0-9]{10,15}$/.test(form.phoneNumber)) {
    nextErrors.phoneNumber = 'Enter a valid phone number'
  }

  const salaryValue = Number(form.basicSalary)
  if (form.basicSalary && (Number.isNaN(salaryValue) || salaryValue < 0)) {
    nextErrors.basicSalary = 'Basic Salary must be zero or higher'
  }

  if (form.allowances.trim()) {
    const allowancesValue = Number(form.allowances)
    if (Number.isNaN(allowancesValue) || allowancesValue < 0) {
      nextErrors.allowances = 'Allowances must be zero or higher'
    }
  }

  if (form.dateOfBirth && form.dateOfBirth >= todayIso) {
    nextErrors.dateOfBirth = 'Date of Birth must be in the past'
  }

  if (form.joiningDate && form.joiningDate > todayIso) {
    nextErrors.joiningDate = 'Joining Date cannot be in the future'
  }

  if (
    form.dateOfBirth &&
    form.joiningDate &&
    form.joiningDate <= form.dateOfBirth
  ) {
    nextErrors.joiningDate = 'Joining Date must be after Date of Birth'
  }

  return nextErrors
}
