import { Box, Stack, Tab, Tabs } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { fetchEmployeeDetails } from '../../../employees/services/employeesApi'
import type { EmployeeDetailsResponse } from '../../../employees/types/employees'

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
  const navigate = useNavigate()
  const location = useLocation()
  const [detailsState, setDetailsState] = useState<DetailsState>(() =>
    employeeId
      ? { status: 'loading' }
      : { status: 'error', message: 'Invalid employee ID' },
  )
  const [activeTab, setActiveTab] = useState<DetailsTab>('overview')
  const [successMessage, setSuccessMessage] = useState<string | null>(
    typeof location.state === 'object' &&
      location.state &&
      'successMessage' in location.state &&
      typeof location.state.successMessage === 'string'
      ? location.state.successMessage
      : null,
  )
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
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        pb: 1,
      }}
    >
      <EmployeeDetailsHeader
        showEditButton
        onEditClick={() => {
          if (employeeId) {
            navigate(`/employees/${employeeId}/edit`)
          }
        }}
      />

      {successMessage ? (
        <Box component="section">
          <Box
            role="status"
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 1,
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
            onClick={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Box>
        </Box>
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
