import { EmployeesPage } from '../features/employees/pages/EmployeesPage'
import { AddEmployeePage } from '../features/add-employee/pages/AddEmployeePage'
import { EmployeeDetailsPage } from '../features/employees/pages/EmployeeDetailsPage'
import { EditEmployeePage } from '../features/employees/pages/EditEmployeePage'
import { AppShellLayout } from './AppShellLayout'
import { appTheme } from './theme'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShellLayout />}>
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/add" element={<AddEmployeePage />} />
            <Route
              path="employees/:employeeId"
              element={<EmployeeDetailsPage />}
            />
            <Route
              path="employees/:employeeId/edit"
              element={<EditEmployeePage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
export default App
