/**
 * Shared domain errors thrown by services and mapped to HTTP responses by the
 * route error handler (see utils/routeErrorHandler).
 */

/**
 * Error thrown when employee is not found.
 */
export class EmployeeNotFoundError extends Error {
  constructor(id: string | number) {
    super(`Employee ${id} not found`);
    this.name = 'EmployeeNotFoundError';
  }
}

/**
 * Error thrown when email is already in use by another employee.
 */
export class EmailAlreadyInUseError extends Error {
  constructor(email: string) {
    super(`Email ${email} is already in use by another employee`);
    this.name = 'EmailAlreadyInUseError';
  }
}

/**
 * Error thrown when a salary record with the same effectiveFrom already exists.
 */
export class DuplicateSalaryDateError extends Error {
  constructor(effectiveFrom: string) {
    super(`A salary record with effectiveFrom ${effectiveFrom} already exists`);
    this.name = 'DuplicateSalaryDateError';
  }
}
