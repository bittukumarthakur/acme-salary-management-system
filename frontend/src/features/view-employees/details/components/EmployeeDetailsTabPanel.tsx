import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import type { DetailsTab } from './tabPanel'

export function EmployeeDetailsTabPanel({
  activeTab,
  value,
  children,
}: {
  activeTab: DetailsTab
  value: DetailsTab
  children: ReactNode
}) {
  if (activeTab !== value) {
    return null
  }

  return (
    <Box
      id={`employee-tabpanel-${value}`}
      role="tabpanel"
      aria-labelledby={`employee-tab-${value}`}
    >
      {children}
    </Box>
  )
}
