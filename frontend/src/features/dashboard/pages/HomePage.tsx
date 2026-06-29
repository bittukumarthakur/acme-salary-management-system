import { Box, Grid, Alert, Button } from '@mui/material'
import type { ReactNode } from 'react'
import { useDashboardData } from '../hooks/useDashboardData'
import { Sidebar } from '../../../shared/components/layout/Sidebar'
import { Header } from '../../../shared/components/layout/Header'
import { SummaryCards } from '../components/summary/SummaryCards'
import { PayrollSummaryChart } from '../components/payroll-summary/PayrollSummaryChart'
import { QuickActions } from '../components/actions/QuickActions'
import { RecentPayrollsSection } from '../components/recent-payrolls/RecentPayrollsSection'
import type { NavItem } from '../../../shared/constants/dashboard'

export interface HomePageProps {
  activeNavItem?: NavItem
  onSelectNavItem?: (item: NavItem) => void
  mainContent?: ReactNode
  pageTitle?: string
}

export function HomePage({
  activeNavItem = 'Dashboard',
  onSelectNavItem,
  mainContent,
  pageTitle = 'Dashboard',
}: HomePageProps) {
  const dashboardData = useDashboardData()

  const resolvedMainContent = mainContent ?? (
    <>
      {/* Error Alert */}
      {dashboardData.state === 'error' && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={dashboardData.retry}
              aria-label="Retry"
            >
              Retry
            </Button>
          }
          sx={{ mb: 0 }}
        >
          {dashboardData.error || 'Failed to load dashboard data'}
        </Alert>
      )}

      {/* Section 1: Summary Cards */}
      <SummaryCards
        data={dashboardData.data}
        isLoading={dashboardData.state === 'loading'}
      />

      {/* Section 2: Payroll & Recent Payrolls */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid
            size={{ xs: 12, md: 6, lg: 8 }}
            sx={{ height: '100%', display: 'flex' }}
          >
            <PayrollSummaryChart data={dashboardData.data.payrollSummary} />
          </Grid>

          <Grid
            size={{ xs: 12, md: 6, lg: 4 }}
            sx={{ height: '100%', display: 'flex' }}
          >
            <RecentPayrollsSection
              payrolls={dashboardData.data.recentPayrolls}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Section 3: Quick Actions */}
      <QuickActions />
    </>
  )

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        height: '100dvh',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <Sidebar activeItem={activeNavItem} onSelectItem={onSelectNavItem} />

      <Box
        component="main"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Header title={pageTitle} />

        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 2,
            minHeight: 0,
            overflowY: 'hidden',
            overflowX: 'hidden',
          }}
        >
          {resolvedMainContent}
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage
