import { useEffect } from 'react'
import {
  AlertTriangle,
  Building,
  DollarSign,
  Users,
  Wrench,
  User,
  Shield,
  Calendar
} from 'lucide-react'
import { getBitacora } from '../../../api/usuarios/usuarios'
import { useApi } from '../../../hooks/useApi'

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

export default function EstadisticasDashboard() {
  const {
    data: bitacoraData,
    loading,
    error,
    execute: fetchBitacora
  } = useApi(getBitacora)

  useEffect(() => {
    fetchBitacora()
  }, [fetchBitacora])

  const recentActivities = (bitacoraData?.data?.values || [])
    .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora)) // ordenar de más reciente a más antigua
    .slice(0, 4) // tomar solo las 4 últimas

  return (
    <div>
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
              <button
                className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                onClick={fetchBitacora}
              >
                Recargar
              </button>
            </div>

            {loading ? (
              <p>Cargando...</p>
            ) : error ? (
              <p className='text-red-500'>Error al cargar la bitácora</p>
            ) : recentActivities.length === 0 ? (
              <p className='text-gray-400 italic'>No hay actividad reciente</p>
            ) : (
              <div className='space-y-4'>
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className='flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors'
                  >
                    <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                      <User className='w-5 h-5 text-gray-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-gray-900 font-medium'>
                        {activity.accion}
                      </p>
                      <p className='text-gray-500 text-sm mt-1'>
                        {activity.fecha} {activity.hora} - IP:{' '}
                        {activity.ip || 'Desconocida'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      </div>
    </div>
  )
}
