import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Box,
  Paper,
} from '@mui/material'
import { useSalaryHistory } from '../hooks/useSalaryHistory'
import { CurrentBadge } from './CurrentBadge'
import { formatHistoryDate } from './utils'
import { formatCurrencyWithCode } from '../../../../shared/utils/formatters'

/**
 * SalaryHistorySection displays salary revision history in a table layout.
 * Shows: Effective From, Base Salary (Monthly), CTC (Annual), Currency, Remarks
 * Current entry marked with "Current" badge in Remarks column
 */
export function SalaryHistorySection() {
  const history = useSalaryHistory()

  // Sort by effectiveFrom descending (newest first) as per API contract
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.effectiveFrom || '').getTime() -
      new Date(a.effectiveFrom || '').getTime(),
  )

  if (sortedHistory.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Salary Revision History</Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Salary Revision History</Typography>
      <TableContainer
        component={Paper}
        sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Effective From</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                Base Salary (Monthly)
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>CTC (Annual)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Currency</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedHistory.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {entry.effectiveFrom
                    ? formatHistoryDate(entry.effectiveFrom)
                    : 'No date'}
                </TableCell>
                <TableCell>
                  {formatCurrencyWithCode(
                    entry.baseSalaryMonthly,
                    entry.currency,
                  )}
                </TableCell>
                <TableCell>
                  {formatCurrencyWithCode(entry.ctcAnnual, entry.currency)}
                </TableCell>
                <TableCell>{entry.currency}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {entry.changeSummary
                        ? entry.changeSummary
                        : 'Salary Revision'}
                    </Typography>
                    {entry.isCurrent && <CurrentBadge />}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
