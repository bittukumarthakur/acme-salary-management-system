import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import type {
  EmployeeDetailsResponse,
  SalaryLineItem,
} from '../../../employees/types/employees'
import { formatCurrencyWithCode } from '../../../../shared/utils/formatters'
import { DetailField } from './DetailPrimitives'
import { getDisplayValue } from './utils'

const cardHeaderSx = { fontWeight: 700 }

function SalaryItemsTable({
  heading,
  label,
  items,
  totalLabel,
  totalAmount,
  currency,
  tone,
}: {
  heading: string
  label: string
  items: SalaryLineItem[]
  totalLabel: string
  totalAmount: number
  currency: string
  tone: 'success' | 'error'
}) {
  const tagSx =
    tone === 'success'
      ? { bgcolor: 'rgba(46, 125, 50, 0.12)', color: 'success.dark' }
      : { bgcolor: 'rgba(211, 47, 47, 0.1)', color: 'error.main' }

  const totalRowSx =
    tone === 'success'
      ? { bgcolor: 'rgba(46, 125, 50, 0.1)', color: 'success.dark' }
      : { bgcolor: 'rgba(211, 47, 47, 0.08)', color: 'error.main' }

  return (
    <Stack spacing={1.25}>
      <Typography variant="subtitle1" sx={cardHeaderSx}>
        {heading}
      </Typography>

      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          width: 'fit-content',
          ...tagSx,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
      </Box>

      <Stack
        spacing={0}
        divider={<Divider flexItem />}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            px: 1.5,
            py: 1,
            justifyContent: 'space-between',
            bgcolor: 'rgba(15, 23, 42, 0.04)',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Component
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Amount ({currency})
          </Typography>
        </Stack>

        {items.map((item) => (
          <Stack
            key={`${heading}-${item.component}`}
            direction="row"
            spacing={2}
            sx={{ justifyContent: 'space-between', px: 1.5, py: 1.25 }}
          >
            <Typography>{item.component}</Typography>
            <Typography sx={{ fontWeight: 600, textAlign: 'right' }}>
              {formatCurrencyWithCode(item.amount, currency)}
            </Typography>
          </Stack>
        ))}

        <Stack
          direction="row"
          spacing={2}
          sx={{
            px: 1.5,
            py: 1.25,
            justifyContent: 'space-between',
            ...totalRowSx,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>{totalLabel}</Typography>
          <Typography sx={{ fontWeight: 700 }}>
            {formatCurrencyWithCode(totalAmount, currency)}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

function SalarySummaryCard({
  data,
}: {
  data: EmployeeDetailsResponse['salaryStructure']
}) {
  return (
    <Stack spacing={2}>
      <Box
        sx={{
          borderRadius: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: 'rgba(46, 125, 50, 0.08)',
        }}
      >
        <Typography variant="subtitle1" sx={cardHeaderSx}>
          Net Pay{' '}
          <Typography component="span" color="text.secondary">
            (Monthly)
          </Typography>
        </Typography>
        <Typography variant="h4" color="success.dark" sx={{ fontWeight: 700 }}>
          {formatCurrencyWithCode(data.netPayMonthly, data.currency)}
        </Typography>
      </Box>

      <Stack spacing={1.75}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.primary">CTC (Annual)</Typography>
          <Typography sx={{ fontWeight: 600 }}>
            {formatCurrencyWithCode(data.ctcAnnual, data.currency)}
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.primary">Base Salary (Monthly)</Typography>
          <Typography sx={{ fontWeight: 600 }}>
            {formatCurrencyWithCode(data.baseSalaryMonthly, data.currency)}
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography color="text.primary">Effective From</Typography>
          <Typography sx={{ fontWeight: 600 }}>
            {getDisplayValue(data.effectiveFrom)}
          </Typography>
        </Stack>
      </Stack>

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="small" />}
        sx={{
          mt: 0.5,
          '& .MuiAlert-message': {
            fontWeight: 500,
          },
        }}
      >
        All amounts are in {data.currency}
      </Alert>
    </Stack>
  )
}

function SalaryBaseCard({
  salaryStructure,
}: {
  salaryStructure: EmployeeDetailsResponse['salaryStructure']
}) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" sx={cardHeaderSx}>
        Base Salary
      </Typography>
      <DetailField
        label="Base Salary (Monthly)"
        value={formatCurrencyWithCode(
          salaryStructure.baseSalaryMonthly,
          salaryStructure.currency,
        )}
      />
      <DetailField
        label="Effective From"
        value={getDisplayValue(salaryStructure.effectiveFrom)}
      />
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="small" />}
        sx={{
          mt: 0.5,
          '& .MuiAlert-message': {
            fontWeight: 500,
          },
        }}
      >
        All amounts are in {salaryStructure.currency}
      </Alert>
    </Stack>
  )
}

interface SectionHeadingProps {
  title: string
}

function SectionHeading({ title }: SectionHeadingProps) {
  const monthlySuffix = '(Monthly)'
  const hasSuffix = title.includes(monthlySuffix)

  if (hasSuffix) {
    const baseTitle = title.replace(monthlySuffix, '').trim()

    return (
      <Typography variant="subtitle1" sx={cardHeaderSx}>
        {baseTitle}{' '}
        <Typography component="span" color="text.secondary">
          {monthlySuffix}
        </Typography>
      </Typography>
    )
  }

  return (
    <Typography variant="subtitle1" sx={cardHeaderSx}>
      {title}
    </Typography>
  )
}

interface SalaryBreakdownSectionProps {
  salaryStructure: EmployeeDetailsResponse['salaryStructure']
  title: string
  changeSummary?: string | null
  leadingColumn?: ReactNode
  earningsColumn?: ReactNode
  showTitle?: boolean
  disableContainerPadding?: boolean
}

export function SalaryBreakdownSection({
  salaryStructure,
  title,
  changeSummary,
  leadingColumn,
  earningsColumn,
  showTitle = true,
  disableContainerPadding = false,
}: SalaryBreakdownSectionProps) {
  return (
    <Box sx={disableContainerPadding ? undefined : { p: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2}>
        {showTitle ? <SectionHeading title={title} /> : null}
        <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 6, xl: 3 }} sx={{ display: 'flex' }}>
            <Card
              variant="outlined"
              sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
                {leadingColumn ?? (
                  <SalaryBaseCard salaryStructure={salaryStructure} />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, xl: 3 }} sx={{ display: 'flex' }}>
            <Card
              variant="outlined"
              sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
                {earningsColumn ?? (
                  <SalaryItemsTable
                    heading="Salary Components (Monthly)"
                    label="Earnings & Allowances"
                    items={salaryStructure.earnings}
                    totalLabel="Total Earnings"
                    totalAmount={salaryStructure.totalEarnings}
                    currency={salaryStructure.currency}
                    tone="success"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, xl: 3 }} sx={{ display: 'flex' }}>
            <Card
              variant="outlined"
              sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
                <SalaryItemsTable
                  heading="Deductions"
                  label="Deductions"
                  items={salaryStructure.deductions}
                  totalLabel="Total Deductions"
                  totalAmount={salaryStructure.totalDeductions}
                  currency={salaryStructure.currency}
                  tone="error"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6, xl: 3 }} sx={{ display: 'flex' }}>
            <Card
              variant="outlined"
              sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
                <SalarySummaryCard data={salaryStructure} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {changeSummary ? (
          <Alert severity="success">{changeSummary}</Alert>
        ) : null}
      </Stack>
    </Box>
  )
}
