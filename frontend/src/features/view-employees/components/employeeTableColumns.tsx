import { Typography } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import type { EmployeeListItem } from '../../employees/types/employees'
import {
  formatCurrencyWithSymbol,
  toTitleCase,
} from '../../../shared/utils/formatters'
import { EmployeeDetailsCell } from './EmployeeDetailsCell'
import { EmployeeRowActions } from './EmployeeRowActions'
import { EmployeeStatusChip } from '../../employees/components/EmployeeStatusChip'

const COLUMN_LAYOUT = {
  employeeDetails: 23,
  employeeId: 13,
  department: 13,
  designation: 20,
  basicSalary: 13,
  status: 10,
  actions: 8,
} as const

export interface CreateEmployeeColumnsOptions {
  currency: string
  onEditEmployeeClick: (employeeId: string) => void
  onViewEmployeeClick: (employeeId: string) => void
}

export function createEmployeeColumns({
  currency,
  onEditEmployeeClick,
  onViewEmployeeClick,
}: CreateEmployeeColumnsOptions): GridColDef<EmployeeListItem>[] {
  return [
    {
      field: 'employeeDetails',
      headerName: 'Employee Details',
      display: 'flex',
      headerAlign: 'left',
      align: 'left',
      flex: COLUMN_LAYOUT.employeeDetails,
      minWidth: 280,
      renderCell: ({ row }) => <EmployeeDetailsCell employee={row} />,
    },
    {
      field: 'employeeId',
      headerName: 'Employee ID',
      display: 'flex',
      headerAlign: 'left',
      align: 'left',
      flex: COLUMN_LAYOUT.employeeId,
      minWidth: 140,
      renderCell: ({ row }) => (
        <Typography variant="body1">{row.employeeId}</Typography>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      display: 'flex',
      headerAlign: 'left',
      align: 'left',
      flex: COLUMN_LAYOUT.department,
      minWidth: 140,
      renderCell: ({ row }) => (
        <Typography variant="body1">{toTitleCase(row.department)}</Typography>
      ),
    },
    {
      field: 'designation',
      headerName: 'Designation',
      display: 'flex',
      filterable: false,
      headerAlign: 'left',
      align: 'left',
      flex: COLUMN_LAYOUT.designation,
      minWidth: 190,
      renderCell: ({ row }) => (
        <Typography variant="body1">{toTitleCase(row.designation)}</Typography>
      ),
    },
    {
      field: 'basicSalary',
      headerName: 'Basic Salary',
      display: 'flex',
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      flex: COLUMN_LAYOUT.basicSalary,
      minWidth: 160,
      renderCell: ({ row }) => (
        <Typography variant="body1">
          {formatCurrencyWithSymbol(row.basicSalary, row.currency || currency)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      display: 'flex',
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      flex: COLUMN_LAYOUT.status,
      minWidth: 130,
      renderCell: ({ row }) => <EmployeeStatusChip status={row.status} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      display: 'flex',
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'left',
      flex: COLUMN_LAYOUT.actions,
      minWidth: 100,
      renderCell: ({ row }) => (
        <EmployeeRowActions
          employee={row}
          onEditEmployeeClick={onEditEmployeeClick}
          onViewEmployeeClick={onViewEmployeeClick}
        />
      ),
    },
  ]
}
