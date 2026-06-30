import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined'
import { Avatar, Button, Stack, Tooltip, Typography } from '@mui/material'

interface ProfileAvatarSectionProps {
  src?: string
  alt: string
  initials: string
}

export function ProfileAvatarSection({
  src,
  alt,
  initials,
}: ProfileAvatarSectionProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{ alignItems: 'center', width: '100%', pt: { xs: 0, md: 1 } }}
    >
      <Avatar
        src={src}
        alt={alt}
        sx={{
          width: { xs: 112, md: 144 },
          height: { xs: 112, md: 144 },
          fontSize: { xs: 34, md: 42 },
          bgcolor: 'primary.main',
          boxShadow: '0 12px 24px rgba(13, 31, 79, 0.14)',
        }}
      >
        {initials}
      </Avatar>
      <Tooltip title="Coming soon" arrow>
        <span>
          <Button
            variant="outlined"
            disabled
            startIcon={<UploadOutlinedIcon />}
            sx={{ minWidth: 208 }}
          >
            Change Photo
          </Button>
        </span>
      </Tooltip>
      <Typography variant="body2" color="text.secondary">
        JPG, PNG (Max. 2MB)
      </Typography>
    </Stack>
  )
}
