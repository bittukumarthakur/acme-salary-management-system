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
  Stack,
  Typography,
} from '@mui/material'

const navItems = [
  'Dashboard',
  'Employees',
  'Attendance',
  'Payroll',
  'Payslips',
  'Reports',
  'Settings',
] as const

const summaryCards = [
  {
    label: 'Total Employees',
    icon: <PeopleAltOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Payroll Processed',
    icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Total Deductions',
    icon: <ReceiptLongOutlinedIcon fontSize="small" />,
  },
  { label: 'Net Salary Paid', icon: <SavingsOutlinedIcon fontSize="small" /> },
] as const

const quickActions = [
  'Add Employee',
  'Mark Attendance',
  'Generate Payroll',
  'View Payslips',
] as const

export function HomePage() {
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
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {summaryCards.map((card) => (
              <Grid key={card.label} size={{ xs: 12, md: 6, xl: 3 }}>
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
                    <Stack
                      direction="row"
                      sx={{
                        mb: 2,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {card.label}
                      </Typography>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#0d1f4f', 0.1),
                          color: 'primary.main',
                          width: 34,
                          height: 34,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                    </Stack>
                    <Paper
                      variant="outlined"
                      sx={{
                        borderRadius: 1.5,
                        borderStyle: 'dashed',
                        borderColor: alpha('#1f2f5f', 0.28),
                        minHeight: 44,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha('#f4f6fb', 0.9),
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Coming soon
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, xl: 8 }}>
              <Card variant="outlined" sx={{ borderRadius: 2, minHeight: 348 }}>
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
                  <Paper
                    variant="outlined"
                    sx={{
                      minHeight: 248,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      borderColor: alpha('#1f2f5f', 0.28),
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha('#f4f6fb', 0.8),
                    }}
                  >
                    <Typography color="text.secondary">Coming soon</Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, xl: 4 }}>
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

            <Grid size={12}>
              <Card variant="outlined" sx={{ borderRadius: 2, minHeight: 164 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={1.25}>
                    {quickActions.map((action) => (
                      <Grid key={action} size={{ xs: 12, md: 6, xl: 3 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            borderRadius: 1.5,
                            borderStyle: 'dashed',
                            borderColor: alpha('#1f2f5f', 0.28),
                            minHeight: 74,
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
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage
