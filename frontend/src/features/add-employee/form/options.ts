interface Option {
  value: string
  label: string
}

export const genderOptions: Option[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

// Department, employment-type and currency options are shared with the Edit form
// to keep values (which must match the backend enums) and labels consistent.
export {
  departmentOptions,
  employmentTypeOptions,
  currencyOptions,
} from '../../../shared/constants/employeeOptions'
