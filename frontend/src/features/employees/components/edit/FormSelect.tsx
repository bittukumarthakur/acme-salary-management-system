import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import type {
  EditEmployeeFormState,
  EditEmployeeSetField,
} from '../../pages/editEmployeeForm'

interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  label: string
  field: keyof EditEmployeeFormState
  value: string
  options: FormSelectOption[] | string[]
  error?: string
  required?: boolean
  onFieldChange: EditEmployeeSetField
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
}

export function FormSelect({
  label,
  field,
  value,
  options,
  error,
  required = false,
  onFieldChange,
  onFieldBlur,
}: FormSelectProps) {
  const labelId = `edit-${field}-label`

  const isOptionObject = (
    opt: FormSelectOption | string,
  ): opt is FormSelectOption => typeof opt === 'object' && opt !== null

  return (
    <FormControl
      size="small"
      fullWidth
      required={required}
      error={Boolean(error)}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(event) => onFieldChange(field, event.target.value)}
        onBlur={() => onFieldBlur(field)}
      >
        {options.map((option) => {
          const optionValue = isOptionObject(option) ? option.value : option
          const optionLabel = isOptionObject(option) ? option.label : option
          return (
            <MenuItem key={optionValue} value={optionValue}>
              {optionLabel}
            </MenuItem>
          )
        })}
      </Select>
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </FormControl>
  )
}
