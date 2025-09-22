import { useState, useEffect } from 'react'
import { useApi } from '../../../hooks/useApi'
import { getPersonal } from '../../../api/usuarios/usuarios'
import { asignarTarea } from '../../../api/tareas/tareas'
import { X, Users } from 'lucide-react'

import ErrorModal from '../../../components/ErrorModal'

export default function ModalAsignarTarea({ tarea, setShowModal, onSuccess }) {
  const { data, loading, error, execute } = useApi(getPersonal)
  const [selectedPersonals, setSelectedPersonals] = useState([])
  const [errorModal, setErrorModal] = useState(false)
  const { execute: asignar } = useApi(asignarTarea)

  useEffect(() => {
    execute() // Cargar todos los personales

    // Inicializar seleccionados si la tarea ya tiene asignaciones
    if (tarea.asignaciones) {
      const currentIds = tarea.asignaciones.map((a) => a.personal_id)
      setSelectedPersonals(currentIds)
    }
  }, [tarea])
  console.log('tarea: ', tarea)
  console.log('id de personal: ', selectedPersonals)
  const personalData = data?.data?.values || []
  console.log(personalData)
  const togglePersonal = (id) => {
    setSelectedPersonals((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    )
  }

  const handleAsignar = async () => {
    try {
      await asignar(tarea.id, selectedPersonals)
      onSuccess()
      setShowModal(false)
    } catch (err) {
      console.error(err)
      alert('Error al asignar la tarea')
    }
  }

  return (
    <div className='fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg'>
        {/* Cerrar */}
        <button
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
          onClick={() => setShowModal(false)}
        >
          <X className='w-5 h-5' />
        </button>

        <h2 className='text-lg font-bold mb-4 flex items-center space-x-2'>
          <Users className='w-5 h-5' />
          <span>Asignar Tarea: {tarea.titulo}</span>
        </h2>

        {loading && <p>Cargando personal...</p>}
        {error && <p className='text-red-500'>Error cargando personal</p>}

        {personalData.length > 0 && (
          <div className='flex flex-col space-y-2 mb-4 max-h-60 overflow-y-auto'>
            {personalData
              .filter((p) => p.estado === 'activo')
              .map((p) => (
                <label
                  key={p.id}
                  className='flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer'
                >
                  <div className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      value={p.id}
                      checked={selectedPersonals.includes(p.id)}
                      onChange={() => togglePersonal(p.id)}
                      className='form-checkbox h-4 w-4 text-blue-600'
                    />
                    <div>
                      <p className='font-medium'>{p.nombre}</p>
                      <p className='text-gray-500 text-sm'>
                        {p.tipo_personal} - {p.turno}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
          </div>
        )}

        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition-colors'
          onClick={handleAsignar}
        >
          Asignar Seleccionados
        </button>
      </div>
      {errorModal && (
        <ErrorModal
          isOpen={errorModal}
          onClose={() => setErrorModal(false)}
          message={error}
        />
      )}
    </div>
  )
}
