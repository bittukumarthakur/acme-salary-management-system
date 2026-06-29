import { Button, Stack } from '@mui/material'

interface AddEmployeeActionsProps {
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
}

export function AddEmployeeActions({
  isSaving,
  onCancel,
  onSave,
}: AddEmployeeActionsProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        justifyContent: 'flex-end',
        position: 'sticky',
        bottom: 0,
        py: 1,
        bgcolor: 'background.default',
      }}
    >
      <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button variant="contained" onClick={onSave} disabled={isSaving}>
        Save Employee
      </Button>
    </Stack>
  )
}
