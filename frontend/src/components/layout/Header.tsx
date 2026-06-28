import {
  Avatar,
  Badge,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import {
  HEADER_HEIGHT,
  NOTIFICATION_BADGE_COUNT,
  USER_AVATAR_TEXT,
  USER_NAME,
  USER_ROLE,
} from '../../constants/dashboard'

export interface HeaderProps {
  onMenuClick?: () => void
  notificationCount?: number
  userName?: string
  userRole?: string
  userAvatarText?: string
  title?: string
}

export function Header({
  onMenuClick,
  notificationCount = NOTIFICATION_BADGE_COUNT,
  userName = USER_NAME,
  userRole = USER_ROLE,
  userAvatarText = USER_AVATAR_TEXT,
  title = 'Dashboard',
}: HeaderProps) {
  return (
    <Paper
      square
      elevation={0}
      sx={{
        height: HEADER_HEIGHT,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      {/* Left: Menu & Title */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <IconButton
          aria-label="Open menu"
          color="primary"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h4">{title}</Typography>
      </Stack>

      {/* Right: Notifications & User Profile */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <IconButton aria-label="Notifications" color="primary">
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
        <Chip
          avatar={
            <Avatar sx={{ bgcolor: 'secondary.main' }}>{userAvatarText}</Avatar>
          }
          label={
            <Stack sx={{ minWidth: 110 }}>
              <Typography variant="subtitle2" noWrap>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {userRole}
              </Typography>
            </Stack>
          }
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            py: 2.75,
            px: 0.75,
            bgcolor: 'background.paper',
          }}
        />
      </Stack>
    </Paper>
  )
}
