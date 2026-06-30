import { useNavigate } from 'react-router-dom'
import { EmployeesPage } from './EmployeesPage'

export function EmployeesRoutePage() {
  const navigate = useNavigate()

  return (
    <EmployeesPage
      onAddEmployeeClick={() => navigate('/employees/add')}
      onEditEmployeeClick={(employeeId) =>
        navigate(`/employees/${employeeId}/edit`)
      }
      onViewEmployeeClick={(employeeId) => navigate(`/employees/${employeeId}`)}
    />
  )
}
