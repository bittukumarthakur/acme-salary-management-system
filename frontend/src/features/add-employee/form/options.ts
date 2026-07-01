interface Option {
  value: string
  label: string
}

export const genderOptions: Option[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export const maritalStatusOptions: Option[] = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
]

// Department and employment-type options are shared with the Edit form to keep
// values (which must match the backend enums) and labels consistent.
export {
  departmentOptions,
  employmentTypeOptions,
} from '../../../shared/constants/employeeOptions'
