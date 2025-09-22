import { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getTareas } from '../../api/tareas/tareas'
import ModalCrearTarea from './components/ModalCrearTarea'
import ModalAsignarTarea from './components/ModalAsigarTareas'
import ApprovalModal from '../../components/AprovalModal'

export default function Tareas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModalCrear, setShowModalCrear] = useState(false)
  const [showModalAsignar, setShowModalAsignar] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedTarea, setSelectedTarea] = useState(null)

  const { data, loading, error, execute: fetchTareas } = useApi(getTareas)

  useEffect(() => {
    fetchTareas()
  }, [fetchTareas])

  const tareas = data?.data?.values || []

  console.log(tareas)

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'hecho':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <AlertCircle className='w-4 h-4' />
      case 'hecho':
        return <CheckCircle className='w-4 h-4' />
      default:
        return <XCircle className='w-4 h-4' />
    }
  }

  const filteredTareas = tareas
    .filter((t) => filterStatus === 'all' || t.estado === filterStatus)
    .filter((t) => t.titulo.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleTareaClick = (tarea) => {
    setSelectedTarea(tarea)
    setShowModalAsignar(true)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-500'>Error al cargar las tareas</div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Gestión de Tareas
          </h1>
          <p className='text-gray-600 mt-1'>
            Crea, asigna y monitorea todas las tareas del personal
          </p>
        </div>
        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors'
          onClick={() => {
            setSelectedTarea(null)
            setShowModalCrear(true)
          }}
        >
          <Plus className='w-4 h-4' />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Modales */}
      {showModalCrear && (
        <ModalCrearTarea
          setShowModal={setShowModalCrear}
          onSuccess={() => {
            fetchTareas()
            setShowApprovalModal(true)
          }}
        />
      )}
      {showModalAsignar && selectedTarea && (
        <ModalAsignarTarea
          tarea={selectedTarea}
          setShowModal={setShowModalAsignar}
          onSuccess={() => {
            fetchTareas()
            setSelectedTarea(null)
            setShowApprovalModal(true)
          }}
        />
      )}
      {showApprovalModal && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false)
          }}
          message='¡La operación se ha completado exitosamente! Todos los datos han sido guardados correctamente.'
        />
      )}

      {/* Filters and Search */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
          <div className='relative flex-1 max-w-md'>
            <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar tareas...'
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
              <option value='pendiente'>Pendiente</option>
              <option value='hecho'>Hecho</option>
            </select>
            <button className='p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
              <Filter className='w-4 h-4 text-gray-600' />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Total Tareas</p>
              <p className='text-2xl font-bold text-gray-900'>
                {tareas.length}
              </p>
            </div>
            <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
              <Clock className='w-6 h-6 text-blue-600' />
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Pendientes</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {tareas.filter((t) => t.estado === 'pendiente').length}
              </p>
            </div>
            <div className='w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center'>
              <AlertCircle className='w-6 h-6 text-yellow-600' />
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Hechas</p>
              <p className='text-2xl font-bold text-green-600'>
                {tareas.filter((t) => t.estado === 'hecho').length}
              </p>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Tareas Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        {filteredTareas.map((tarea) => (
          <div
            key={tarea.id}
            className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => handleTareaClick(tarea)}
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                {tarea.titulo}
              </h3>
              <div className='flex items-center space-x-2'>
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    tarea.estado
                  )}`}
                >
                  {getStatusIcon(tarea.estado)}
                  <span className='capitalize'>
                    {tarea.estado || 'Sin Asignar'}
                  </span>
                </span>
                <button className='p-1 hover:bg-gray-100 rounded'>
                  <MoreVertical className='w-4 h-4 text-gray-400' />
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-gray-600 text-sm'>{tarea.descripcion}</p>
              <div className='flex flex-wrap gap-2 mt-2'>
                {tarea.asignaciones && tarea.asignaciones.length > 0 ? (
                  tarea.asignaciones.map((a) => (
                    <span
                      key={a.id}
                      className='bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1'
                    >
                      <Users className='w-3 h-3' />
                      <span>{a.personal}</span>
                    </span>
                  ))
                ) : (
                  <span className='text-gray-400 text-xs'>
                    Sin asignaciones
                  </span>
                )}
              </div>
            </div>

            <div className='mt-4 flex justify-end space-x-2'>
              <button
                className='p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors'
                onClick={() => handleTareaClick(tarea)}
              >
                Asignar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTareas.length === 0 && (
        <div className='text-center py-12'>
          <Clock className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No se encontraron tareas
          </h3>
          <p className='text-gray-600 mb-4'>
            No hay tareas que coincidan con tu búsqueda.
          </p>
          <button
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
            onClick={() => setShowModalCrear(true)}
          >
            Crear Primera Tarea
          </button>
        </div>
      )}
    </div>
  )
}
