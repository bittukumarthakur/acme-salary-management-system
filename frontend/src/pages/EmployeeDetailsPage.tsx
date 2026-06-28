import { Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'

export function EmployeeDetailsPage() {
  const { employeeId } = useParams<{ employeeId: string }>()

  return (
    <Stack spacing={1}>
      <Typography variant="h5" component="h1">
        Employee Details
      </Typography>
      <Typography color="text.secondary">Employee ID: {employeeId}</Typography>
    </Stack>
  )
}

export default EmployeeDetailsPage
