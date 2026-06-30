import { Card, CardContent, Stack, Typography } from '@mui/material'
import { EmployeeDetailsHeader } from './EmployeeDetailsHeader'

export function EmployeeDetailsLoading() {
  return (
    <Stack spacing={2}>
      <EmployeeDetailsHeader />
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Loading employee details...
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
