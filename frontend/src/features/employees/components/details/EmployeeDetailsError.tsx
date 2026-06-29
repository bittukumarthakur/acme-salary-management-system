import { Alert, Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmployeeDetailsHeader } from './EmployeeDetailsHeader'

interface EmployeeDetailsErrorProps {
  message: string
  onRetry: () => void
}

export function EmployeeDetailsError({
  message,
  onRetry,
}: EmployeeDetailsErrorProps) {
  return (
    <Stack spacing={2}>
      <EmployeeDetailsHeader />
      <Alert
        severity="error"
        action={
          <Stack direction="row" spacing={1}>
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
            <Button
              component={RouterLink}
              to="/employees"
              color="inherit"
              size="small"
            >
              Back to Employees
            </Button>
          </Stack>
        }
      >
        {message}
      </Alert>
    </Stack>
  )
}
