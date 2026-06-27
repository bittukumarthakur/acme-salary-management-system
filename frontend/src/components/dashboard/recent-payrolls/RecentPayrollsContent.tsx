import {
  Alert,
  Button,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import type { RecentPayrollRecord } from '../../../types/dashboard'
import { RecentPayrollsRow } from './RecentPayrollsRow'

const LOADING_ROW_COUNT = 7
const EMPTY_MESSAGE = 'No recent payrolls available.'
const DEFAULT_ERROR_MESSAGE = 'Unable to load recent payrolls.'
const LOADING_ROW_KEYS = Array.from(
  { length: LOADING_ROW_COUNT },
  (_, index) => index,
)

interface RecentPayrollsContentProps {
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry?: () => void
  visiblePayrolls: RecentPayrollRecord[]
  onViewPayroll?: (payrollId: string) => void
}

export function RecentPayrollsContent({
  isLoading,
  isError,
  errorMessage,
  onRetry,
  visiblePayrolls,
  onViewPayroll,
}: RecentPayrollsContentProps) {
  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        {errorMessage || DEFAULT_ERROR_MESSAGE}
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Stack spacing={1} aria-label="Loading recent payrolls section">
        <Typography variant="body2" color="text.secondary">
          Loading recent payrolls...
        </Typography>
        {LOADING_ROW_KEYS.map((value) => (
          <Skeleton
            data-testid="recent-payroll-loading-row"
            key={value}
            variant="rounded"
            height={34}
          />
        ))}
      </Stack>
    )
  }

  if (visiblePayrolls.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {EMPTY_MESSAGE}
      </Typography>
    )
  }

  return (
    <Stack divider={<Divider />}>
      {visiblePayrolls.map((payroll, index) => (
        <RecentPayrollsRow
          key={payroll.id}
          payroll={payroll}
          index={index}
          onViewPayroll={onViewPayroll}
        />
      ))}
    </Stack>
  )
}
