import {
  Card,
  CardContent,
  Paper,
  Divider,
  Button,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { PAPER } from '../../../constants/dashboard'

export interface RecentPayrollsProps {
  onViewAll?: () => void
}

export function RecentPayrolls({ onViewAll }: RecentPayrollsProps) {
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
        <Stack
          direction="row"
          sx={{
            mb: 1.5,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5">Recent Payrolls</Typography>
          <Button size="small" onClick={onViewAll}>
            View all
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: PAPER.borderRadius,
            borderStyle: 'dashed',
            borderColor: alpha('#1f2f5f', PAPER.borderAlpha),
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(PAPER.bgColor, PAPER.bgAlpha),
            minHeight: 0,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Coming soon
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  )
}
