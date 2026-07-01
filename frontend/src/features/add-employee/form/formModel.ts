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
  bonus: string
  deduction: string
  pfApplicable: boolean
  esiApplicable: boolean
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
  bonus: '',
  deduction: '',
  pfApplicable: false,
  esiApplicable: false,
}
