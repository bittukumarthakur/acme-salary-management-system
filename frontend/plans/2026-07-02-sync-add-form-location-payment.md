# Sync Add Employee form with Edit (Country, Currency, Bank Account)

- **Date**: 2026-07-02
- **Status**: completed

## Summary

The Edit Employee form has a "Location & Payment" group (Country, Currency, Bank
Account) that the Add Employee form lacks. Add the same three fields to the Add
form so the two stay in sync, wire Country/Currency into the create payload
(already supported by the backend), and persist the single Bank Account number by
relaxing the backend create contract so only `accountNumber` is required.

## Steps

1. Add `currencyOptions` to the shared employee options; have Edit re-export it.
2. Add `country`, `currency`, `bankAccount` to the Add form state + initial state.
3. New `LocationPaymentSection` (Country text, Currency select, Bank Account text),
   all required — mirroring Edit's `LocationPaymentGroup`.
4. Require the three new fields in Add form validation.
5. Wire the payload: `employee.country`, `salaryStructure.currency`, and a
   single-element `bankAccounts` array (account number only).
6. Backend: make `bankName`/`ifscCode`/`accountHolderName` optional in
   `CreateBankAccountInput` + `parseBankAccounts` (only `accountNumber` required);
   default them in the create service (`accountHolderName` → employee name).
7. Tests: Add page (fields + payload) and backend create (minimal bank account).

## Status Updates

- 2026-07-02: Created
- 2026-07-02: Completed — Add form now has Country/Currency/Bank Account; backend
  create accepts a bank account with only an account number.
