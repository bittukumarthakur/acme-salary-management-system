import { Box, Grid, Alert, Button } from '@mui/material'
import { useDashboardData } from '../hooks/useDashboardData'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { SummaryCards } from '../components/dashboard/summary/SummaryCards'
import { PayrollChart } from '../components/dashboard/payroll/PayrollChart'
import { QuickActions } from '../components/dashboard/actions/QuickActions'
import { RecentPayrolls } from '../components/dashboard/recent/RecentPayrolls'

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
            data={dashboardData.data || undefined}
            isLoading={dashboardData.state === 'loading'}
          />

          {/* Section 2: Payroll & Recent Payrolls */}
          <Box sx={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid
                size={{ xs: 12, md: 6, lg: 7 }}
                sx={{ height: '100%', display: 'flex' }}
              >
                <PayrollChart
                  data={dashboardData.data?.payrollSummary}
                  isLoading={dashboardData.state === 'loading'}
                />
              </Grid>

              <Grid
                size={{ xs: 12, md: 6, lg: 5 }}
                sx={{ height: '100%', display: 'flex' }}
              >
                <RecentPayrolls />
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
