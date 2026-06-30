import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { SalaryHistoryEntry } from '../../../employees/types/employees'
import { formatCurrencyWithCode } from '../../../../shared/utils/formatters'
import { DetailField } from './DetailPrimitives'
import { CurrentBadge } from './CurrentBadge'
import { formatHistoryDate } from './utils'

interface SalaryHistoryCardProps {
  entry: SalaryHistoryEntry
}

/**
 * SalaryHistoryCard renders a single salary revision entry.
 * Displays: Effective From date, Base Salary, Net Pay, CTC
 * Shows a "Current" badge if isCurrent is true.
 */
export function SalaryHistoryCard({ entry }: SalaryHistoryCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
              }}
            >
              {entry.effectiveFrom
                ? formatHistoryDate(entry.effectiveFrom)
                : 'No date'}
            </Typography>
            {entry.isCurrent && <CurrentBadge />}
          </Stack>

          <DetailField
            label="Effective From"
            value={entry.effectiveFrom || 'N/A'}
          />
          <DetailField
            label="Base Salary (Monthly)"
            value={formatCurrencyWithCode(
              entry.baseSalaryMonthly,
              entry.currency,
            )}
          />
          <DetailField
            label="Net Pay (Monthly)"
            value={formatCurrencyWithCode(entry.netPayMonthly, entry.currency)}
          />
          <DetailField
            label="CTC (Annual)"
            value={formatCurrencyWithCode(entry.ctcAnnual, entry.currency)}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
