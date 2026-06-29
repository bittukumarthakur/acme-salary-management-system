/**
 * Employee domain model.
 *
 * This is the application's own contract for an employee and the shape returned
 * by the API. It is intentionally decoupled from the Prisma-generated model
 * (which lives in the git-ignored `generated/prisma` folder) so the public API
 * shape stays stable and independent of the ORM.
 *
 * Unified interface supporting all API versions with full employee details
 * including salary and avatar information.
 */
export interface Employee {
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string; // Optional phone number
  department: string;
  designation: string;
  basicSalary: number;
  currency: string;
  status: string;
  joiningDate: string;
  country: string;
  employmentType: string;
  avatarUrl?: string | undefined;
}

/**
 * Shape of a raw employee database row consumed by the service mapper.
 * Includes related objects from Department and Designation tables (Phase 1).
 * Only the fields the mapper reads are declared.
 */
export type EmployeeRow = {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  country: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
  } | null;
  designationId: string;
  designation: {
    id: string;
    title: string;
  } | null;
  employmentType: string;
  joiningDate: Date;
  status: string;
  basicSalary: number;
  currency: string;
  avatarUrl: string | null;
};
