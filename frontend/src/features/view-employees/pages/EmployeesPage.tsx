import { Alert, Box, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useEmployeesData } from '../hooks/useEmployeesData'
import { EmployeesFilters, EmployeesTableCard } from '../components'

export function EmployeesPage() {
  const navigate = useNavigate()
  const {
    state,
    error,
    employees,
    meta,
    searchTerm,
    department,
    status,
    setSearchTerm,
    setDepartment,
    setStatus,
    setPage,
    retry,
  } = useEmployeesData()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <EmployeesFilters
        searchTerm={searchTerm}
        department={department}
        status={status}
        onSearchTermChange={setSearchTerm}
        onDepartmentChange={setDepartment}
        onStatusChange={setStatus}
        onAddEmployeeClick={() => navigate('/employees/add')}
      />

      {state === 'error' && (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={retry}>
              Retry
            </Button>
          }
        >
          {error || 'Failed to load employees data'}
        </Alert>
      )}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <EmployeesTableCard
          employees={employees}
          meta={meta}
          isLoading={state === 'loading'}
          onPageChange={setPage}
          onEditEmployeeClick={(employeeId) =>
            navigate(`/employees/${employeeId}/edit`)
          }
          onViewEmployeeClick={(employeeId) =>
            navigate(`/employees/${employeeId}`)
          }
        />
      </Box>
    </Box>
  )
}

export default EmployeesPage
