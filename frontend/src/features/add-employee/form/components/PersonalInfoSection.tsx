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
import { genderOptions, maritalStatusOptions } from '../options'

interface PersonalInfoSectionProps {
  form: AddEmployeeFormState
  errors: FormErrors
  setField: AddEmployeeSetField
}

export function PersonalInfoSection({
  form,
  errors,
  setField,
}: PersonalInfoSectionProps) {
  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Personal Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Full Name"
            variant="outlined"
            placeholder="Enter full name"
            value={form.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Phone Number"
            variant="outlined"
            placeholder="Enter phone number"
            value={form.phoneNumber}
            onChange={(event) => setField('phoneNumber', event.target.value)}
            error={Boolean(errors.phoneNumber)}
            helperText={errors.phoneNumber}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DatePicker
            label="Date of Birth"
            format="MM/DD/YYYY"
            value={toPickerValue(form.dateOfBirth)}
            onChange={(value) =>
              setField('dateOfBirth', value ? value.format('YYYY-MM-DD') : '')
            }
            slotProps={{
              textField: {
                name: 'select date of birth',
                variant: 'outlined',
                fullWidth: true,
                required: true,
                error: Boolean(errors.dateOfBirth),
                helperText: errors.dateOfBirth,
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth required error={Boolean(errors.gender)}>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              label="Gender"
              value={form.gender}
              onChange={(event) => setField('gender', event.target.value)}
            >
              <MenuItem value="">Select Gender</MenuItem>
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.gender && (
              <Typography variant="caption" color="error">
                {errors.gender}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth required error={Boolean(errors.maritalStatus)}>
            <InputLabel id="marital-status-label">Marital Status</InputLabel>
            <Select
              labelId="marital-status-label"
              label="Marital Status"
              value={form.maritalStatus}
              onChange={(event) =>
                setField('maritalStatus', event.target.value)
              }
            >
              <MenuItem value="">Select Status</MenuItem>
              {maritalStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.maritalStatus && (
              <Typography variant="caption" color="error">
                {errors.maritalStatus}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  )
}
