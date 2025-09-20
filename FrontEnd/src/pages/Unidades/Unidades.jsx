import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Car,
  PawPrint,
  Users,
  Home,
  Search,
  X
} from 'lucide-react'
import { getUnidades } from '../../api/Unidades y Pertenencias/unidades_y_pertenencias'
import { useApi } from '../../hooks/useApi'
import ModalCrearUnidad from './components/ModalCrearUnidad'
import ModalCrearResidente from './components/ModalCrearResidente'

const Unidades = () => {
  const [showModal, setShowModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedUnidad, setSelectedUnidad] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todas')
  const [showModalType, setShowModalType] = useState(null)

  const { data, loading, error, execute } = useApi(getUnidades)

  useEffect(() => {
    execute()
  }, [])

  // datos desde el backend
  const unidades = data?.data?.values || []
  console.log(unidades)

  const estadosUnidad = ['activa', 'inactiva', 'mantenimiento']

  const filteredUnidades = unidades.filter((unidad) => {
    const matchesSearch =
      unidad.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidad.bloque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidad.numero.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterEstado === 'todas' || unidad.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-800'
      case 'inactiva':
        return 'bg-red-100 text-red-800'
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  } else if (error) {
    return <div className='text-red-500'>Error al obtener las unidades</div>
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Gestión de Unidades
          </h1>
          <p className='text-gray-600'>
            Gestione las unidades, vehículos, mascotas y residentes del
            condominio
          </p>
        </div>
        {/* Content */}
        <div className='bg-white rounded-lg shadow-sm'>
          <div className='p-6'>
            {/* Filters and Actions */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6'>
              <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4'>
                <div className='relative'>
                  <Search
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='text'
                    placeholder='Buscar unidades...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='todas'>Todos los estados</option>
                  {estadosUnidad.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setSelectedUnidad(null)
                  setShowModal(true)
                }}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors'
              >
                <Plus size={20} />
                <span>Nueva Unidad</span>
              </button>
            </div>

            {/* Unidades Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredUnidades.map((unidad) => (
                <div
                  key={unidad.id}
                  className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        {unidad.codigo}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        Bloque {unidad.bloque} - {unidad.numero}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(
                          unidad.estado
                        )}`}
                      >
                        {unidad.estado}
                      </span>

                      <div className='relative inline-block text-left'>
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === unidad.id ? null : unidad.id
                            )
                          }
                          className='p-2 text-gray-400 hover:text-blue-600 rounded-full transition-colors'
                        >
                          ⋮
                        </button>

                        {openMenuId === unidad.id && (
                          <div className='origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10'>
                            <div className='py-1'>
                              <button
                                onClick={() => {
                                  setSelectedUnidad(unidad)
                                  setOpenMenuId(null)
                                  setShowModalType('residente')
                                }}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                Añadir Residente
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUnidad(unidad)
                                  setOpenMenuId(null)
                                }}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                Añadir Vehículo
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUnidad(unidad)
                                  setOpenMenuId(null)
                                }}
                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                Añadir Mascota
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2 mb-4'>
                    <p className='text-sm'>
                      <span className='font-medium'>Piso:</span> {unidad.piso}
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Área:</span>{' '}
                      {unidad.area_m2} m²
                    </p>
                    <p className='text-sm'>
                      <span className='font-medium'>Tipo:</span>{' '}
                      {unidad.tipo_unidad}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className='flex justify-between text-sm text-gray-600 mb-4'>
                    <span className='flex items-center space-x-1'>
                      <Users size={16} />
                      <span>{unidad.residentes?.length || 0}</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <Car size={16} />
                      <span>{unidad.vehiculos?.length || 0}</span>
                    </span>
                    <span className='flex items-center space-x-1'>
                      <PawPrint size={16} />
                      <span>{unidad.mascotas?.length || 0}</span>
                    </span>
                  </div>
                  <div className='absolute top-4 right-4'></div>

                  {/* Actions */}
                  <div className='flex justify-between items-center'>
                    <button
                      onClick={() => {
                        setSelectedUnidad(unidad)
                        setShowDetails(true)
                      }}
                      className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                    >
                      Ver detalles
                    </button>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => {
                          setShowModal(true)
                          setSelectedUnidad(unidad)
                        }}
                        className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalles de Unidad */}
          {selectedUnidad && showDetails && (
            <div className='border-t border-gray-200 p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-xl font-semibold'>
                  Detalles de {selectedUnidad.codigo}
                </h3>
                <button
                  onClick={() => setSelectedUnidad(null)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={24} />
                </button>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Residentes */}
                <div>
                  <h4 className='text-lg font-medium text-gray-900 mb-3'>
                    Residentes
                  </h4>
                  <div className='space-y-2'>
                    {selectedUnidad.residentes?.map((residente) => (
                      <div
                        key={residente.id}
                        className='flex justify-between items-center p-3 bg-gray-50 rounded'
                      >
                        <div>
                          <p className='font-medium'>{residente.nombre}</p>
                          <p className='text-sm text-gray-600'>
                            {residente.rol || 'Residente'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehículos */}
                <div>
                  <h4 className='text-lg font-medium text-gray-900 mb-3'>
                    Vehículos
                  </h4>
                  <div className='space-y-2'>
                    {selectedUnidad.vehiculos?.map((vehiculo) => (
                      <div
                        key={vehiculo.id}
                        className='flex justify-between items-center p-3 bg-gray-50 rounded'
                      >
                        <div>
                          <p className='font-medium'>{vehiculo.placa}</p>
                          <p className='text-sm text-gray-600'>
                            {vehiculo.marca} {vehiculo.modelo}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mascotas */}
                <div>
                  <h4 className='text-lg font-medium text-gray-900 mb-3'>
                    Mascotas
                  </h4>
                  <div className='space-y-2'>
                    {selectedUnidad.mascotas?.map((mascota) => (
                      <div
                        key={mascota.id}
                        className='flex justify-between items-center p-3 bg-gray-50 rounded'
                      >
                        <div>
                          <p className='font-medium'>{mascota.nombre}</p>
                          <p className='text-sm text-gray-600'>
                            {mascota.tipo} - {mascota.raza}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <ModalCrearUnidad
            setShowModal={setShowModal}
            onSuccess={execute}
            unidad={selectedUnidad}
          />
        )}
        {showModalType === 'residente' && selectedUnidad && (
          <ModalCrearResidente
            setShowModal={setShowModalType}
            onSuccess={execute}
            unidad={selectedUnidad.id}
          />
        )}
      </div>
    </div>
  )
}

export default Unidades
