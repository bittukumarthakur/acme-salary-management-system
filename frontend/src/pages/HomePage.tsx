import { useEffect, useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import { alpha } from '@mui/material/styles'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Alert,
} from '@mui/material'
import {
  fetchDashboardData,
  type DashboardData,
  type SummaryCard,
} from '../services/dashboardApi'

const navItems = [
  'Dashboard',
  'Employees',
  'Attendance',
  'Payroll',
  'Payslips',
  'Reports',
  'Settings',
] as const

const summaryCardsConfig = [
  {
    label: 'Total Employees',
    icon: <PeopleAltOutlinedIcon fontSize="small" />,
    bgColor: '#e8d5f2',
    iconColor: '#7c4dff',
  },
  {
    label: 'Payroll Processed',
    icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
    bgColor: '#d0f0c0',
    iconColor: '#2e7d32',
  },
  {
    label: 'Total Deductions',
    icon: <ReceiptLongOutlinedIcon fontSize="small" />,
    bgColor: '#ffe0b2',
    iconColor: '#e65100',
  },
  {
    label: 'Net Salary Paid',
    icon: <SavingsOutlinedIcon fontSize="small" />,
    bgColor: '#bbdefb',
    iconColor: '#1565c0',
  },
] as const

const quickActions = [
  'Add Employee',
  'Mark Attendance',
  'Generate Payroll',
  'View Payslips',
] as const

type DashboardState = 'loading' | 'success' | 'error'

export function HomePage() {
  const [state, setState] = useState<DashboardState>('loading')
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setState('loading')
    setError(null)
    try {
      const result = await fetchDashboardData()
      setData(result)
      setState('success')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      )
      setState('error')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRetry = () => {
    loadData()
  }

  const renderSummaryCard = (
    cardConfig: (typeof summaryCardsConfig)[number],
    cardData: SummaryCard | undefined
  ) => {
    const isPositiveTrend = cardData?.metadata?.startsWith('↑')
    const renderMetadata = () => {
      if (!cardData?.metadata) return null
      
      if (isPositiveTrend) {
        // Split "↑ 8 this month" into "↑ 8" (green, bold) and " this month" (normal)
        const match = cardData.metadata.match(/^(↑\s+\d+)(.*)$/)
        if (match) {
          return (
            <Box sx={{ display: 'inline' }}>
              <Typography
                component="span"
                sx={{
                  fontWeight: 800,
                  color: '#2e7d32',
                  fontSize: '1rem',
                  display: 'inline',
                }}
              >
                {match[1]}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                  fontSize: '1rem',
                  display: 'inline',
                }}
              >
                {match[2]}
              </Typography>
            </Box>
          )
        }
      }
      
      return (
        <Typography
          sx={{
            fontWeight: 500,
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          {cardData.metadata}
        </Typography>
      )
    }

    return (
      <Grid key={cardConfig.label} size={{ xs: 12, md: 6, xl: 3 }}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: alpha('#1f2f5f', 0.18),
            boxShadow: '0 6px 18px rgba(20, 35, 79, 0.08)',
            minHeight: 126,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              {/* Left: Icon */}
              <Avatar
                sx={{
                  bgcolor: cardConfig.bgColor,
                  color: cardConfig.iconColor,
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                }}
              >
                {cardConfig.icon}
              </Avatar>

              {/* Right: Title, Value, Metadata */}
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {cardConfig.label}
                </Typography>
                {state === 'loading' ? (
                  <Skeleton variant="text" height={28} width="60%" />
                ) : (
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {cardData?.value ?? 'N/A'}
                  </Typography>
                )}
                {state === 'loading' ? (
                  <Skeleton variant="text" height={16} width="70%" />
                ) : (
                  renderMetadata()
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 272,
          flexShrink: 0,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 3,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 28px rgba(10, 24, 60, 0.22)',
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mb: 4, alignItems: 'center' }}
        >
          <Avatar
            sx={{
              bgcolor: alpha('#ffffff', 0.18),
              color: 'primary.contrastText',
            }}
          >
            S
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Salary Portal
          </Typography>
        </Stack>

        <List sx={{ p: 0, gap: 0.75, display: 'grid' }}>
          {navItems.map((item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton
                component="button"
                selected={item === 'Dashboard'}
                sx={{
                  borderRadius: 1.5,
                  minHeight: 42,
                  color: 'inherit',
                  '&.Mui-selected': {
                    bgcolor: alpha('#ffffff', 0.18),
                    '&:hover': { bgcolor: alpha('#ffffff', 0.22) },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                      {item}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 1.5, fontWeight: 700 }}
          >
            Collapse
          </Button>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Paper
          square
          elevation={0}
          sx={{
            minHeight: 84,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <IconButton aria-label="Open menu" color="primary">
              <MenuIcon />
            </IconButton>
            <Typography variant="h4">Dashboard</Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <IconButton aria-label="Notifications" color="primary">
              <Badge badgeContent={3} color="error">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
            <Chip
              avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>H</Avatar>}
              label={
                <Stack sx={{ minWidth: 110 }}>
                  <Typography variant="subtitle2" noWrap>
                    HR Admin
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Admin
                  </Typography>
                </Stack>
              }
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                py: 2.75,
                px: 0.75,
                bgcolor: 'background.paper',
              }}
            />
          </Stack>
        </Paper>

        <Box sx={{ p: 4 }}>
          {state === 'error' && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleRetry}
                  aria-label="Retry"
                >
                  Retry
                </Button>
              }
              sx={{ mb: 3 }}
            >
              {error || 'Failed to load dashboard data'}
            </Alert>
          )}

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {summaryCardsConfig.map((cardConfig) => {
              const cardData = data?.summaryCards.find(
                (card) => card.label === cardConfig.label
              )
              return renderSummaryCard(cardConfig, cardData)
            })}
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    sx={{
                      mb: 2,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="h5">Payroll Summary</Typography>
                    <Button variant="outlined" sx={{ borderRadius: 1.5 }}>
                      This Month
                    </Button>
                  </Stack>
                  {state === 'loading' ? (
                    <Skeleton
                      variant="rounded"
                      height={348}
                      sx={{ borderRadius: 2 }}
                    />
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        minHeight: 348,
                        borderRadius: 2,
                        p: 3,
                        borderColor: alpha('#1f2f5f', 0.28),
                        bgcolor: alpha('#f4f6fb', 0.8),
                      }}
                    >
                      <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
                        <svg
                          viewBox="0 0 500 180"
                          style={{
                            width: '100%',
                            height: '100%',
                            preserveAspectRatio: 'xMidYMid meet',
                          }}
                        >
                          {/* Grid lines */}
                          <line x1="40" y1="15" x2="40" y2="150" stroke="#d0d0d0" strokeWidth="1" />
                          <line x1="40" y1="150" x2="480" y2="150" stroke="#d0d0d0" strokeWidth="1" />

                          {/* Y-axis labels (0L to 30L) */}
                          {[0, 10, 20, 30].map((label, i) => (
                            <g key={`y-${i}`}>
                              <line
                                x1="35"
                                y1={150 - (label / 30) * 135}
                                x2="40"
                                y2={150 - (label / 30) * 135}
                                stroke="#d0d0d0"
                                strokeWidth="1"
                              />
                              <text
                                x="30"
                                y={155 - (label / 30) * 135}
                                textAnchor="end"
                                fontSize="11"
                                fill="#666"
                              >
                                {label}L
                              </text>
                            </g>
                          ))}

                          {/* Calculate points for line chart */}
                          {(() => {
                            const maxValue = 30000000 // 30L
                            const points = data?.payrollSummary.values.map(
                              (val, idx) => ({
                                x: 40 + ((idx + 0.5) / 6) * 440,
                                y: 150 - ((val / maxValue) * 135),
                                val,
                              })
                            ) || []

                            const pathData = points.reduce((acc, point, idx) => {
                              return acc + (idx === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`)
                            }, '')

                            const areaData =
                              `M 40 150 ` +
                              points.reduce((acc, point, idx) => {
                                return acc + (idx === 0 ? `L ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`)
                              }, '') +
                              ` L 480 150 Z`

                            return (
                              <>
                                {/* Filled area */}
                                <path
                                  d={areaData}
                                  fill="url(#areaGradient)"
                                  opacity="0.3"
                                />

                                {/* Line */}
                                <path
                                  d={pathData}
                                  stroke="#5b7bfc"
                                  strokeWidth="2.5"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                {/* Data points */}
                                {points.map((point, idx) => (
                                  <circle
                                    key={`point-${idx}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r="3.5"
                                    fill="#5b7bfc"
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                  />
                                ))}
                              </>
                            )
                          })()}

                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#5b7bfc" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#5b7bfc" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* X-axis labels (months) */}
                          {data?.payrollSummary.months.map((month, idx) => (
                            <text
                              key={`month-${idx}`}
                              x={40 + ((idx + 0.5) / 6) * 440}
                              y="165"
                              textAnchor="middle"
                              fontSize="11"
                              fill="#666"
                            >
                              {month}
                            </text>
                          ))}
                        </svg>
                      </Box>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={12}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, xl: 8 }}>
                  <Card variant="outlined" sx={{ borderRadius: 2, minHeight: 164 }}>
                    <CardContent>
                      <Stack
                        direction="row"
                        sx={{
                          mb: 1.5,
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="h5">Recent Payrolls</Typography>
                        <Button size="small">View all</Button>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />
                      <Paper
                        variant="outlined"
                        sx={{
                          minHeight: 82,
                          borderRadius: 1.5,
                          borderStyle: 'dashed',
                          borderColor: alpha('#1f2f5f', 0.28),
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: alpha('#f4f6fb', 0.8),
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Coming soon
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, xl: 4 }}>
                  <Card variant="outlined" sx={{ borderRadius: 2, minHeight: 164 }}>
                    <CardContent>
                      <Typography variant="h5" sx={{ mb: 2 }}>
                        Quick Actions
                      </Typography>
                      <Grid container spacing={1.25}>
                        {quickActions.map((action) => (
                          <Grid key={action} size={{ xs: 12 }}>
                            <Paper
                              variant="outlined"
                              sx={{
                                borderRadius: 1.5,
                                borderStyle: 'dashed',
                                borderColor: alpha('#1f2f5f', 0.28),
                                minHeight: 60,
                                px: 1.25,
                                py: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                bgcolor: alpha('#f4f6fb', 0.8),
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {action}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Coming soon
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage
