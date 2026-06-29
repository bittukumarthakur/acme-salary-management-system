import { Card, CardContent } from '@mui/material'
import type { RecentPayrollRecord } from '../../types/dashboard'
import { RecentPayrollsContent } from './RecentPayrollsContent'
import { RecentPayrollsHeader } from './RecentPayrollsHeader'

const MAX_VISIBLE_PAYROLLS = 7

export interface RecentPayrollsSectionProps {
  payrolls: RecentPayrollRecord[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  onViewAll?: () => void
  onViewPayroll?: (payrollId: string) => void
}

function byNewestPayoutDate(
  first: RecentPayrollRecord,
  second: RecentPayrollRecord,
) {
  const firstDate = new Date(first.payoutDate).getTime()
  const secondDate = new Date(second.payoutDate).getTime()
  return secondDate - firstDate
}

export function RecentPayrollsSection({
  payrolls,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onViewAll,
  onViewPayroll,
}: RecentPayrollsSectionProps) {
  const visiblePayrolls = [...payrolls]
    .sort(byNewestPayoutDate)
    .slice(0, MAX_VISIBLE_PAYROLLS)

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <RecentPayrollsHeader onViewAll={onViewAll} />
        <RecentPayrollsContent
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={onRetry}
          visiblePayrolls={visiblePayrolls}
          onViewPayroll={onViewPayroll}
        />
      </CardContent>
    </Card>
  )
}
