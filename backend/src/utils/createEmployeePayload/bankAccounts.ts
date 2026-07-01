import type { CreateBankAccountInput } from '../../models/employee/types';
import { VALID_ACCOUNT_TYPES } from './constants';
import { asRecord, fieldReader, type ValidationErrors } from './shared';

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

    const f = fieldReader(account, `bankAccounts.${index}`, errors);

    const bankName = f.requiredString('bankName');
    const accountNumber = f.requiredString('accountNumber');
    const ifscCode = f.requiredString('ifscCode');
    const accountHolderName = f.requiredString('accountHolderName');

    const accountType = f.optionalString('accountType')?.toUpperCase();

    if (accountType && !VALID_ACCOUNT_TYPES.includes(accountType)) {
      errors[f.path('accountType')] =
        `bank account type must be one of ${VALID_ACCOUNT_TYPES.join(', ')}`;
    }

    const isPrimary = f.optionalBoolean('isPrimary');
    const isActive = f.optionalBoolean('isActive');

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
