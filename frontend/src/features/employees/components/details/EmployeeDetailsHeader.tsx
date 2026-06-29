import { Breadcrumbs, Button, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

interface EmployeeDetailsHeaderProps {
  showEditButton?: boolean
  onEditClick?: () => void
}

export function EmployeeDetailsHeader({
  showEditButton = false,
  onEditClick,
}: EmployeeDetailsHeaderProps) {
  return (
    <Stack
      component="section"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 1.25 }}
      sx={{
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        py: { xs: 0.5, md: 0.75 },
        minHeight: { sm: 56 },
      }}
    >
      <Stack spacing={0.5}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to="/employees"
          >
            Employees
          </Link>
          <Typography color="text.primary">View Employee</Typography>
        </Breadcrumbs>
      </Stack>

      {showEditButton ? (
        <Button variant="outlined" onClick={onEditClick}>
          Edit Employee
        </Button>
      ) : null}
    </Stack>
  )
}
