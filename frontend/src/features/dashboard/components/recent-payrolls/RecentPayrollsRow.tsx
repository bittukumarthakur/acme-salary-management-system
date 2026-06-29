import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import { Avatar, Box, Chip, Stack, Typography, alpha } from '@mui/material'
import type { RecentPayrollRecord } from '../../types/dashboard'

const DATE_TEXT_COLOR = '#7180a0'
const ICON_COLOR = '#1c56f3'
const CHIP_BG_COLOR = '#18a957'
const CHIP_TEXT_COLOR = '#11843f'
const ROW_HOVER_COLOR = '#1f56f3'
const ICON_BACKGROUND_COLORS = [
  '#e7f0ff',
  '#e7f8ef',
  '#fff2df',
  '#e7f0ff',
  '#f2eaff',
]

function formatPayoutDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface RecentPayrollsRowProps {
  payroll: RecentPayrollRecord
  index: number
  onViewPayroll?: (payrollId: string) => void
}

export function RecentPayrollsRow({
  payroll,
  index,
  onViewPayroll,
}: RecentPayrollsRowProps) {
  return (
    <Stack
      data-testid="recent-payroll-row"
      component="a"
      href={`/payrolls/${payroll.id}`}
      aria-label={`View ${payroll.payrollPeriod} payroll`}
      onClick={() => onViewPayroll?.(payroll.id)}
      direction="row"
      sx={{
        py: 1.5,
        px: 1.5,
        gap: 1.5,
        justifyContent: 'space-between',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 1,
        '&:first-of-type': {
          pt: 1,
        },
        '&:hover': {
          bgcolor: alpha(ROW_HOVER_COLOR, 0.04),
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ minWidth: 0, alignItems: 'center' }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 42,
            height: 42,
            bgcolor:
              ICON_BACKGROUND_COLORS[index % ICON_BACKGROUND_COLORS.length],
            color: ICON_COLOR,
          }}
        >
          <CalendarMonthOutlinedIcon fontSize="small" />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {payroll.payrollPeriod}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: DATE_TEXT_COLOR, fontWeight: 500 }}
            noWrap
          >
            {formatPayoutDate(payroll.payoutDate)}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={0.75} sx={{ alignItems: 'flex-end' }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          {payroll.amount}
        </Typography>
        <Chip
          label={payroll.status}
          size="small"
          sx={{
            bgcolor: alpha(CHIP_BG_COLOR, 0.12),
            color: CHIP_TEXT_COLOR,
            fontWeight: 600,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Stack>
    </Stack>
  )
}
