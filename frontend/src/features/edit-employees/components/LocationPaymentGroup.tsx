import { Grid } from '@mui/material'
import { FormTextField } from './FormTextField'
import { FormSelect } from './FormSelect'
import { FIELD_GRID_SIZES } from './editFormConstants'
import {
  currencyOptions,
  type EditEmployeeFormErrors,
  type EditEmployeeFormState,
  type EditEmployeeSetField,
} from '../form/editEmployeeForm'

interface LocationPaymentGroupProps {
  form: EditEmployeeFormState
  errors: EditEmployeeFormErrors
  onFieldChange: EditEmployeeSetField
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
}

export function LocationPaymentGroup({
  form,
  errors,
  onFieldChange,
  onFieldBlur,
}: LocationPaymentGroupProps) {
  return (
    <>
      <Grid size={FIELD_GRID_SIZES}>
        <FormTextField
          label="Country"
          field="country"
          value={form.country}
          error={errors.country}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormSelect
          label="Currency"
          field="currency"
          value={form.currency}
          options={currencyOptions}
          error={errors.currency}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormTextField
          label="Bank Account"
          field="bankAccount"
          value={form.bankAccount}
          error={errors.bankAccount}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
    </>
  )
}
