import { Box, Grid } from '@mui/material'
import { SUMMARY_CARDS_CONFIG } from '../../../../shared/constants/dashboard'
import type { DashboardData } from '../../types/dashboard'
import { SummaryCard } from './SummaryCard'

export interface SummaryCardsProps {
  data?: DashboardData
  isLoading?: boolean
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  return (
    <Box sx={{ flex: '0 0 auto', minHeight: 0 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {SUMMARY_CARDS_CONFIG.map((cardConfig) => {
          const cardData = data?.summaryCards.find(
            (card) => card.label === cardConfig.label,
          )
          return (
            <SummaryCard
              key={cardConfig.label}
              config={cardConfig}
              data={cardData}
              isLoading={isLoading}
            />
          )
        })}
      </Grid>
    </Box>
  )
}
