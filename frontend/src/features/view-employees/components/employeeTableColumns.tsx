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
      flex: 1.6,
      minWidth: 300,
      renderCell: ({ row }) => <EmployeeDetailsCell employee={row} />,
    },
    {
      field: 'employeeId',
      headerName: 'Employee ID',
      display: 'flex',
      headerAlign: 'left',
      align: 'left',
      flex: 0.8,
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
      flex: 0.8,
      minWidth: 160,
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
      flex: 1,
      minWidth: 180,
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
      flex: 0.9,
      minWidth: 170,
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
      flex: 0.7,
      minWidth: 140,
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
      flex: 0.6,
      minWidth: 120,
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
