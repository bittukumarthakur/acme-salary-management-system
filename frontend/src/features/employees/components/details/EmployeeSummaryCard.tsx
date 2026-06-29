import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { EmployeeStatusChip } from '../EmployeeStatusChip'
import type {
  EmployeeDetailsResponse,
  EmployeeStatus,
} from '../../types/employees'
import { IconMetaRow, SummaryInfoTile } from './DetailPrimitives'
import { getInitials } from './utils'

export function EmployeeSummaryCard({
  details,
}: {
  details: EmployeeDetailsResponse
}) {
  const initials = getInitials(details.summary.fullName)

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
        <Grid container spacing={{ xs: 2, md: 2.25 }}>
          <Grid
            size={{ xs: 12, lg: 6 }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: 'center' }}
            >
              <Avatar
                src={
                  details.overview.personalInformation.avatarUrl ?? undefined
                }
                alt={details.summary.fullName}
                sx={{
                  width: { xs: 92, md: 104 },
                  height: { xs: 92, md: 104 },
                  fontSize: { xs: 28, md: 32 },
                  bgcolor: 'primary.main',
                  boxShadow: '0 12px 24px rgba(13, 31, 79, 0.14)',
                }}
              >
                {initials}
              </Avatar>
              <Stack spacing={0.9} sx={{ justifyContent: 'center' }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Typography variant="h5" component="h1">
                    {details.summary.fullName}
                  </Typography>
                  <EmployeeStatusChip
                    status={details.summary.status as EmployeeStatus}
                    size="small"
                  />
                </Stack>
                <Typography color="primary.main" sx={{ fontWeight: 700 }}>
                  {details.summary.employeeId}
                </Typography>
                <IconMetaRow
                  icon={EmailOutlinedIcon}
                  text={details.summary.email}
                />
                <IconMetaRow
                  icon={CalendarMonthOutlinedIcon}
                  text={`Joined on ${details.summary.joinedOn}`}
                />
              </Stack>
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, lg: 6 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Grid container spacing={2} sx={{ alignContent: 'center' }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <SummaryInfoTile
                  icon={BusinessOutlinedIcon}
                  label="Department"
                  value={details.summary.department}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <SummaryInfoTile
                  icon={PersonOutlineOutlinedIcon}
                  label="Designation"
                  value={details.summary.designation}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <SummaryInfoTile
                  icon={WorkOutlineOutlinedIcon}
                  label="Employment Type"
                  value={details.summary.employmentType}
                  showRightBorder={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <SummaryInfoTile
                  icon={PublicOutlinedIcon}
                  label="Country"
                  value={details.summary.country}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <SummaryInfoTile
                  icon={CurrencyRupeeOutlinedIcon}
                  label="Currency"
                  value={details.summary.currency}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <SummaryInfoTile
                  icon={AccountBalanceOutlinedIcon}
                  label="Bank Account"
                  value={details.summary.bankAccount}
                  showRightBorder={false}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
