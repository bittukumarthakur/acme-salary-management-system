import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { FormTextField } from './FormTextField'
import { FormSelect } from './FormSelect'
import { FormDateField } from './FormDateField'
import { FIELD_GRID_SIZES } from './editFormConstants'
import type {
  EditableEmployeeStatus,
  EditableEmploymentType,
} from '../../types/employees'
import {
  departmentOptions,
  employmentTypeOptions,
  statusOptions,
  type EditEmployeeFormErrors,
  type EditEmployeeFormState,
  type EditEmployeeSetField,
} from '../../pages/editEmployeeForm'

interface EmploymentDetailsGroupProps {
  form: EditEmployeeFormState
  errors: EditEmployeeFormErrors
  onFieldChange: EditEmployeeSetField
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
}

export function EmploymentDetailsGroup({
  form,
  errors,
  onFieldChange,
  onFieldBlur,
}: EmploymentDetailsGroupProps) {
  return (
    <>
      <Grid size={FIELD_GRID_SIZES}>
        <FormSelect
          label="Department"
          field="department"
          value={form.department}
          options={departmentOptions}
          error={errors.department}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormTextField
          label="Designation"
          field="designation"
          value={form.designation}
          error={errors.designation}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormControl
          size="small"
          fullWidth
          required
          error={Boolean(errors.employmentType)}
        >
          <InputLabel id="edit-employment-type-label">
            Employment Type
          </InputLabel>
          <Select
            labelId="edit-employment-type-label"
            label="Employment Type"
            value={form.employmentType}
            onChange={(event) =>
              onFieldChange(
                'employmentType',
                event.target.value as EditableEmploymentType,
              )
            }
            onBlur={() => onFieldBlur('employmentType')}
          >
            {employmentTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors.employmentType ? (
            <Typography variant="caption" color="error">
              {errors.employmentType}
            </Typography>
          ) : null}
        </FormControl>
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormControl
          size="small"
          fullWidth
          required
          error={Boolean(errors.status)}
        >
          <InputLabel id="edit-status-label">Status</InputLabel>
          <Select
            labelId="edit-status-label"
            label="Status"
            value={form.status}
            onChange={(event) =>
              onFieldChange(
                'status',
                event.target.value as EditableEmployeeStatus,
              )
            }
            onBlur={() => onFieldBlur('status')}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors.status ? (
            <Typography variant="caption" color="error">
              {errors.status}
            </Typography>
          ) : null}
        </FormControl>
      </Grid>
      <Grid size={FIELD_GRID_SIZES}>
        <FormDateField
          label="Joining Date"
          field="joiningDate"
          value={form.joiningDate}
          error={errors.joiningDate}
          required
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
      </Grid>
    </>
  )
}
