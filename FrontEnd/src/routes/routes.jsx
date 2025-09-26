import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../pages/login'
import Dashboard from '../pages/Dashboard/Dashboard'
import ProtectedRoute from '../components/ProtectedRoutes'
import EstadisticasDashboard from '../pages/Dashboard/components/EstadisticasDashboard'
import AreasComunes from '../pages/AreasComunes/AreasComunes'
import UsuariosDashboard from '../pages/Usuarios/Usuarios'
import Unidades from '../pages/Unidades/Unidades'
import PersonalDashboard from '../pages/Usuarios/Personal'
import Tareas from '../pages/Tareas/Tareas'
import ComunicadosPage from '../pages/Comunicados/ComunicadosPage'
import BitacoraDashboard from '../pages/Bitacora/Bitacora'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path='/login'
        element={
          !isAuthenticated ? <LoginForm /> : <Navigate to='/dashboard' />
        }
      />
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<EstadisticasDashboard />} /> {/* Default */}
        <Route path='estadisticas' element={<EstadisticasDashboard />} />
        <Route path='areas' element={<AreasComunes />} />
        <Route path='usuarios' element={<UsuariosDashboard />} />
        <Route path='personal' element={<PersonalDashboard />} />
        <Route path='unidades' element={<Unidades />} />
        <Route path='tareas' element={<Tareas />} />
        <Route path='comunicados' element={<ComunicadosPage />} />
        <Route path='bitacora' element={<BitacoraDashboard />} />
      </Route>

      <Route
        path='/'
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
      />
    </Routes>
  )
}

export default AppRoutes
