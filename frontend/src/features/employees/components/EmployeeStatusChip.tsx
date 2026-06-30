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

type StatusChipColor = 'success' | 'warning' | 'default' | 'error'

const STATUS_CHIP_COLOR: Record<EmployeeStatus, StatusChipColor> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  ON_LEAVE: 'warning',
  TERMINATED: 'error',
}

function getStatusChipColor(status: EmployeeStatus): StatusChipColor {
  return STATUS_CHIP_COLOR[status]
}

interface EmployeeStatusChipProps {
  status: EmployeeStatus
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
