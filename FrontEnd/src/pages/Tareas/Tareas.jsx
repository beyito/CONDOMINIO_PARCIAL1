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
  Filter
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getTareas } from '../../api/tareas/tareas'
import ModalCrearTarea from './components/ModalCrearTarea'
import ModalAsignarTarea from './components/ModalAsigarTareas'
import ApprovalModal from '../../components/AprovalModal'

export default function Tareas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFecha, setFilterFecha] = useState('')
  const [showModalCrear, setShowModalCrear] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedTarea, setSelectedTarea] = useState(null)
  const [selectedEditar, setSelectedEditar] = useState(null)
  const [showModalAsignar, setShowModalAsignar] = useState(false)

  const { data, loading, error, execute: fetchTareas } = useApi(getTareas)

  useEffect(() => {
    fetchTareas()
  }, [fetchTareas])

  const tareas = data?.data?.values || []

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hecho':
      case 'hecho':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSuccessAsignar = async () => {
    const res = await fetchTareas() // recargar todas las tareas
    // obtener la tarea actualizada del nuevo data
    const tareaActualizada = res?.data?.values.find(
      (t) => t.id === selectedTarea.id
    )
    setSelectedTarea(tareaActualizada)
    setShowApprovalModal(true)
  }

  const filteredTareas = tareas.filter((t) =>
    t.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const hoy = new Date().toISOString().split('T')[0]

  // Agrupar asignaciones por fecha
  const groupByFecha = (asignaciones) => {
    return asignaciones.reduce((acc, a) => {
      if (!acc[a.fecha_asignacion]) {
        acc[a.fecha_asignacion] = []
      }
      acc[a.fecha_asignacion].push(a)
      return acc
    }, {})
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
          onClick={() => setShowModalCrear(true)}
        >
          <Plus className='w-4 h-4' />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Crear Tarea */}
      {showModalCrear && (
        <ModalCrearTarea
          setShowModal={setShowModalCrear}
          onSuccess={() => {
            fetchTareas()
            setShowApprovalModal(true)
          }}
        />
      )}
      {/* Modal de asignar tarea */}
      {showModalAsignar && (
        <ModalAsignarTarea
          setShowModal={setShowModalAsignar}
          tarea={selectedTarea}
          fechaSeleccionada={selectedEditar}
          onSuccess={handleSuccessAsignar}
        />
      )}
      {showApprovalModal && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          message='¡La operación se ha completado exitosamente!'
        />
      )}

      {/* Lista de tareas o detalle */}
      {!selectedTarea ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {filteredTareas.map((tarea) => {
            const asignacionesHoy = tarea.asignaciones?.filter(
              (a) => a.fecha_asignacion === hoy
            )

            return (
              <div
                key={tarea.id}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => setSelectedTarea(tarea)}
              >
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  {tarea.titulo}
                </h3>
                <p className='text-gray-600 text-sm mb-4'>
                  {tarea.descripcion}
                </p>

                {asignacionesHoy && asignacionesHoy.length > 0 ? (
                  <div className='flex flex-col space-y-2'>
                    {asignacionesHoy.map((a) => (
                      <div
                        key={a.id}
                        className='flex items-center justify-between p-2 border rounded-lg'
                      >
                        <div className='flex items-center gap-2'>
                          <Users className='w-4 h-4 text-gray-500' />
                          <span className='text-sm'>{a.personal}</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            a.estado
                          )}`}
                        >
                          {a.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-400 text-sm italic'>
                    No hay asignación para hoy
                  </p>
                )}
                <div className='flex justify-between mt-4'>
                  <button
                    className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm'
                    onClick={() => {
                      setSelectedTarea(tarea) // tarea del card
                      setSelectedEditar(hoy) // enviar fecha del card
                      setShowModalAsignar(true)
                    }}
                  >
                    Asignar para Hoy
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          {/* Encabezado */}
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>
                {selectedTarea.titulo}
              </h2>
              <p className='text-gray-600'>{selectedTarea.descripcion}</p>
            </div>
            <button
              onClick={() => setSelectedTarea(null)}
              className='text-sm text-blue-600 hover:underline'
            >
              ← Volver
            </button>
          </div>

          {/* Buscador y filtro por fecha */}
          <div className='flex flex-col md:flex-row gap-4 mb-6'>
            <div className='relative flex-1 max-w-md'>
              <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Buscar empleado...'
                className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <input
              type='date'
              className='px-4 py-2 border border-gray-200 rounded-lg'
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
            />
          </div>

          {/* Agrupación por fecha */}
          {Object.entries(
            groupByFecha(
              selectedTarea.asignaciones.filter(
                (a) =>
                  a.personal.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (!filterFecha || a.fecha_asignacion === filterFecha)
              )
            )
          ).map(([fecha, asignaciones]) => (
            <div key={fecha} className='mb-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-gray-500' />
                {fecha}
              </h3>
              <div className='space-y-2'>
                {console.log('asignaciones :', asignaciones)}
                {asignaciones.map((a) => (
                  <div
                    key={a.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex items-center gap-2'>
                      <Users className='w-4 h-4 text-gray-500' />
                      <span className='text-sm'>{a.personal}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        a.estado
                      )}`}
                    >
                      {a.estado}
                    </span>
                  </div>
                ))}
              </div>
              <div className='flex justify-end mt-2'>
                <button
                  onClick={() => {
                    setSelectedTarea(selectedTarea) // la tarea actual
                    setSelectedEditar(fecha) // la fecha actual
                    setShowModalAsignar(true)
                  }}
                  className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm'
                >
                  Editar Asignaciones
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
