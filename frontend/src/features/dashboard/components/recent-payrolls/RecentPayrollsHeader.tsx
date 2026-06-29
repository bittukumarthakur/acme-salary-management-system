import { Divider, Link, Stack, Typography } from '@mui/material'

interface RecentPayrollsHeaderProps {
  onViewAll?: () => void
}

export function RecentPayrollsHeader({ onViewAll }: RecentPayrollsHeaderProps) {
  return (
    <>
      <Stack
        direction="row"
        sx={{
          mb: 0.75,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">Recent Payrolls</Typography>
        <Link
          href="#"
          underline="hover"
          sx={{ fontWeight: 600 }}
          onClick={(event) => {
            event.preventDefault()
            onViewAll?.()
          }}
        >
          View all
        </Link>
      </Stack>
      <Divider sx={{ mb: 0.5, mx: -2 }} />
    </>
  )
}
