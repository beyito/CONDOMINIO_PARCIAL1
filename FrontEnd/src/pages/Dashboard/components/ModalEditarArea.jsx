import { XCircle } from 'lucide-react'

import { useApi } from '../../../hooks/useApi'
import { putareas } from '../../../api/areasComunes/areas'
import { useState } from 'react'

import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

export default function ModalEditarArea({ setShowModal, onSuccess, area }) {
  const { execute, loading, error } = useApi(putareas)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = {
      nombre_area: e.target.nombre.value,
      capacidad: e.target.capacidad.value,
      dias_habiles: e.target.dias.value,
      apertura_hora: e.target.apertura.value,
      cierre_hora: e.target.cierre.value,
      reglas: e.target.reglas.value,
      precio_por_bloque: e.target.precio.value,
      estado: e.target.estado.value
    }

    try {
      const response = await execute(area.id_area, formData)
      console.log('Área Editada:', response.data)
      setShowModal(false)
      onSuccess()
      setApprovalModalOpen(true)
    } catch (err) {
      console.error('Error al editar área:', err)
      setErrorModalOpen(true)
    }
  }

  return (
    <>
      // Overlay que cubre solo el área principal, no el sidebar
      <div className='fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50'>
        <div className='bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Crear Nueva Área
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <XCircle className='w-6 h-6 text-gray-400' />
            </button>
          </div>

          <form className='space-y-4' onSubmit={handleSubmit}>
            <input
              type='text'
              name='nombre'
              placeholder='Nombre del área'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.nombre_area}
            />
            <input
              type='number'
              name='capacidad'
              placeholder='Capacidad'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.capacidad}
            />
            <input
              type='text'
              name='dias'
              placeholder='Días hábiles'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.dias_habiles}
            />
            <input
              type='time'
              name='apertura'
              placeholder='Horario apertura'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.apertura_hora}
            />
            <input
              type='time'
              name='cierre'
              placeholder='Horario cierre'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.cierre_hora}
            />
            <textarea
              placeholder='Reglas del área'
              name='reglas'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.reglas}
            />
            <input
              type='number'
              name='precio'
              placeholder='Precio por bloque'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.precio_por_bloque}
            />
            <select
              name='estado'
              className='w-full border border-gray-200 rounded-lg px-4 py-2'
              defaultValue={area.estado}
              required
            >
              <option value=''>Selecciona un estado</option>
              <option value='activo'>Activo</option>
              <option value='inactivo'>Inactivo</option>
              <option value='ocupado'>Ocupado</option>
              <option value='libre'>Libre</option>
            </select>

            <div className='flex justify-end space-x-2 mt-4'>
              <button
                type='button'
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                {loading ? 'Editando...' : 'Editar Área'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Modales */}
      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        message='¡La operación se ha completado exitosamente! Todos los datos han sido guardados correctamente.'
      />
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={`Ha ocurrido un error inesperado. ${error?.message || error}`}
      />
    </>
  )
}
