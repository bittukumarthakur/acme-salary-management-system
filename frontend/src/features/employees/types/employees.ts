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

export interface EmployeeSummary {
  fullName: string
  status: EmployeeStatus | string
  employeeId: string
  email: string
  phone: string | null
  joinedOn: string
  department: string
  designation: string
  employmentType: string
  country: string
  currency: string
  bankAccount: string | null
}

export interface PersonalInformation {
  fullName: string
  employeeId: string
  email: string
  phone: string | null
  joiningDate: string
  country: string
  employmentType: string
  status: EmployeeStatus | string
  avatarUrl: string | null
}

export interface JobInformation {
  department: string
  designation: string
  reportingManager: string | null
  workLocation: string | null
}

export interface SalaryLineItem {
  component: string
  amount: number
}

export interface SalaryStructure {
  currency: string
  earnings: SalaryLineItem[]
  deductions: SalaryLineItem[]
  totalEarnings: number
  totalDeductions: number
  netPayMonthly: number
  ctcAnnual: number
  baseSalaryMonthly: number
  effectiveFrom: string | null
}

export interface SalaryHistoryEntry {
  effectiveFrom: string | null
  currency: string
  baseSalaryMonthly: number
  netPayMonthly: number
  ctcAnnual: number
  totalEarnings: number
  totalDeductions: number
  changeSummary?: string | null
}

export interface EmployeeDetailsResponse {
  summary: EmployeeSummary
  overview: {
    personalInformation: PersonalInformation
    jobInformation: JobInformation
  }
  salaryStructure: SalaryStructure
  salaryHistory?: SalaryHistoryEntry[]
}

export type EditableEmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'

export type EditableEmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'

export interface UpdateEmployeePayload {
  fullName: string
  email: string
  phone: string
  department: string
  designation: string
  employmentType: EditableEmploymentType
  status: EditableEmployeeStatus
  joiningDate: string
  country: string
  currency: string
  bankAccount: string
  salary: {
    baseMonthlySalary: number
    effectiveFrom: string
  }
}

export interface UpdateEmployeeResponse {
  id: string
  updatedAt: string
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
