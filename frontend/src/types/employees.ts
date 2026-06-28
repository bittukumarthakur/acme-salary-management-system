export type EmployeeDepartment =
  | 'ENGINEERING'
  | 'MARKETING'
  | 'FINANCE'
  | 'HR'
  | 'SALES'

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED'

export interface EmployeeListItem {
  employeeId: string
  fullName: string
  email: string
  department: string
  designation: string
  basicSalary: number
  currency: string
  status: EmployeeStatus
  joiningDate: string
  employmentType: string
  country: string
  avatarUrl?: string
}

export interface EmployeesMeta {
  page: number
  pageLimit: number
  totalRecords: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  currency: string
  targetCurrency: string
  conversion: {
    rate: number
    convertedAt: string
  }
}

export interface EmployeesListResponse {
  data: EmployeeListItem[]
  meta: EmployeesMeta
  filters: {
    applied: {
      search: string
      department: string
      status: string
    }
  }
}

export interface CreateEmployeePayload {
  fullName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  employeeId: string
  department: string
  designation: string
  joiningDate: string
  reportingManager: string
  employmentType: string
  basicSalary: number
  allowances?: number
  bonus?: number
  deduction?: number
  pfApplicable: boolean
  esiApplicable: boolean
}

export interface CreateEmployeeResponse {
  employeeId: string
}
