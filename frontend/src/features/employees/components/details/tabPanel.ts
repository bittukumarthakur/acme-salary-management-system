export type DetailsTab = 'overview' | 'salary-structure' | 'salary-history'

export function getTabA11yProps(tab: DetailsTab) {
  return {
    id: `employee-tab-${tab}`,
    'aria-controls': `employee-tabpanel-${tab}`,
  }
}
