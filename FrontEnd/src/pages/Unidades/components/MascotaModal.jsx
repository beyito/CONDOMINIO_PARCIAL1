import { useState } from 'react'
import { useApi } from '../../../hooks/useApi'
import {
  postMascota,
  updateMascota
} from '../../../api/Unidades y Pertenencias/unidades_y_pertenencias'
import { XCircle } from 'lucide-react'

import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

const tiposMascota = ['perro', 'gato', 'ave', 'pez', 'otro']

export const ModalCrearMascota = ({
  setShowModal,
  onSuccess,
  mascota,
  unidad
}) => {
  const [formData, setFormData] = useState({
    id: mascota?.id || null,
    nombre: mascota?.nombre || '',
    tipo_mascota: mascota?.tipo_mascota || 'otro',
    raza: mascota?.raza || '',
    color: mascota?.color || '',
    peso_kg: mascota?.peso_kg || '',
    unidad: mascota?.unidad || unidad // se setea automáticamente
  })

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const { execute, loading, error } = useApi(
    mascota ? updateMascota : postMascota
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'peso_kg' ? parseFloat(value) || '' : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await execute(formData)
      console.log('Mascota guardada:', response.data)
      setShowApprovalModal(true)
    } catch (err) {
      console.error('Error al guardar mascota:', err)
      setShowErrorModal(true)
    }
  }

  return (
    <>
      <div className='fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50'>
        <div className='bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {mascota ? 'Editar Mascota' : 'Registrar Mascota'}
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nombre
              </label>
              <input
                type='text'
                name='nombre'
                placeholder='Nombre'
                value={formData.nombre}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Tipo de Mascota
              </label>
              <select
                name='tipo_mascota'
                value={formData.tipo_mascota}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {tiposMascota.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Raza
              </label>
              <input
                type='text'
                name='raza'
                placeholder='Raza'
                value={formData.raza}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Color
              </label>
              <input
                type='text'
                name='color'
                placeholder='Color'
                value={formData.color}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Peso (kg)
              </label>
              <input
                type='number'
                step='0.01'
                name='peso_kg'
                placeholder='Peso en kg'
                value={formData.peso_kg}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                min='0'
              />
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
                {formData.id
                  ? 'Actualizar'
                  : loading
                  ? 'Cargando...'
                  : 'Registrar'}
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
              message='¡La operación se ha completado exitosamente! La mascota fue guardada correctamente.'
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

export default ModalCrearMascota
