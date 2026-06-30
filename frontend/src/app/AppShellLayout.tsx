import { useLocation, useOutlet } from 'react-router-dom'
import { HomePage } from '../features/dashboard/pages/HomePage'
import { resolveRouteMeta } from './routeMeta'
import { useNavSelectionHandler } from './useNavSelectionHandler'

export function AppShellLayout() {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const handleSelectNavItem = useNavSelectionHandler()
  const { activeNavItem, pageTitle } = resolveRouteMeta(pathname)

  return (
    <HomePage
      activeNavItem={activeNavItem}
      onSelectNavItem={handleSelectNavItem}
      pageTitle={pageTitle}
      mainContent={outlet ?? undefined}
    />
  )
}
