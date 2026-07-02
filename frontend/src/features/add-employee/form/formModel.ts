export interface AddEmployeeFormState {
  fullName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  gender: string
  department: string
  designation: string
  joiningDate: string
  employmentType: string
  basicSalary: string
  allowances: string
  pfApplicable: boolean
  esiApplicable: boolean
  country: string
  currency: string
  bankAccount: string
}

export type FormErrors = Partial<Record<keyof AddEmployeeFormState, string>>

export type AddEmployeeSetField = <K extends keyof AddEmployeeFormState>(
  key: K,
  value: AddEmployeeFormState[K],
) => void

export const initialFormState: AddEmployeeFormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  department: '',
  designation: '',
  joiningDate: '',
  employmentType: '',
  basicSalary: '',
  allowances: '',
  pfApplicable: false,
  esiApplicable: false,
  country: '',
  currency: '',
  bankAccount: '',
}
