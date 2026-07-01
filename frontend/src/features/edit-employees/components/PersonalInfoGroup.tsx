import { Grid } from '@mui/material'
import { FormTextField } from './FormTextField'
import { FormSelect } from './FormSelect'
import { FormDateField } from './FormDateField'
import {
  FIELD_GRID_SIZES,
  PHONE_FIELD_GRID,
  PHONE_PLACEHOLDER,
} from './editFormConstants'
import {
  genderOptions,
  type EditEmployeeFormErrors,
  type EditEmployeeFormState,
  type EditEmployeeSetField,
} from '../form/editEmployeeForm'

interface PersonalInfoGroupProps {
  form: EditEmployeeFormState
  errors: EditEmployeeFormErrors
  onFieldChange: EditEmployeeSetField
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
}

export function PersonalInfoGroup({
  form,
  errors,
  onFieldChange,
  onFieldBlur,
}: PersonalInfoGroupProps) {
  return (
    <>
      <Grid size={FIELD_GRID_SIZES}>
        <FormTextField
          label="Full Name"
          field="fullName"
          value={form.fullName}
          error={errors.fullName}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormTextField
          label="Employee ID"
          field="employeeId"
          value={form.employeeId}
          disabled
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormTextField
          label="Email"
          field="email"
          type="email"
          value={form.email}
          error={errors.email}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <Grid container spacing={1.5}>
          <Grid size={PHONE_FIELD_GRID.countryCode}>
            <FormTextField
              label="Code"
              field="phoneCountryCode"
              value={form.phoneCountryCode}
              placeholder={PHONE_PLACEHOLDER.countryCode}
              error={errors.phoneCountryCode}
              required
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
            />
          </Grid>
          <Grid size={PHONE_FIELD_GRID.number}>
            <FormTextField
              label="Phone"
              field="phoneNumber"
              value={form.phoneNumber}
              placeholder={PHONE_PLACEHOLDER.number}
              error={errors.phoneNumber}
              required
              onFieldChange={onFieldChange}
              onFieldBlur={onFieldBlur}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormDateField
          label="Date of Birth"
          field="dateOfBirth"
          value={form.dateOfBirth}
          error={errors.dateOfBirth}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormSelect
          label="Gender"
          field="gender"
          value={form.gender}
          options={genderOptions}
          error={errors.gender}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
    </>
  )
}
