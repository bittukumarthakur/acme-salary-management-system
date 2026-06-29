import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Typography,
} from '@mui/material'
import { DataGrid, GridFooterContainer } from '@mui/x-data-grid'
import type { GridColDef } from '@mui/x-data-grid'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import type { EmployeeListItem, EmployeesMeta } from '../types/employees'
import {
  formatCurrencyWithSymbol,
  toTitleCase,
} from '../../../shared/utils/formatters'
import { EmployeeDetailsCell } from './EmployeeDetailsCell'
import { EmployeeStatusChip } from './EmployeeStatusChip'

const COLUMN_LAYOUT = {
  employeeDetails: 23,
  employeeId: 13,
  department: 13,
  designation: 20,
  basicSalary: 13,
  status: 10,
  actions: 8,
} as const

interface EmployeeRowActionsProps {
  employee: EmployeeListItem
  onEditEmployeeClick?: (employeeId: string) => void
  onViewEmployeeClick?: (employeeId: string) => void
}

function EmployeeRowActions({
  employee,
  onEditEmployeeClick,
  onViewEmployeeClick,
}: EmployeeRowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const menuOpen = Boolean(anchorEl)

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleView = () => {
    onViewEmployeeClick?.(employee.employeeId)
    handleClose()
  }

  const handleEdit = () => {
    onEditEmployeeClick?.(employee.employeeId)
    handleClose()
  }

  return (
    <>
      <IconButton
        aria-label={`Open actions for ${employee.fullName}`}
        onClick={handleOpen}
        size="small"
      >
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleView}>View</MenuItem>
      </Menu>
    </>
  )
}

type EmployeeGridRow = EmployeeListItem

export interface EmployeesTableCardProps {
  employees: EmployeeListItem[]
  meta: EmployeesMeta
  isLoading: boolean
  onPageChange: (page: number) => void
  onEditEmployeeClick?: (employeeId: string) => void
  onViewEmployeeClick?: (employeeId: string) => void
}

export function EmployeesTableCard({
  employees,
  meta,
  isLoading,
  onPageChange,
  onEditEmployeeClick,
  onViewEmployeeClick,
}: EmployeesTableCardProps) {
  const rows = useMemo<EmployeeGridRow[]>(() => employees, [employees])
  const startRecord =
    meta.totalRecords === 0 ? 0 : (meta.page - 1) * meta.pageLimit + 1
  const endRecord =
    meta.totalRecords === 0
      ? 0
      : Math.min(meta.page * meta.pageLimit, meta.totalRecords)

  const EmployeesFooter = () => (
    <GridFooterContainer sx={{ justifyContent: 'space-between', px: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Showing {startRecord} to {endRecord} of {meta.totalRecords} entries
      </Typography>
      <Pagination
        count={Math.max(meta.totalPages, 1)}
        page={Math.max(meta.page, 1)}
        variant="outlined"
        shape="rounded"
        onChange={(_event, nextPage) => {
          if (nextPage !== meta.page) {
            onPageChange(nextPage)
          }
        }}
      />
    </GridFooterContainer>
  )

  const columns = useMemo<GridColDef<EmployeeGridRow>[]>(
    () => [
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
          <Typography variant="body1">
            {toTitleCase(row.designation)}
          </Typography>
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
            {formatCurrencyWithSymbol(
              row.basicSalary,
              row.currency || meta.currency,
            )}
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
    ],
    [meta.currency, onEditEmployeeClick, onViewEmployeeClick],
  )

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.employeeId}
        loading={isLoading}
        slots={{
          footer: EmployeesFooter,
        }}
      />
    </Paper>
  )
}
