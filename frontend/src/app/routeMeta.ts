import { matchPath } from 'react-router-dom'
import type { NavItem } from '../shared/constants/dashboard'

export interface AppRouteMeta {
  activeNavItem: NavItem
  pageTitle: string
}

export const defaultRouteMeta: AppRouteMeta = {
  activeNavItem: 'Dashboard',
  pageTitle: 'Dashboard',
}

export const routeMetaRules: Array<{ pattern: string; meta: AppRouteMeta }> = [
  {
    pattern: '/employees/:employeeId/edit',
    meta: { activeNavItem: 'Employees', pageTitle: 'Edit Employee' },
  },
  {
    pattern: '/employees/add',
    meta: { activeNavItem: 'Employees', pageTitle: 'Add Employee' },
  },
  {
    pattern: '/employees/:employeeId',
    meta: { activeNavItem: 'Employees', pageTitle: 'View Employee' },
  },
  {
    pattern: '/employees',
    meta: { activeNavItem: 'Employees', pageTitle: 'Employees' },
  },
  {
    pattern: '/',
    meta: defaultRouteMeta,
  },
]

export function resolveRouteMeta(pathname: string): AppRouteMeta {
  for (const rule of routeMetaRules) {
    if (matchPath({ path: rule.pattern, end: true }, pathname)) {
      return rule.meta
    }
  }

  return defaultRouteMeta
}
