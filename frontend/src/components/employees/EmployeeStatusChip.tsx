import { Chip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { EmployeeStatus } from '../../types/employees'

const STATUS_CHIP_BASE_SX: SxProps<Theme> = {
  fontWeight: 700,
  borderRadius: 1,
  '& .MuiChip-label': {
    px: 1.75,
  },
}

function toLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getStatusChipColor(
  status: EmployeeStatus,
): 'success' | 'warning' | 'default' | 'error' {
  if (status === 'ACTIVE') {
    return 'success'
  }

  if (status === 'ON_LEAVE') {
    return 'warning'
  }

  if (status === 'INACTIVE') {
    return 'default'
  }

  return 'error'
}

interface EmployeeStatusChipProps {
  status: EmployeeStatus
}

export function EmployeeStatusChip({ status }: EmployeeStatusChipProps) {
  return (
    <Chip
      label={toLabel(status)}
      size="medium"
      color={getStatusChipColor(status)}
      variant="filled"
      sx={{
        ...STATUS_CHIP_BASE_SX,
      }}
    />
  )
}
