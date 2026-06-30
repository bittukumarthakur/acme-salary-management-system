import { TextField } from '@mui/material'
import type {
  EditEmployeeFormState,
  EditEmployeeSetField,
} from '../form/editEmployeeForm'

interface FormTextFieldProps {
  label: string
  field: keyof EditEmployeeFormState
  value: string
  error?: string
  type?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  onFieldChange: EditEmployeeSetField
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
}

export function FormTextField({
  label,
  field,
  value,
  error,
  type = 'text',
  disabled = false,
  required = false,
  placeholder,
  onFieldChange,
  onFieldBlur,
}: FormTextFieldProps) {
  return (
    <TextField
      label={label}
      type={type}
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onFieldChange(field, event.target.value)}
      onBlur={() => onFieldBlur(field)}
      error={Boolean(error)}
      helperText={error}
      disabled={disabled}
      fullWidth
      required={required}
    />
  )
}
