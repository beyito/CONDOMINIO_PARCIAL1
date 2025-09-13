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
  )
}
