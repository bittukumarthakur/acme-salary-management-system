import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { SUMMARY_CARD } from '../../../constants/dashboard'
import type { SummaryCard as SummaryCardType } from '../../../types/dashboard'
import * as React from 'react'

export interface SummaryCardComponentProps {
  config: {
    label: string
    icon: React.ElementType
    bgColor: string
    iconColor: string
  }
  data?: SummaryCardType
  isLoading?: boolean
}

export function SummaryCard({
  config,
  data,
  isLoading,
}: SummaryCardComponentProps) {
  const isPositiveTrend = data?.metadata?.startsWith('↑')

  const renderMetadata = () => {
    if (!data?.metadata) return null

    if (isPositiveTrend) {
      const match = data.metadata.match(/^(↑\s+\d+)(.*)$/)
      if (match) {
        return (
          <Box sx={{ display: 'inline' }}>
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                color: '#2e7d32',
                fontSize: '1rem',
                display: 'inline',
              }}
            >
              {match[1]}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                fontSize: '1rem',
                display: 'inline',
              }}
            >
              {match[2]}
            </Typography>
          </Box>
        )
      }
    }

    return (
      <Typography
        sx={{
          fontWeight: 500,
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
      >
        {data.metadata}
      </Typography>
    )
  }

  const IconComponent = config.icon

  return (
    <Grid size={{ xs: 12, md: 6, xl: 3 }}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: SUMMARY_CARD.borderRadius,
          borderColor: alpha('#1f2f5f', SUMMARY_CARD.borderAlpha),
          boxShadow: `0 6px 18px ${SUMMARY_CARD.shadowColor}`,
          minHeight: SUMMARY_CARD.minHeight,
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
            {/* Left: Icon */}
            <Avatar
              sx={{
                bgcolor: config.bgColor,
                color: config.iconColor,
                width: 56,
                height: 56,
                flexShrink: 0,
              }}
            >
              <IconComponent fontSize="small" />
            </Avatar>

            {/* Right: Title, Value, Metadata */}
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {config.label}
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" height={28} width="60%" />
              ) : (
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {data?.value ?? 'N/A'}
                </Typography>
              )}
              {isLoading ? (
                <Skeleton variant="text" height={16} width="70%" />
              ) : (
                renderMetadata()
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}
