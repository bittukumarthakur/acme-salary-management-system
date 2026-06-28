import { useState } from 'react'
import { Alert, Box, Button, Snackbar } from '@mui/material'
import { useEmployeesData } from '../hooks/useEmployeesData'
import { EmployeesFilters, EmployeesTableCard } from '../components/employees'

export function EmployeesPage() {
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
  const [showAddToast, setShowAddToast] = useState(false)

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
        onAddEmployeeClick={() => setShowAddToast(true)}
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
      />

      <Snackbar
        open={showAddToast}
        autoHideDuration={2800}
        onClose={() => setShowAddToast(false)}
      >
        <Alert severity="info" onClose={() => setShowAddToast(false)}>
          Add Employee flow will be available in a follow-up story.
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EmployeesPage
