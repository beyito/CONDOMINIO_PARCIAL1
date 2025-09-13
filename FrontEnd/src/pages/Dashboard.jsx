import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  Settings,
  Bell,
  Calendar,
  Shield,
  TrendingUp,
  Activity,
  MapPin,
  Car,
  Wrench,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Menu,
  X,
  User,
  LogOut,
  Building,
  Zap,
  Wifi,
  Camera
} from 'lucide-react'

export default function CondominioSmartDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  const navigate = useNavigate()

  const { user, logout } = useAuth()
  // Datos del contexto del usuario
  const userContext = user ? { ...user } : null

  // Datos simulados para el dashboard
  const stats = [
    {
      title: 'Unidades Totales',
      value: '248',
      change: '+2.1%',
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      title: 'Residentes Activos',
      value: '542',
      change: '+5.4%',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Ingresos Mensuales',
      value: '$47,250',
      change: '+8.2%',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Alertas Activas',
      value: '7',
      change: '-12%',
      icon: AlertTriangle,
      color: 'bg-orange-500'
    }
  ]

  const recentActivities = [
    {
      type: 'access',
      message: 'Nuevo residente registrado - Apt 304',
      time: '5 min',
      icon: User
    },
    {
      type: 'maintenance',
      message: 'Mantenimiento completado - Ascensor B',
      time: '1 hr',
      icon: Wrench
    },
    {
      type: 'security',
      message: 'Alerta de seguridad - Estacionamiento',
      time: '2 hrs',
      icon: Shield
    },
    {
      type: 'payment',
      message: 'Pago recibido - Unidad 205',
      time: '3 hrs',
      icon: DollarSign
    }
  ]

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', active: true },
    { id: 'residentes', icon: Users, label: 'Residentes' },
    { id: 'areas', icon: MapPin, label: 'Áreas Comunes' },
    { id: 'seguridad', icon: Shield, label: 'Seguridad' },
    { id: 'mantenimiento', icon: Wrench, label: 'Mantenimiento' },
    { id: 'finanzas', icon: DollarSign, label: 'Finanzas' },
    { id: 'smart', icon: Zap, label: 'Dispositivos IoT' },
    { id: 'configuracion', icon: Settings, label: 'Configuración' }
  ]

  const smartDevices = [
    {
      name: 'Cámaras de Seguridad',
      status: 'online',
      count: 24,
      color: 'text-green-500'
    },
    {
      name: 'Control de Acceso',
      status: 'online',
      count: 8,
      color: 'text-green-500'
    },
    {
      name: 'Sensores de Movimiento',
      status: 'warning',
      count: 15,
      color: 'text-yellow-500'
    },
    {
      name: 'Sistema de Riego',
      status: 'offline',
      count: 6,
      color: 'text-red-500'
    }
  ]

  const getUserDisplayName = () => {
    if (userContext.first_name || userContext.last_name) {
      return `${userContext.first_name || ''} ${
        userContext.last_name || ''
      }`.trim()
    }
    return userContext.username || 'Usuario'
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-xl transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Logo y Toggle */}
        <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
          <div
            className={`flex items-center space-x-3 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center'>
              <Building className='w-5 h-5 text-white' />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  SmartCondominio
                </h1>
                <p className='text-xs text-gray-500'>Administración</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
          >
            {sidebarOpen ? (
              <X className='w-4 h-4' />
            ) : (
              <Menu className='w-4 h-4' />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className='p-4 border-b border-gray-100'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center'>
              <User className='w-5 h-5 text-white' />
            </div>
            {sidebarOpen && (
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {getUserDisplayName()}
                </p>
                <p className='text-xs text-gray-500 truncate'>
                  {userContext.rol}
                </p>
                <p className='text-xs text-gray-400 truncate'>
                  {userContext.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className='flex-1 p-4 space-y-2'>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
              {sidebarOpen && (
                <>
                  <span className='font-medium'>{item.label}</span>
                  <ChevronRight className='w-4 h-4 ml-auto' />
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className='p-4 border-t border-gray-100'>
          <button
            className='w-full flex items-center space-x-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all'
            onClick={handleLogout}
          >
            <LogOut className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
            {sidebarOpen && <span className='font-medium'>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Dashboard General
              </h1>
              <p className='text-gray-600 mt-1'>
                Gestión integral del condominio inteligente
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl'>
                <Bell className='w-5 h-5' />
                <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full'></span>
              </button>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full'></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className='p-6 space-y-6'>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
            {stats.map((stat, index) => (
              <div
                key={index}
                className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
              >
                <div className='flex items-center justify-between mb-4'>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className='w-6 h-6 text-white' />
                  </div>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.change.startsWith('+')
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-1'>
                  {stat.value}
                </h3>
                <p className='text-gray-600 text-sm'>{stat.title}</p>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            {/* Recent Activity */}
            <div className='xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Actividad Reciente
                </h2>
                <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                  Ver todo
                </button>
              </div>
              <div className='space-y-4'>
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className='flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors'
                  >
                    <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                      <activity.icon className='w-5 h-5 text-gray-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-gray-900 font-medium'>
                        {activity.message}
                      </p>
                      <p className='text-gray-500 text-sm mt-1'>
                        Hace {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Devices Status */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>
                Dispositivos IoT
              </h2>
              <div className='space-y-4'>
                {smartDevices.map((device, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'
                  >
                    <div>
                      <p className='font-medium text-gray-900'>{device.name}</p>
                      <p className='text-sm text-gray-600'>
                        {device.count} dispositivos
                      </p>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        device.status === 'online'
                          ? 'bg-green-500'
                          : device.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
              <button className='w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium'>
                Gestionar Dispositivos
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              Acciones Rápidas
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <button className='p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group'>
                <Users className='w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform' />
                <p className='font-medium text-gray-900'>Nuevo Residente</p>
              </button>
              <button className='p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all group'>
                <Calendar className='w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform' />
                <p className='font-medium text-gray-900'>Reservar Área</p>
              </button>
              <button className='p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group'>
                <Wrench className='w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform' />
                <p className='font-medium text-gray-900'>Mantenimiento</p>
              </button>
              <button className='p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all group'>
                <Shield className='w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform' />
                <p className='font-medium text-gray-900'>Reporte</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
