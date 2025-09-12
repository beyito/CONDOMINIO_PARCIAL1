import { Route, Routes } from 'react-router-dom'
import LoginForm from '../pages/login'
import Dashboard from '../pages/Dashboard'
const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<LoginForm />} />
      <Route path='/dashboard' element={<Dashboard />} />
      {/* aquí agregas más rutas */}
    </Routes>
  )
}

export default AppRoutes
