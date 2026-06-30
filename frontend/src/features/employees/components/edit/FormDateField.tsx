import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import type {
  EditEmployeeFormState,
  EditEmployeeSetField,
} from '../../pages/editEmployeeForm'

interface FormDateFieldProps {
  label: string
  field: keyof EditEmployeeFormState
  value: string
  error?: string
  required?: boolean
  onFieldChange: EditEmployeeSetField
  onFieldBlur: (field: keyof EditEmployeeFormState) => void
}

export function FormDateField({
  label,
  field,
  value,
  error,
  required = false,
  onFieldChange,
  onFieldBlur,
}: FormDateFieldProps) {
  return (
    <DatePicker
      label={label}
      format="MM/DD/YYYY"
      value={value ? dayjs(value) : null}
      onChange={(dayjsValue) =>
        onFieldChange(field, dayjsValue ? dayjsValue.format('YYYY-MM-DD') : '')
      }
      slotProps={{
        textField: {
          name: `select ${field}`,
          size: 'small',
          fullWidth: true,
          required,
          onBlur: () => onFieldBlur(field),
          error: Boolean(error),
          helperText: error,
        },
      }}
    />
  )
}
