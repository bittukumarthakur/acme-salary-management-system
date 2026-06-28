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
  employee: {
    fullName: string
    email: string
    phoneNumber: string
    dateOfBirth: string
    gender: string
    maritalStatus: string
    department: string
    designation: string
    joiningDate: string
    reportingManagerEmployeeId?: string
    employmentType: string
    country?: string
    status?: string
    avatarUrl?: string
  }
  salaryStructure: {
    basicSalary: number
    currency?: string
    effectiveDate?: string
    endDate?: string | null
    pfApplicable?: boolean
    esiApplicable?: boolean
  }
  bankAccounts?: Array<{
    bankName: string
    accountNumber: string
    ifscCode: string
    accountHolderName: string
    accountType?: string
    isPrimary?: boolean
    isActive?: boolean
  }>
}

export type CreateEmployeeResponse = EmployeeListItem
