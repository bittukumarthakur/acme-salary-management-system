import type { CreateEmployeeInput } from '../../models/employee/types';
import {
  VALID_DEPARTMENTS,
  VALID_EMPLOYMENT_TYPES,
  VALID_GENDERS,
  VALID_MARITAL_STATUSES,
  VALID_STATUSES,
} from './constants';
import {
  isValidDate,
  readOptionalString,
  readRequiredString,
  type ValidationErrors,
} from './shared';

export function parseEmployee(
  source: Record<string, unknown>,
  errors: ValidationErrors,
): CreateEmployeeInput {
  const fullName = readRequiredString(source, 'fullName', 'employee.fullName', errors);
  const email = readRequiredString(source, 'email', 'employee.email', errors);
  const phoneNumber = readRequiredString(source, 'phoneNumber', 'employee.phoneNumber', errors);
  const dateOfBirth = readRequiredString(source, 'dateOfBirth', 'employee.dateOfBirth', errors);
  const gender = readRequiredString(source, 'gender', 'employee.gender', errors).toUpperCase();
  const maritalStatus = readRequiredString(
    source,
    'maritalStatus',
    'employee.maritalStatus',
    errors,
  ).toUpperCase();
  const department = readRequiredString(
    source,
    'department',
    'employee.department',
    errors,
  ).toUpperCase();
  const designation = readRequiredString(source, 'designation', 'employee.designation', errors);
  const joiningDate = readRequiredString(source, 'joiningDate', 'employee.joiningDate', errors);
  const employmentType = readRequiredString(
    source,
    'employmentType',
    'employee.employmentType',
    errors,
  ).toUpperCase();

  const reportingManagerEmployeeId = readOptionalString(
    source,
    'reportingManagerEmployeeId',
    'employee.reportingManagerEmployeeId',
    errors,
  );
  const country = readOptionalString(source, 'country', 'employee.country', errors);
  const status = readOptionalString(source, 'status', 'employee.status', errors)?.toUpperCase();
  const avatarUrl = readOptionalString(source, 'avatarUrl', 'employee.avatarUrl', errors);

  if ('employeeId' in source) {
    errors['employee.employeeId'] =
      'employee.employeeId must not be provided; it is generated automatically';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors['employee.email'] = 'employee.email must be a valid email address';
  }

  if (phoneNumber && !/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
    errors['employee.phoneNumber'] = 'employee.phoneNumber must be a valid phone number';
  }

  if (gender && !VALID_GENDERS.includes(gender)) {
    errors['employee.gender'] = `employee.gender must be one of ${VALID_GENDERS.join(', ')}`;
  }

  if (maritalStatus && !VALID_MARITAL_STATUSES.includes(maritalStatus)) {
    errors['employee.maritalStatus'] =
      `employee.maritalStatus must be one of ${VALID_MARITAL_STATUSES.join(', ')}`;
  }

  if (department && !VALID_DEPARTMENTS.includes(department)) {
    errors['employee.department'] =
      `employee.department must be one of ${VALID_DEPARTMENTS.join(', ')}`;
  }

  if (employmentType && !VALID_EMPLOYMENT_TYPES.includes(employmentType)) {
    errors['employee.employmentType'] =
      `employee.employmentType must be one of ${VALID_EMPLOYMENT_TYPES.join(', ')}`;
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors['employee.status'] = `employee.status must be one of ${VALID_STATUSES.join(', ')}`;
  }

  if (dateOfBirth && !isValidDate(dateOfBirth)) {
    errors['employee.dateOfBirth'] = 'employee.dateOfBirth must be a valid date';
  }

  if (joiningDate && !isValidDate(joiningDate)) {
    errors['employee.joiningDate'] = 'employee.joiningDate must be a valid date';
  }

  const dateOfBirthValue = new Date(dateOfBirth);
  const joiningDateValue = new Date(joiningDate);

  if (!errors['employee.dateOfBirth'] && dateOfBirthValue >= new Date()) {
    errors['employee.dateOfBirth'] = 'employee.dateOfBirth must be in the past';
  }

  if (!errors['employee.joiningDate'] && joiningDateValue > new Date()) {
    errors['employee.joiningDate'] = 'employee.joiningDate cannot be in the future';
  }

  if (
    !errors['employee.dateOfBirth'] &&
    !errors['employee.joiningDate'] &&
    joiningDateValue <= dateOfBirthValue
  ) {
    errors['employee.joiningDate'] = 'employee.joiningDate must be after employee.dateOfBirth';
  }

  return {
    fullName,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    maritalStatus,
    department,
    designation,
    joiningDate,
    reportingManagerEmployeeId,
    employmentType,
    country,
    status,
    avatarUrl,
  };
}
