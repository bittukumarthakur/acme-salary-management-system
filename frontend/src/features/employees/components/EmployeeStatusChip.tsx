import { Chip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { EmployeeStatus } from '../types/employees'
import { toTitleCase } from '../../../shared/utils/formatters'

const STATUS_CHIP_BASE_SX: SxProps<Theme> = {
  fontWeight: 700,
  borderRadius: 1,
  '& .MuiChip-label': {
    px: 1.75,
  },
}

function getStatusChipColor(
  status: EmployeeStatus | string,
): 'success' | 'warning' | 'default' | 'error' {
  if (status === 'ACTIVE') {
    return 'success'
  }

  if (status === 'INACTIVE') {
    return 'default'
  }

  if (status === 'ON_LEAVE') {
    return 'warning'
  }

  return 'error'
}

interface EmployeeStatusChipProps {
  status: EmployeeStatus | string
  size?: 'small' | 'medium'
}

export function EmployeeStatusChip({
  status,
  size = 'medium',
}: EmployeeStatusChipProps) {
  return (
    <Chip
      label={toTitleCase(status)}
      size={size}
      color={getStatusChipColor(status)}
      variant="filled"
      sx={{
        ...STATUS_CHIP_BASE_SX,
      }}
    />
  )
}
