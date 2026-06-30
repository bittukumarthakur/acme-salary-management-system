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
  CircularProgress,
  Alert,
} from '@mui/material'
import { useSalaryHistory } from '../hooks/useSalaryHistory'
import { CurrentBadge } from './CurrentBadge'
import { formatHistoryDate } from './utils'
import { formatCurrencyWithCode } from '../../../../shared/utils/formatters'

/**
 * SalaryHistorySection displays salary revision history in a table layout.
 * Fetches data from: GET /api/v1/employees/:id/salary-history
 * Shows: Effective From, Base Salary (Monthly), CTC (Annual), Currency, Remarks
 * Current entry marked with "Current" badge in Remarks column
 */
export function SalaryHistorySection() {
  const { history, isLoading, error } = useSalaryHistory()

  // Sort by effectiveFrom descending (newest first) as per API contract
  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.effectiveFrom || '').getTime() -
      new Date(a.effectiveFrom || '').getTime(),
  )

  if (isLoading) {
    return (
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2">Loading salary history...</Typography>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Salary Revision History</Typography>
        <Alert severity="error">{error.message}</Alert>
      </Stack>
    )
  }

  if (sortedHistory.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Salary Revision History</Typography>
        <Typography variant="body2" color="textSecondary">
          No salary history available
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Salary Revision History</Typography>
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <Table
          sx={{
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, minWidth: '120px' }}>
                Effective From
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, minWidth: '150px' }}
                align="right"
              >
                Base Salary (Monthly)
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, minWidth: '140px' }}
                align="right"
              >
                CTC (Annual)
              </TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: '80px' }}>
                Currency
              </TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: '150px' }}>
                Remarks
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedHistory.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell sx={{ minWidth: '120px' }}>
                  {entry.effectiveFrom
                    ? formatHistoryDate(entry.effectiveFrom)
                    : 'No date'}
                </TableCell>
                <TableCell sx={{ minWidth: '150px' }} align="right">
                  {formatCurrencyWithCode(
                    entry.baseSalaryMonthly,
                    entry.currency || 'INR',
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: '140px' }} align="right">
                  {formatCurrencyWithCode(
                    entry.ctcAnnual,
                    entry.currency || 'INR',
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: '80px' }}>
                  {entry.currency || 'INR'}
                </TableCell>
                <TableCell sx={{ minWidth: '150px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
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
