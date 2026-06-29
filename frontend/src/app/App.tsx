import { HomePage } from '../features/dashboard/pages/HomePage'
import { EmployeesPage } from '../features/employees/pages/EmployeesPage'
import { AddEmployeePage } from '../features/add-employee/pages/AddEmployeePage'
import { EmployeeDetailsPage } from '../features/employees/pages/EmployeeDetailsPage'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import type { NavItem } from '../shared/constants/dashboard'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
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
function useNavSelectionHandler() {
  const navigate = useNavigate()

  return (item: NavItem) => {
    if (item === 'Employees') {
      navigate('/employees')
      return
    }

    if (item === 'Dashboard') {
      navigate('/')
    }
  }
}

function DashboardRoutePage() {
  const handleSelectNavItem = useNavSelectionHandler()

  return (
    <HomePage activeNavItem="Dashboard" onSelectNavItem={handleSelectNavItem} />
  )
}

function EmployeesRoutePage() {
  const navigate = useNavigate()
  const handleSelectNavItem = useNavSelectionHandler()

  return (
    <HomePage
      activeNavItem="Employees"
      onSelectNavItem={handleSelectNavItem}
      pageTitle="Employees"
      mainContent={
        <EmployeesPage
          onAddEmployeeClick={() => navigate('/employees/add')}
          onViewEmployeeClick={(employeeId) =>
            navigate(`/employees/${employeeId}`)
          }
        />
      }
    />
  )
}

function AddEmployeeRoutePage() {
  const handleSelectNavItem = useNavSelectionHandler()

  return (
    <HomePage
      activeNavItem="Employees"
      onSelectNavItem={handleSelectNavItem}
      pageTitle="Add Employee"
      mainContent={<AddEmployeePage />}
    />
  )
}

function EmployeeDetailsRoutePage() {
  const handleSelectNavItem = useNavSelectionHandler()

  return (
    <HomePage
      activeNavItem="Employees"
      onSelectNavItem={handleSelectNavItem}
      pageTitle="View Employee"
      mainContent={<EmployeeDetailsPage />}
    />
  )
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardRoutePage />} />
          <Route path="/employees" element={<EmployeesRoutePage />} />
          <Route path="/employees/add" element={<AddEmployeeRoutePage />} />
          <Route
            path="/employees/:employeeId"
            element={<EmployeeDetailsRoutePage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
export default App
