/**
 * Organization Master Data
 *
 * Static reference data for all organizational structures:
 * departments, designations, salary components, and bank names.
 * This data is organization-wide and used across all seeding phases.
 */

/**
 * Department master data
 * All departments for the organization
 */
export const DEPARTMENTS = [
  { id: 'DEPT-ENG', name: 'ENGINEERING', description: 'Software and systems engineering team' },
  { id: 'DEPT-MKT', name: 'MARKETING', description: 'Marketing and brand management' },
  { id: 'DEPT-FIN', name: 'FINANCE', description: 'Finance and accounting operations' },
  { id: 'DEPT-HR', name: 'HR', description: 'Human resources and recruitment' },
  { id: 'DEPT-SALES', name: 'SALES', description: 'Sales and business development' },
];

/**
 * Designation master data
 * All job titles and levels
 */
export const DESIGNATIONS = [
  { id: 'DES-SD', title: 'SENIOR_DEVELOPER', description: 'Senior Software Developer', level: 8 },
  { id: 'DES-JD', title: 'JUNIOR_DEVELOPER', description: 'Junior Software Developer', level: 4 },
  { id: 'DES-MM', title: 'MARKETING_MANAGER', description: 'Marketing Manager', level: 7 },
  { id: 'DES-ACC', title: 'ACCOUNTANT', description: 'Accountant', level: 5 },
  { id: 'DES-HR-EX', title: 'HR_EXECUTIVE', description: 'HR Executive', level: 6 },
  { id: 'DES-SALES-EX', title: 'SALES_EXECUTIVE', description: 'Sales Executive', level: 5 },
];

/**
 * Salary component master data
 * All earning, allowance, deduction, and tax components
 */
export const SALARY_COMPONENTS = [
  { id: 'COMP-DA', name: 'DA', type: 'EARNING' as const, calculationType: 'PERCENTAGE' as const, displayOrder: 1 },
  { id: 'COMP-HRA', name: 'HRA', type: 'EARNING' as const, calculationType: 'PERCENTAGE' as const, displayOrder: 2 },
  { id: 'COMP-CONV', name: 'Conveyance', type: 'ALLOWANCE' as const, calculationType: 'FIXED' as const, displayOrder: 3 },
  { id: 'COMP-MEAL', name: 'Meal Allowance', type: 'ALLOWANCE' as const, calculationType: 'FIXED' as const, displayOrder: 4 },
  { id: 'COMP-PF', name: 'PF', type: 'DEDUCTION' as const, calculationType: 'PERCENTAGE' as const, displayOrder: 5 },
  { id: 'COMP-CESS', name: 'Health & Wellness Cess', type: 'TAX' as const, calculationType: 'PERCENTAGE' as const, displayOrder: 6 },
  { id: 'COMP-IT', name: 'IncomeTax', type: 'TAX' as const, calculationType: 'FORMULA' as const, displayOrder: 7 },
];

/**
 * Common Indian bank names
 * Used for generating realistic bank account data
 */
export const BANKS = ['HDFC', 'ICICI', 'AXIS', 'SBI', 'Kotak', 'Yes Bank', 'IDBI', 'BOB'];
