import { HomePage } from './pages/HomePage'
import { EmployeesPage } from './pages/EmployeesPage'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { NavItem } from './constants/dashboard'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d1f4f',
      contrastText: '#f5f7ff',
    },
    secondary: {
      main: '#4f6cd9',
    },
    background: {
      default: '#eef2f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#121b32',
      secondary: '#5f6882',
    },
    divider: '#d9dfeb',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h4: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontSize: 30,
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontSize: 20,
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Space Grotesk", "Manrope", sans-serif',
      fontWeight: 700,
    },
  },
})
/**
 * Application shell.
 *
 * For now this simply renders the placeholder HomePage. Deferred providers will
 * be added here in later feature plans, for example:
 *   - MUI <ThemeProvider> + <CssBaseline>
 *   - React Query <QueryClientProvider>
 *   - React Router <RouterProvider> / routes
 */
function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isEmployeesRoute = location.pathname === '/employees'
  const activeNavItem: NavItem = isEmployeesRoute ? 'Employees' : 'Dashboard'

  const handleSelectNavItem = (item: NavItem) => {
    if (item === 'Employees') {
      navigate('/employees')
      return
    }

    if (item === 'Dashboard') {
      navigate('/')
    }
  }

  return isEmployeesRoute ? (
    <HomePage
      activeNavItem={activeNavItem}
      onSelectNavItem={handleSelectNavItem}
      mainContent={<EmployeesPage />}
      pageTitle="Employees"
    />
  ) : (
    <HomePage
      activeNavItem={activeNavItem}
      onSelectNavItem={handleSelectNavItem}
    />
  )
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />} />
          <Route path="/employees" element={<AppShell />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
export default App
