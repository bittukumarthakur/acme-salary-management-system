import { Alert, Box, Button } from '@mui/material'
import { useEmployeesData } from '../hooks/useEmployeesData'
import { EmployeesFilters, EmployeesTableCard } from '../components'

export interface EmployeesPageProps {
  onAddEmployeeClick?: () => void
  onEditEmployeeClick?: (employeeId: string) => void
  onViewEmployeeClick?: (employeeId: string) => void
}

export function EmployeesPage({
  onAddEmployeeClick,
  onEditEmployeeClick,
  onViewEmployeeClick,
}: EmployeesPageProps) {
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
        onAddEmployeeClick={onAddEmployeeClick ?? (() => undefined)}
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

      <EmployeesTableCard
        employees={employees}
        meta={meta}
        isLoading={state === 'loading'}
        onPageChange={setPage}
        onEditEmployeeClick={onEditEmployeeClick}
        onViewEmployeeClick={onViewEmployeeClick}
      />
    </Box>
  )
}

export default EmployeesPage
