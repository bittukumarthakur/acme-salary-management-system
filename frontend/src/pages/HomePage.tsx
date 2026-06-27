import { Box, Grid, Alert, Button } from '@mui/material'
import { useDashboardData } from '../hooks/useDashboardData'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { SummaryCards } from '../components/dashboard/summary/SummaryCards'
import { PayrollSummaryChart } from '../components/dashboard/payroll-summary/PayrollSummaryChart'
import { QuickActions } from '../components/dashboard/actions/QuickActions'
import { RecentPayrollsSection } from '../components/dashboard/recent-payrolls/RecentPayrollsSection'

export function HomePage() {
  const dashboardData = useDashboardData()

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Header />

        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 2,
            overflow: 'hidden',
          }}
        >
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
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage
