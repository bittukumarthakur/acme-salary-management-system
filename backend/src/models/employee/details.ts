export interface EmployeeSummary {
  fullName: string;
  status: string;
  employeeId: string;
  email: string;
  phone: string | null;
  joinedOn: string;
  department: string;
  designation: string;
  employmentType: string;
  country: string;
  currency: string;
  bankAccount: string | null;
}

export interface PersonalInformation {
  fullName: string;
  employeeId: string;
  email: string;
  phone: string | null;
  joiningDate: string;
  country: string;
  employmentType: string;
  status: string;
  avatarUrl: string | null;
}

export interface JobInformation {
  department: string;
  designation: string;
  reportingManager: string | null;
  workLocation: string | null;
}

export interface SalaryLineItem {
  component: string;
  amount: number;
}

export interface SalaryStructure {
  currency: string;
  earnings: SalaryLineItem[];
  deductions: SalaryLineItem[];
  totalEarnings: number;
  totalDeductions: number;
  netPayMonthly: number;
  ctcAnnual: number;
  baseSalaryMonthly: number;
  effectiveFrom: string | null;
}

export interface SalaryHistoryEntry {
  id: string;
  effectiveFrom: string; // ISO date: YYYY-MM-DD
  baseSalaryMonthly: number; // integer value
  netPayMonthly: number; // integer value
  ctcAnnual: number; // integer value
  isCurrent: boolean;
}

export interface EmployeeDetailsResponse {
  summary: EmployeeSummary;
  overview: {
    personalInformation: PersonalInformation;
    jobInformation: JobInformation;
  };
  salaryStructure: SalaryStructure;
  salaryHistory: SalaryHistoryEntry[];
}
