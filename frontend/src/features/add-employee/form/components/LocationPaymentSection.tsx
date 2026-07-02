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
import type {
  AddEmployeeFormState,
  AddEmployeeSetField,
  FormErrors,
} from '../formModel'
import { currencyOptions } from '../options'

interface LocationPaymentSectionProps {
  form: AddEmployeeFormState
  errors: FormErrors
  setField: AddEmployeeSetField
}

export function LocationPaymentSection({
  form,
  errors,
  setField,
}: LocationPaymentSectionProps) {
  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Location & Payment
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Country"
            variant="outlined"
            size="small"
            placeholder="Enter country"
            value={form.country}
            onChange={(event) => setField('country', event.target.value)}
            error={Boolean(errors.country)}
            helperText={errors.country}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl
            fullWidth
            required
            size="small"
            error={Boolean(errors.currency)}
          >
            <InputLabel id="currency-label">Currency</InputLabel>
            <Select
              labelId="currency-label"
              label="Currency"
              value={form.currency}
              onChange={(event) => setField('currency', event.target.value)}
            >
              <MenuItem value="">Select Currency</MenuItem>
              {currencyOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors.currency && (
              <Typography variant="caption" color="error">
                {errors.currency}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Bank Account"
            variant="outlined"
            size="small"
            placeholder="Enter bank account number"
            value={form.bankAccount}
            onChange={(event) => setField('bankAccount', event.target.value)}
            error={Boolean(errors.bankAccount)}
            helperText={errors.bankAccount}
            fullWidth
            required
          />
        </Grid>
      </Grid>
    </Box>
  )
}
