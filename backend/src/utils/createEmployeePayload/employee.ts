import type { CreateEmployeeInput } from '../../models/employee/types';
import {
  VALID_DEPARTMENTS,
  VALID_EMPLOYMENT_TYPES,
  VALID_GENDERS,
  VALID_MARITAL_STATUSES,
  VALID_STATUSES,
} from './constants';
import { isValidDate, fieldReader, type ValidationErrors } from './shared';

export function parseEmployee(
  source: Record<string, unknown>,
  errors: ValidationErrors,
): CreateEmployeeInput {
  const f = fieldReader(source, 'employee', errors);

  const fullName = f.requiredString('fullName');
  const email = f.requiredString('email');
  const phoneNumber = f.requiredString('phoneNumber');
  const dateOfBirth = f.requiredString('dateOfBirth');
  const gender = f.requiredString('gender').toUpperCase();
  const maritalStatus = f.requiredString('maritalStatus').toUpperCase();
  const department = f.requiredString('department').toUpperCase();
  const designation = f.requiredString('designation');
  const joiningDate = f.requiredString('joiningDate');
  const employmentType = f.requiredString('employmentType').toUpperCase();

  const reportingManagerEmployeeId = f.optionalString('reportingManagerEmployeeId');
  const country = f.optionalString('country');
  const status = f.optionalString('status')?.toUpperCase();
  const avatarUrl = f.optionalString('avatarUrl');

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
    employmentType,
    ...(reportingManagerEmployeeId !== undefined ? { reportingManagerEmployeeId } : {}),
    ...(country !== undefined ? { country } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
  };
}
