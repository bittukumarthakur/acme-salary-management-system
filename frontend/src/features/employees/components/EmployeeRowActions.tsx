import { useState } from 'react'
import type { MouseEvent } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import type { EmployeeListItem } from '../types/employees'

export interface EmployeeRowActionsProps {
  employee: EmployeeListItem
  onEditEmployeeClick?: (employeeId: string) => void
  onViewEmployeeClick?: (employeeId: string) => void
}

export function EmployeeRowActions({
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