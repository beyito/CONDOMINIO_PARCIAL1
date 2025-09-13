import { useState, useEffect } from 'react'
import {
  MapPin,
  Users,
  Clock,
  DollarSign,
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  MoreVertical
} from 'lucide-react'
import { useApi } from '../../../hooks/useApi'
import { getareas } from '../../../api/areasComunes/areas'
import ModalCrearArea from './ModalCrearArea'
export default function AreasComunes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'

  const { data, loading, error, execute } = useApi(getareas)

  useEffect(() => {
    execute()
  }, [execute])

  // Obtenemos directamente el array de áreas
  const areas = data?.data?.values || []

  console.log(areas)

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'libre':
        return 'bg-green-100 text-green-800'
      case 'ocupada':
        return 'bg-red-100 text-red-800'
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'libre':
        return <CheckCircle className='w-4 h-4' />
      case 'ocupada':
        return <XCircle className='w-4 h-4' />
      case 'mantenimiento':
        return <AlertCircle className='w-4 h-4' />
      default:
        return <AlertCircle className='w-4 h-4' />
    }
  }

  const formatTime = (time) => {
    return time.slice(0, 5) // Formato HH:MM
  }

  const filteredAreas = areas.filter((area) => {
    const matchesSearch = area.nombre_area
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || area.estado === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAreaClick = (area) => {
    setSelectedArea(area)
    setShowModal(true)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Áreas Comunes</h1>
          <p className='text-gray-600 mt-1'>
            Gestiona y monitorea todas las áreas del condominio
          </p>
        </div>
        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors'
          onClick={() => {
            setSelectedArea(null) // al crear, no hay área seleccionada
            setShowModal(true) // abrimos el modal
          }}
        >
          <Plus className='w-4 h-4' />
          <span>Nueva Área</span>
        </button>
      </div>
      {showModal && selectedArea === null && (
        <ModalCrearArea setShowModal={setShowModal} />
      )}

      {/* Filters and Search */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
          <div className='relative flex-1 max-w-md'>
            <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar áreas...'
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center space-x-3'>
            <select
              className='px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value='all'>Todos los estados</option>
              <option value='libre'>Disponible</option>
              <option value='ocupada'>Ocupada</option>
              <option value='mantenimiento'>Mantenimiento</option>
            </select>
            <button className='p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
              <Filter className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Total Áreas</p>
              <p className='text-2xl font-bold text-gray-900'>{areas.length}</p>
            </div>
            <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
              <MapPin className='w-6 h-6 text-blue-600' />
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Disponibles</p>
              <p className='text-2xl font-bold text-green-600'>
                {areas.filter((a) => a.estado === 'libre').length}
              </p>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Ocupadas</p>
              <p className='text-2xl font-bold text-red-600'>
                {areas.filter((a) => a.estado === 'ocupada').length}
              </p>
            </div>
            <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center'>
              <XCircle className='w-6 h-6 text-red-600' />
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Mantenimiento</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {areas.filter((a) => a.estado === 'mantenimiento').length}
              </p>
            </div>
            <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center'>
              <AlertCircle className='w-6 h-6 text-yellow-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {filteredAreas.map((area) => (
          <div
            key={area.id_area}
            className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => handleAreaClick(area)}
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                {area.nombre_area}
              </h3>
              <div className='flex items-center space-x-2'>
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    area.estado
                  )}`}
                >
                  {getStatusIcon(area.estado)}
                  <span className='capitalize'>{area.estado}</span>
                </span>
                <button className='p-1 hover:bg-gray-100 rounded'>
                  <MoreVertical className='w-4 h-4 text-gray-400' />
                </button>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center space-x-3 text-sm text-gray-600'>
                <Users className='w-4 h-4' />
                <span>Capacidad: {area.capacidad} personas</span>
              </div>
              <div className='flex items-center space-x-3 text-sm text-gray-600'>
                <Clock className='w-4 h-4' />
                <span>
                  {formatTime(area.apertura_hora)} -{' '}
                  {formatTime(area.cierre_hora)}
                </span>
              </div>
              <div className='flex items-center space-x-3 text-sm text-gray-600'>
                <Calendar className='w-4 h-4' />
                <span>{area.dias_habiles}</span>
              </div>
              {area.requiere_pago && (
                <div className='flex items-center space-x-3 text-sm text-green-600'>
                  <DollarSign className='w-4 h-4' />
                  <span>${area.precio_por_bloque} por bloque</span>
                </div>
              )}
            </div>

            <div className='mt-4 pt-4 border-t border-gray-100'>
              <p className='text-sm text-gray-600 line-clamp-2'>
                {area.reglas}
              </p>
            </div>

            <div className='mt-4 flex justify-end space-x-2'>
              <button className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'>
                <Eye className='w-4 h-4' />
              </button>
              <button className='p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors'>
                <Edit className='w-4 h-4' />
              </button>
              <button className='p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors'>
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAreas.length === 0 && (
        <div className='text-center py-12'>
          <MapPin className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No se encontraron áreas
          </h3>
          <p className='text-gray-600 mb-4'>
            No hay áreas que coincidan con tu búsqueda.
          </p>
          <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'>
            Crear Primera Área
          </button>
        </div>
      )}
    </div>
  )
}
