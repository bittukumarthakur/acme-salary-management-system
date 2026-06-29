import { Alert, Box, Stack, Tab, Tabs } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  EmployeeDetailsError,
  EmployeeDetailsHeader,
  EmployeeDetailsLoading,
  EmployeeDetailsTabPanel,
  EmployeeSummaryCard,
  getTabA11yProps,
  type DetailsTab,
  OverviewTabPanel,
  SalaryBreakdownSection,
  SalaryHistorySection,
} from '../components'
import { fetchEmployeeDetails } from '../services/employeesApi'
import type { EmployeeDetailsResponse } from '../types/employees'

type DetailsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; details: EmployeeDetailsResponse }

const DETAIL_TABS: Array<{ value: DetailsTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'salary-structure', label: 'Salary Structure' },
  { value: 'salary-history', label: 'Salary History' },
]

export function EmployeeDetailsPage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const [detailsState, setDetailsState] = useState<DetailsState>(() =>
    employeeId
      ? { status: 'loading' }
      : { status: 'error', message: 'Invalid employee ID' },
  )
  const [activeTab, setActiveTab] = useState<DetailsTab>('overview')
  const [showEditNotice, setShowEditNotice] = useState(false)
  const requestIdRef = useRef(0)

  const loadEmployeeDetails = async (
    resolvedEmployeeId: string,
    requestId: number,
  ) => {
    setDetailsState({ status: 'loading' })

    try {
      const response = await fetchEmployeeDetails(resolvedEmployeeId)

      if (requestId !== requestIdRef.current) {
        return
      }

      setDetailsState({ status: 'success', details: response })
    } catch (loadError) {
      if (requestId !== requestIdRef.current) {
        return
      }

      setDetailsState({
        status: 'error',
        message:
          loadError instanceof Error
            ? loadError.message
            : 'Failed to fetch employee details',
      })
    }
  }

  useEffect(() => {
    if (!employeeId) {
      return
    }

    const requestId = ++requestIdRef.current
    void loadEmployeeDetails(employeeId, requestId)
  }, [employeeId])

  const handleRetry = () => {
    if (!employeeId) {
      setDetailsState({ status: 'error', message: 'Invalid employee ID' })
      return
    }

    const requestId = ++requestIdRef.current
    void loadEmployeeDetails(employeeId, requestId)
  }

  if (detailsState.status === 'loading') {
    return <EmployeeDetailsLoading />
  }

  if (detailsState.status === 'error') {
    return (
      <EmployeeDetailsError
        message={detailsState.message}
        onRetry={handleRetry}
      />
    )
  }

  const details = detailsState.details
  const salaryHistory = details.salaryHistory ?? []

  return (
    <Stack
      spacing={{ xs: 1.75, md: 2 }}
      sx={{ minHeight: 0, overflow: 'visible' }}
    >
      <EmployeeDetailsHeader
        showEditButton
        onEditClick={() => setShowEditNotice(true)}
      />

      {showEditNotice ? (
        <Alert severity="info" onClose={() => setShowEditNotice(false)}>
          Edit employee is not available yet.
        </Alert>
      ) : null}

      <Box component="section">
        <EmployeeSummaryCard details={details} />
      </Box>

      <Box component="section" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_event, newValue: DetailsTab) => setActiveTab(newValue)}
          aria-label="employee detail tabs"
        >
          {DETAIL_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              {...getTabA11yProps(tab.value)}
            />
          ))}
        </Tabs>
      </Box>

      <EmployeeDetailsTabPanel activeTab={activeTab} value="overview">
        <OverviewTabPanel details={details} />
      </EmployeeDetailsTabPanel>

      <EmployeeDetailsTabPanel activeTab={activeTab} value="salary-structure">
        <SalaryBreakdownSection
          salaryStructure={details.salaryStructure}
          title="Current Salary Breakdown"
          changeSummary={salaryHistory[0]?.changeSummary}
        />
      </EmployeeDetailsTabPanel>

      <EmployeeDetailsTabPanel activeTab={activeTab} value="salary-history">
        <SalaryHistorySection
          history={salaryHistory}
          fallback={details.salaryStructure}
        />
      </EmployeeDetailsTabPanel>
    </Stack>
  )
}

export default EmployeeDetailsPage
