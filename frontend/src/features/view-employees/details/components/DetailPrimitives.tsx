import { Box, Stack, Typography } from '@mui/material'
import type { ElementType } from 'react'
import { getDisplayValue } from './utils'

export function DetailField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {getDisplayValue(value)}
      </Typography>
    </Stack>
  )
}

export function IconMetaRow({
  icon: Icon,
  text,
}: {
  icon: ElementType
  text: string
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Icon sx={{ fontSize: 20, color: 'text.secondary' }} />
      <Typography color="text.primary">{text}</Typography>
    </Stack>
  )
}

export function SummaryInfoTile({
  icon: Icon,
  label,
  value,
  showRightBorder = true,
}: {
  icon: ElementType
  label: string
  value: string | null | undefined
  showRightBorder?: boolean
}) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        width: '100%',
        minWidth: 0,
        alignItems: 'center',
        borderRight: showRightBorder ? { md: '1px solid' } : 'none',
        borderColor: 'divider',
        pr: { md: 2 },
        minHeight: { xs: 40, md: 44 },
      }}
    >
      <Box
        sx={{
          width: { xs: 34, md: 38 },
          height: { xs: 34, md: 38 },
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(79, 108, 217, 0.08)',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            minWidth: 0,
            whiteSpace: { xs: 'normal', md: 'nowrap' },
            overflow: { md: 'hidden' },
            textOverflow: { md: 'ellipsis' },
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            lineHeight: 1.2,
          }}
        >
          {getDisplayValue(value)}
        </Typography>
      </Stack>
    </Stack>
  )
}

export function JobInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(79, 108, 217, 0.08)',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Stack
        direction="row"
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: {
            xs: '140px minmax(0, 1fr)',
            sm: '180px minmax(0, 1fr)',
          },
          columnGap: 1.5,
          alignItems: 'center',
        }}
      >
        <Typography color="text.secondary">{label}</Typography>
        <Typography
          sx={{ fontWeight: 600, textAlign: 'left', justifySelf: 'start' }}
        >
          {getDisplayValue(value)}
        </Typography>
      </Stack>
    </Stack>
  )
}
