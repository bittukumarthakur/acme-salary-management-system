import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type {
  AddEmployeeFormState,
  AddEmployeeSetField,
  FormErrors,
} from '../formModel'
import { toPickerValue } from '../dateUtils'
import { departmentOptions, employmentTypeOptions } from '../options'

interface WorkInfoSectionProps {
  form: AddEmployeeFormState
  errors: FormErrors
  setField: AddEmployeeSetField
}

export function WorkInfoSection({
  form,
  errors,
  setField,
}: WorkInfoSectionProps) {
  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Work Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth required error={Boolean(errors.department)}>
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              label="Department"
              value={form.department}
              onChange={(event) => setField('department', event.target.value)}
            >
              <MenuItem value="">Select Department</MenuItem>
              {departmentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.department && (
              <Typography variant="caption" color="error">
                {errors.department}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Designation"
            variant="outlined"
            placeholder="Enter designation"
            value={form.designation}
            onChange={(event) => setField('designation', event.target.value)}
            error={Boolean(errors.designation)}
            helperText={errors.designation}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DatePicker
            label="Joining Date"
            format="MM/DD/YYYY"
            value={toPickerValue(form.joiningDate)}
            onChange={(value) =>
              setField('joiningDate', value ? value.format('YYYY-MM-DD') : '')
            }
            slotProps={{
              textField: {
                name: 'select joining date',
                variant: 'outlined',
                fullWidth: true,
                required: true,
                error: Boolean(errors.joiningDate),
                helperText: errors.joiningDate || 'MM/DD/YYYY',
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Reporting Manager"
            variant="outlined"
            placeholder="Enter reporting manager"
            value={form.reportingManager}
            onChange={(event) =>
              setField('reportingManager', event.target.value)
            }
            error={Boolean(errors.reportingManager)}
            helperText={errors.reportingManager}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl
            fullWidth
            required
            error={Boolean(errors.employmentType)}
          >
            <InputLabel id="employment-type-label">Employment Type</InputLabel>
            <Select
              labelId="employment-type-label"
              label="Employment Type"
              value={form.employmentType}
              onChange={(event) =>
                setField('employmentType', event.target.value)
              }
            >
              <MenuItem value="">Select Employment Type</MenuItem>
              {employmentTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.employmentType && (
              <Typography variant="caption" color="error">
                {errors.employmentType}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  )
}
