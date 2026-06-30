import { useMemo } from 'react'
import { Pagination, Paper, Typography } from '@mui/material'
import { DataGrid, GridFooterContainer } from '@mui/x-data-grid'
import type {
  EmployeeListItem,
  EmployeesMeta,
} from '../../employees/types/employees'
import { createEmployeeColumns } from './employeeTableColumns'

type EmployeeGridRow = EmployeeListItem

export interface EmployeesTableCardProps {
  employees: EmployeeListItem[]
  meta: EmployeesMeta
  isLoading: boolean
  onPageChange: (page: number) => void
  onEditEmployeeClick: (employeeId: string) => void
  onViewEmployeeClick: (employeeId: string) => void
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

  const columns = useMemo(
    () =>
      createEmployeeColumns({
        currency: meta.currency,
        onEditEmployeeClick,
        onViewEmployeeClick,
      }),
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
