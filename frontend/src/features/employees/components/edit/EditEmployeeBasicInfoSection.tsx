import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined'
import {
  Avatar,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type {
  EditableEmployeeStatus,
  EditableEmploymentType,
} from '../../types/employees'
import {
  currencyOptions,
  departmentOptions,
  employmentTypeOptions,
  type EditEmployeeFormErrors,
  type EditEmployeeFormState,
  type EditEmployeeSetField,
  statusOptions,
} from '../../pages/editEmployeeForm'

interface EditEmployeeBasicInfoSectionProps {
  form: EditEmployeeFormState
  errors: EditEmployeeFormErrors
  profileAvatarUrl?: string
  profileInitials: string
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
  onFieldChange: EditEmployeeSetField
}

export function EditEmployeeBasicInfoSection({
  form,
  errors,
  profileAvatarUrl,
  profileInitials,
  onFieldBlur,
  onFieldChange,
}: EditEmployeeBasicInfoSectionProps) {
  return (
    <Box component="section">
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid
          size={{ xs: 12, lg: 2.5 }}
          sx={{ display: 'flex', justifyContent: 'center' }}
        >
          <Stack
            spacing={1.5}
            sx={{ alignItems: 'center', width: '100%', pt: { xs: 0, md: 1 } }}
          >
            <Avatar
              src={profileAvatarUrl}
              alt={form.fullName}
              sx={{
                width: { xs: 112, md: 144 },
                height: { xs: 112, md: 144 },
                fontSize: { xs: 34, md: 42 },
                bgcolor: 'primary.main',
                boxShadow: '0 12px 24px rgba(13, 31, 79, 0.14)',
              }}
            >
              {profileInitials}
            </Avatar>
            <Tooltip title="Coming soon" arrow>
              <span>
                <Button
                  variant="outlined"
                  disabled
                  startIcon={<UploadOutlinedIcon />}
                  sx={{ minWidth: 208 }}
                >
                  Change Photo
                </Button>
              </span>
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG (Max. 2MB)
            </Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 9.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <TextField
                label="Full Name"
                size="small"
                value={form.fullName}
                onChange={(event) =>
                  onFieldChange('fullName', event.target.value)
                }
                onBlur={() => onFieldBlur('fullName')}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <TextField
                label="Employee ID"
                size="small"
                value={form.employeeId}
                disabled
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <TextField
                label="Email"
                type="email"
                size="small"
                value={form.email}
                onChange={(event) => onFieldChange('email', event.target.value)}
                onBlur={() => onFieldBlur('email')}
                error={Boolean(errors.email)}
                helperText={errors.email}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    label="Code"
                    size="small"
                    placeholder="+91"
                    value={form.phoneCountryCode}
                    onChange={(event) =>
                      onFieldChange('phoneCountryCode', event.target.value)
                    }
                    onBlur={() => onFieldBlur('phoneCountryCode')}
                    error={Boolean(errors.phoneCountryCode)}
                    helperText={errors.phoneCountryCode}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField
                    label="Phone"
                    size="small"
                    placeholder="7485855955"
                    value={form.phoneNumber}
                    onChange={(event) =>
                      onFieldChange('phoneNumber', event.target.value)
                    }
                    onBlur={() => onFieldBlur('phoneNumber')}
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <FormControl
                size="small"
                fullWidth
                required
                error={Boolean(errors.department)}
              >
                <InputLabel id="edit-department-label">Department</InputLabel>
                <Select
                  labelId="edit-department-label"
                  label="Department"
                  value={form.department}
                  onChange={(event) =>
                    onFieldChange('department', event.target.value)
                  }
                  onBlur={() => onFieldBlur('department')}
                >
                  {departmentOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department ? (
                  <Typography variant="caption" color="error">
                    {errors.department}
                  </Typography>
                ) : null}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <TextField
                label="Designation"
                size="small"
                value={form.designation}
                onChange={(event) =>
                  onFieldChange('designation', event.target.value)
                }
                onBlur={() => onFieldBlur('designation')}
                error={Boolean(errors.designation)}
                helperText={errors.designation}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
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
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
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
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DatePicker
                label="Joining Date"
                format="MM/DD/YYYY"
                value={form.joiningDate ? dayjs(form.joiningDate) : null}
                onChange={(value) =>
                  onFieldChange(
                    'joiningDate',
                    value ? value.format('YYYY-MM-DD') : '',
                  )
                }
                slotProps={{
                  textField: {
                    name: 'select joining date',
                    size: 'small',
                    fullWidth: true,
                    required: true,
                    onBlur: () => onFieldBlur('joiningDate'),
                    error: Boolean(errors.joiningDate),
                    helperText: errors.joiningDate,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <TextField
                label="Country"
                size="small"
                value={form.country}
                onChange={(event) =>
                  onFieldChange('country', event.target.value)
                }
                onBlur={() => onFieldBlur('country')}
                error={Boolean(errors.country)}
                helperText={errors.country}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <FormControl
                size="small"
                fullWidth
                required
                error={Boolean(errors.currency)}
              >
                <InputLabel id="edit-currency-label">Currency</InputLabel>
                <Select
                  labelId="edit-currency-label"
                  label="Currency"
                  value={form.currency}
                  onChange={(event) =>
                    onFieldChange('currency', event.target.value)
                  }
                  onBlur={() => onFieldBlur('currency')}
                >
                  {currencyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.currency ? (
                  <Typography variant="caption" color="error">
                    {errors.currency}
                  </Typography>
                ) : null}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <TextField
                label="Bank Account"
                size="small"
                value={form.bankAccount}
                onChange={(event) =>
                  onFieldChange('bankAccount', event.target.value)
                }
                onBlur={() => onFieldBlur('bankAccount')}
                error={Boolean(errors.bankAccount)}
                helperText={errors.bankAccount}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
