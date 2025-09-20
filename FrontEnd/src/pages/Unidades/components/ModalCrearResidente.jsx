import { useState } from 'react'
import { useApi } from '../../../hooks/useApi'
import { postResidente } from '../../../api/Unidades y Pertenencias/unidades_y_pertenencias'
import { XCircle } from 'lucide-react'

import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

export const ModalCrearResidente = ({ setShowModal, onSuccess, unidad }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    ci: '',
    telefono: '',
    correo: '',
    id_unidad: unidad
  })

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const { execute, loading, error } = useApi(postResidente)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await execute(formData)
      console.log('Residente creado:', response.data)
      setShowApprovalModal(true)
    } catch (err) {
      console.error('Error al crear residente:', err)
      setShowErrorModal(true)
    }
  }
  return (
    <>
      <div className='fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50'>
        <div className='bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Añadir Residente
            </h2>
            <button
              onClick={() => setShowModal(null)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <XCircle className='w-6 h-6 text-gray-400' />
            </button>
          </div>
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Nombre
              </label>
              <input
                type='text'
                placeholder='Nombre'
                value={formData.nombre || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                CI
              </label>
              <input
                type='text'
                placeholder='CI'
                value={formData.ci || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ci: e.target.value
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Telefono
              </label>
              <input
                type='text'
                placeholder='Telefono'
                value={formData.telefono || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telefono: e.target.value
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Correo
              </label>
              <input
                type='email'
                placeholder='Correo'
                value={formData.correo || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    correo: e.target.value
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowModal(null)}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {/* Modales */}
            <ApprovalModal
              isOpen={showApprovalModal}
              onClose={() => {
                setShowApprovalModal(false)
                setShowModal(null)
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

export default ModalCrearResidente
