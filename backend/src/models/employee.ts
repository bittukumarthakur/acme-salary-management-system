/**
 * Employee domain model.
 *
 * This is the application's own contract for an employee and the shape returned
 * by the API. It is intentionally decoupled from the Prisma-generated model
 * (which lives in the git-ignored `generated/prisma` folder) so the public API
 * shape stays stable and independent of the ORM.
 */
export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  country: string;
  department: string;
  designation: string;
  employmentType: string;
  joiningDate: string;
  status: string;
}

/**
 * Shape of a raw employee database row consumed by the service mapper.
 * Only the fields the mapper reads are declared.
 */
export type EmployeeRow = {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  country: string;
  department: string;
  designation: string;
  employmentType: string;
  joiningDate: Date;
  status: string;
};
