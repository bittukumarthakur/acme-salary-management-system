import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  alpha,
} from '@mui/material'
import { QUICK_ACTIONS, PAPER } from '../../../../shared/constants/dashboard'

export interface QuickActionsProps {
  onActionClick?: (action: string) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <Box sx={{ flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ flex: 1 }}>
            {QUICK_ACTIONS.map((action) => (
              <Grid key={action} size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                <Paper
                  component="button"
                  variant="outlined"
                  onClick={() => onActionClick?.(action)}
                  sx={{
                    borderRadius: PAPER.borderRadius,
                    borderStyle: 'dashed',
                    borderColor: alpha('#1f2f5f', PAPER.borderAlpha),
                    height: '100%',
                    px: 1.25,
                    py: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    bgcolor: alpha(PAPER.bgColor, PAPER.bgAlpha),
                    cursor: 'pointer',
                    border: '1px dashed',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(PAPER.bgColor, PAPER.bgAlpha + 0.1),
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Coming soon
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
