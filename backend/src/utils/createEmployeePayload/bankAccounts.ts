import type { CreateBankAccountInput } from '../../models/employee/types';
import { VALID_ACCOUNT_TYPES } from './constants';
import {
  asRecord,
  readOptionalBoolean,
  readOptionalString,
  readRequiredString,
  type ValidationErrors,
} from './shared';

export function parseBankAccounts(
  raw: unknown,
  errors: ValidationErrors,
): CreateBankAccountInput[] | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (!Array.isArray(raw)) {
    errors.bankAccounts = 'bankAccounts must be an array';
    return undefined;
  }

  const accounts: CreateBankAccountInput[] = [];

  raw.forEach((item, index) => {
    const account = asRecord(item);
    if (!account) {
      errors[`bankAccounts.${index}`] = 'bank account must be an object';
      return;
    }

    const bankName = readRequiredString(
      account,
      'bankName',
      `bankAccounts.${index}.bankName`,
      errors,
    );
    const accountNumber = readRequiredString(
      account,
      'accountNumber',
      `bankAccounts.${index}.accountNumber`,
      errors,
    );
    const ifscCode = readRequiredString(
      account,
      'ifscCode',
      `bankAccounts.${index}.ifscCode`,
      errors,
    );
    const accountHolderName = readRequiredString(
      account,
      'accountHolderName',
      `bankAccounts.${index}.accountHolderName`,
      errors,
    );

    const accountType = readOptionalString(
      account,
      'accountType',
      `bankAccounts.${index}.accountType`,
      errors,
    )?.toUpperCase();

    if (accountType && !VALID_ACCOUNT_TYPES.includes(accountType)) {
      errors[`bankAccounts.${index}.accountType`] =
        `bank account type must be one of ${VALID_ACCOUNT_TYPES.join(', ')}`;
    }

    const isPrimary = readOptionalBoolean(
      account,
      'isPrimary',
      `bankAccounts.${index}.isPrimary`,
      errors,
    );
    const isActive = readOptionalBoolean(
      account,
      'isActive',
      `bankAccounts.${index}.isActive`,
      errors,
    );

    accounts.push({
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      ...(accountType !== undefined ? { accountType } : {}),
      ...(isPrimary !== undefined ? { isPrimary } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    });
  });

  return accounts;
}
