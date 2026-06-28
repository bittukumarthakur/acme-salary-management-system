import { Avatar, Stack, Typography } from '@mui/material'
import type { EmployeeListItem } from '../../types/employees'

interface EmployeeDetailsCellProps {
  employee: EmployeeListItem
}

export function EmployeeDetailsCell({ employee }: EmployeeDetailsCellProps) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Avatar src={employee.avatarUrl} alt={employee.fullName} />
      <Stack
        spacing={0.25}
        sx={{ alignItems: 'flex-start', justifyContent: 'center' }}
      >
        <Typography variant="body1">{employee.fullName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {employee.email}
        </Typography>
      </Stack>
    </Stack>
  )
}
