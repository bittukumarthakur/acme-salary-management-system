import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { NAV_ITEMS, SIDEBAR_WIDTH, APP_NAME } from '../../constants/dashboard'

export interface SidebarProps {
  collapsed?: boolean
  onCollapse?: () => void
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        px: 3,
        py: 3,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '10px 0 28px rgba(10, 24, 60, 0.22)',
      }}
    >
      {/* Logo Section */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 4, alignItems: 'center' }}>
        <Avatar
          sx={{
            bgcolor: alpha('#ffffff', 0.18),
            color: 'primary.contrastText',
          }}
        >
          S
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {APP_NAME}
        </Typography>
      </Stack>

      {/* Navigation Menu */}
      <List sx={{ p: 0, gap: 0.75, display: 'grid' }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton
              component="button"
              selected={item === 'Dashboard'}
              sx={{
                borderRadius: 1.5,
                minHeight: 42,
                color: 'inherit',
                '&.Mui-selected': {
                  bgcolor: alpha('#ffffff', 0.18),
                  '&:hover': { bgcolor: alpha('#ffffff', 0.22) },
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                    {item}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Collapse Button */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onCollapse}
          sx={{ borderRadius: 1.5, fontWeight: 700 }}
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </Button>
      </Box>
    </Box>
  )
}
