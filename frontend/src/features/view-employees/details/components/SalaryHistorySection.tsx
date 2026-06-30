import {
  Alert,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import type {
  EmployeeDetailsResponse,
  SalaryHistoryEntry,
} from '../../../employees/types/employees'
import { formatCurrencyWithCode } from '../../../../shared/utils/formatters'
import { DetailField } from './DetailPrimitives'
import { getDisplayValue } from './utils'

export function SalaryHistorySection({
  history,
  fallback,
}: {
  history: SalaryHistoryEntry[]
  fallback: EmployeeDetailsResponse['salaryStructure']
}) {
  const items = history.length
    ? history
    : [
        {
          effectiveFrom: fallback.effectiveFrom,
          currency: fallback.currency,
          baseSalaryMonthly: fallback.baseSalaryMonthly,
          netPayMonthly: fallback.netPayMonthly,
          ctcAnnual: fallback.ctcAnnual,
          totalEarnings: fallback.totalEarnings,
          totalDeductions: fallback.totalDeductions,
          changeSummary: 'Current salary structure',
        },
      ]

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Salary Revision History</Typography>
      {history.length === 0 ? (
        <Alert severity="info">
          No salary history records were provided. Showing the current salary
          structure instead.
        </Alert>
      ) : null}
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid
            key={`${item.effectiveFrom}-${item.baseSalaryMonthly}`}
            size={{ xs: 12, md: 6 }}
          >
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {getDisplayValue(item.changeSummary ?? null)}
                  </Typography>
                  <DetailField
                    label="Effective From"
                    value={item.effectiveFrom}
                  />
                  <DetailField
                    label="Base Salary (Monthly)"
                    value={formatCurrencyWithCode(
                      item.baseSalaryMonthly,
                      item.currency,
                    )}
                  />
                  <DetailField
                    label="Net Pay (Monthly)"
                    value={formatCurrencyWithCode(
                      item.netPayMonthly,
                      item.currency,
                    )}
                  />
                  <DetailField
                    label="CTC (Annual)"
                    value={formatCurrencyWithCode(
                      item.ctcAnnual,
                      item.currency,
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
