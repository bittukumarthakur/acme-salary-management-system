import {
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import type { SelectChangeEvent } from '@mui/material/Select'
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_STATUSES,
} from '../../constants/dashboard'
import type { EmployeeDepartment, EmployeeStatus } from '../../types/employees'

export interface EmployeesFiltersProps {
  searchTerm: string
  department: EmployeeDepartment | ''
  status: EmployeeStatus | ''
  onSearchTermChange: (value: string) => void
  onDepartmentChange: (value: EmployeeDepartment | '') => void
  onStatusChange: (value: EmployeeStatus | '') => void
  onAddEmployeeClick: () => void
}

function toLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function EmployeesFilters({
  searchTerm,
  department,
  status,
  onSearchTermChange,
  onDepartmentChange,
  onStatusChange,
  onAddEmployeeClick,
}: EmployeesFiltersProps) {
  const handleDepartmentChange = (event: SelectChangeEvent) => {
    onDepartmentChange(event.target.value as EmployeeDepartment | '')
  }

  const handleStatusChange = (event: SelectChangeEvent) => {
    onStatusChange(event.target.value as EmployeeStatus | '')
  }

  return (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'flex-end',
          alignItems: { xs: 'flex-end', md: 'center' },
        }}
      >
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddRoundedIcon fontSize="small" />}
          onClick={onAddEmployeeClick}
          sx={{
            textTransform: 'none',
            px: 3,
            py: 1,
            fontWeight: 600,
            minWidth: 180,
          }}
        >
          Add Employee
        </Button>
      </Stack>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            aria-label="Search employees"
            placeholder="Search by name, email, or employee ID"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="department-filter-label">Department</InputLabel>
            <Select
              labelId="department-filter-label"
              label="Department"
              value={department}
              onChange={handleDepartmentChange}
            >
              <MenuItem value="">All Departments</MenuItem>
              {EMPLOYEE_DEPARTMENTS.map((item) => (
                <MenuItem key={item} value={item}>
                  {toLabel(item)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              value={status}
              onChange={handleStatusChange}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {EMPLOYEE_STATUSES.map((item) => (
                <MenuItem key={item} value={item}>
                  {toLabel(item)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </>
  )
}
