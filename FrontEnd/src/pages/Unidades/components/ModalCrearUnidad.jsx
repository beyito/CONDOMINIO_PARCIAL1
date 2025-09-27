import { useState } from 'react'
import { useApi } from '../../../hooks/useApi'
import {
  postUnidades,
  putUnidades
} from '../../../api/Unidades y Pertenencias/unidades_y_pertenencias'
import { XCircle } from 'lucide-react'

import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

const estadosUnidad = ['activa', 'inactiva', 'mantenimiento']
const tiposUnidad = [
  'apartamento',
  'casa',
  'local',
  'oficina',
  'deposito',
  'parqueadero',
  'otro'
]

export const ModalCrearUnidad = ({ setShowModal, onSuccess, unidad }) => {
  const [formData, setFormData] = useState(
    unidad || {
      codigo: '',
      bloque: '',
      piso: 0,
      numero: '',
      area_m2: '',
      precio: 0,
      estado: 'activa',
      tipo_unidad: 'apartamento'
    }
  )

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const { execute, loading, error } = useApi(
    unidad ? putUnidades : postUnidades
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await execute(formData)
      console.log('Unidad creada:', response.data)
      setShowApprovalModal(true)
    } catch (err) {
      console.error('Error al crear unidad:', err)
      setShowErrorModal(true)
    }
  }

  return (
    <>
      <div className='fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50'>
        <div className='bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {unidad ? 'Editar Unidad' : 'Crear Unidad'}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <XCircle className='w-6 h-6 text-gray-400' />
            </button>
          </div>
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Código
              </label>
              <input
                type='text'
                value={formData.codigo || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codigo: e.target.value.toUpperCase()
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Bloque
              </label>
              <input
                type='text'
                value={formData.bloque || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bloque: e.target.value.toUpperCase()
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Piso
              </label>
              <input
                type='number'
                value={formData.piso || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    piso: parseInt(e.target.value) || 0
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                min='0'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Número
              </label>
              <input
                type='text'
                value={formData.numero || ''}
                onChange={(e) =>
                  setFormData({ ...formData, numero: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Área m²
              </label>
              <input
                type='number'
                step='0.01'
                value={formData.area_m2 || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    area_m2: parseFloat(e.target.value) || 0
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                min='0.01'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Precio
              </label>
              <input
                type='number'
                step='0.01'
                value={formData.precio || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precio: e.target.value // lo dejas como string
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                min='0.01'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Estado
              </label>
              <select
                value={formData.estado || 'activa'}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {estadosUnidad.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Tipo de unidad
              </label>
              <select
                value={formData.tipo_unidad || 'apartamento'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo_unidad: e.target.value
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {tiposUnidad.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowModal(false)}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {formData.id ? 'Actualizar' : loading ? 'Cargando...' : 'Crear'}
              </button>
            </div>
            {/* Modales */}
            <ApprovalModal
              isOpen={showApprovalModal}
              onClose={() => {
                setShowApprovalModal(false)
                setShowModal(false)
                onSuccess()
              }}
              message='¡La operación se ha completado exitosamente! Todos los datos han sido guardados correctamente.'
            />
            <ErrorModal
              isOpen={showErrorModal}
              onClose={() => setShowErrorModal(false)}
              message={`Ha ocurrido un error inesperado. ${
                error?.message || error
              }`}
            />
          </form>
        </div>
      </div>
    </>
  )
}

export default ModalCrearUnidad
