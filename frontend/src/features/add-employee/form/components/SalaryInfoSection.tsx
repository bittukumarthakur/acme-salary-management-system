import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type {
  AddEmployeeFormState,
  AddEmployeeSetField,
  FormErrors,
} from '../formModel'

interface SalaryInfoSectionProps {
  form: AddEmployeeFormState
  errors: FormErrors
  setField: AddEmployeeSetField
}

export function SalaryInfoSection({
  form,
  errors,
  setField,
}: SalaryInfoSectionProps) {
  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Salary Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Basic Salary (Monthly)"
            variant="outlined"
            size="small"
            type="number"
            placeholder="Enter monthly basic salary"
            value={form.basicSalary}
            onChange={(event) => setField('basicSalary', event.target.value)}
            error={Boolean(errors.basicSalary)}
            helperText={
              errors.basicSalary ??
              'Monthly basic salary; annual CTC is calculated as ×12'
            }
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Allowances (Monthly)"
            variant="outlined"
            size="small"
            type="number"
            placeholder="Enter monthly allowances"
            value={form.allowances}
            onChange={(event) => setField('allowances', event.target.value)}
            error={Boolean(errors.allowances)}
            helperText={
              errors.allowances ??
              'Monthly allowances; included in annual CTC (×12)'
            }
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={form.pfApplicable}
                onChange={(_, checked) => setField('pfApplicable', checked)}
              />
            }
            label="PF Applicable"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={form.esiApplicable}
                onChange={(_, checked) => setField('esiApplicable', checked)}
              />
            }
            label="ESI Applicable"
          />
        </Grid>
      </Grid>
    </Box>
  )
}
