/**
 * Dashboard constants: colors, dimensions, configurations.
 * Centralized to avoid magic values scattered throughout components.
 */

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'

export const SIDEBAR_WIDTH = 272

export const HEADER_HEIGHT = 84

export const SUMMARY_CARDS_CONFIG = [
  {
    label: 'Total Employees',
    icon: PeopleAltOutlinedIcon,
    bgColor: '#e8d5f2',
    iconColor: '#7c4dff',
  },
  {
    label: 'Payroll Processed',
    icon: AccountBalanceWalletOutlinedIcon,
    bgColor: '#d0f0c0',
    iconColor: '#2e7d32',
  },
  {
    label: 'Total Deductions',
    icon: ReceiptLongOutlinedIcon,
    bgColor: '#ffe0b2',
    iconColor: '#e65100',
  },
  {
    label: 'Net Salary Paid',
    icon: SavingsOutlinedIcon,
    bgColor: '#bbdefb',
    iconColor: '#1565c0',
  },
] as const

export const QUICK_ACTIONS = [
  'Add Employee',
  'Mark Attendance',
  'Generate Payroll',
  'View Payslips',
] as const

export const NAV_ITEMS = [
  'Dashboard',
  'Employees',
  'Attendance',
  'Payroll',
  'Payslips',
  'Reports',
  'Settings',
] as const

export type NavItem = (typeof NAV_ITEMS)[number]

/** Nav items that have an implemented destination; others are shown as "coming soon". */
export const IMPLEMENTED_NAV_ITEMS: readonly NavItem[] = [
  'Dashboard',
  'Employees',
]

export const EMPLOYEE_DEPARTMENTS = [
  'ENGINEERING',
  'MARKETING',
  'FINANCE',
  'HR',
  'SALES',
] as const

export const EMPLOYEE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'ON_LEAVE',
  'TERMINATED',
] as const

// Chart constants
export const PAYROLL_CHART = {
  MAX_VALUE: 30000000, // 30L (in Lakhs)
  VIEW_BOX: '0 0 500 180',
  LINE_COLOR: '#5b7bfc',
  GRADIENT_START_COLOR: '#5b7bfc',
  GRADIENT_START_OPACITY: 0.6,
  GRID_COLOR: '#d0d0d0',
  AXIS_LABEL_COLOR: '#666',
} as const

// Summary card styling
export const SUMMARY_CARD = {
  borderRadius: 2,
  borderAlpha: 0.18,
  shadowColor: 'rgba(20, 35, 79, 0.08)',
  minHeight: 126,
} as const

// Card styling
export const CARD = {
  borderRadius: 2,
  borderAlpha: 0.28,
  bgAlpha: 0.8,
  bgColor: '#f4f6fb',
} as const

// Paper styling
export const PAPER = {
  borderRadius: 1.5,
  borderAlpha: 0.28,
  bgAlpha: 0.8,
  bgColor: '#f4f6fb',
} as const

export const NOTIFICATION_BADGE_COUNT = 3

export const USER_AVATAR_TEXT = 'H'
export const USER_NAME = 'HR Admin'
export const USER_ROLE = 'Admin'
export const APP_NAME = 'Salary Portal'
