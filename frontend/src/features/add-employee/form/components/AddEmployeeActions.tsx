import { Button, Stack } from '@mui/material'

interface AddEmployeeActionsProps {
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
  saveLabel?: string
  sticky?: boolean
}

export function AddEmployeeActions({
  isSaving,
  onCancel,
  onSave,
  saveLabel = 'Save Employee',
  sticky = true,
}: AddEmployeeActionsProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        justifyContent: 'flex-end',
        position: sticky ? 'sticky' : 'static',
        bottom: sticky ? 0 : 'auto',
        py: 1,
        bgcolor: 'background.default',
      }}
    >
      <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button variant="contained" onClick={onSave} disabled={isSaving}>
        {saveLabel}
      </Button>
    </Stack>
  )
}
