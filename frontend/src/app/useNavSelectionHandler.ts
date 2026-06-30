import { useNavigate } from 'react-router-dom'
import type { NavItem } from '../shared/constants/dashboard'

export function useNavSelectionHandler() {
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
