import { Box, Typography } from '@mui/material'

/**
 * CurrentBadge component for salary history entries.
 * Displays a small light green pill/tag with dark green text for visibility.
 * Used only on the most recent (isCurrent: true) salary history entry.
 */
export function CurrentBadge() {
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: '#c8e6c9',
        color: '#2e7d32',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontSize: '0.75rem',
        }}
      >
        Current
      </Typography>
    </Box>
  )
}
