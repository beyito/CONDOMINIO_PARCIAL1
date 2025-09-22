import { useState, useEffect } from 'react'
import { useApi } from '../../../hooks/useApi'
import { getPersonal } from '../../../api/usuarios/usuarios'
import { postTarea } from '../../../api/tareas/tareas'
import { X, Plus } from 'lucide-react'

import ErrorModal from '../../../components/ErrorModal'

export default function ModalCrearTarea({ setShowModal, onSuccess }) {
  const { data, loading, error, execute } = useApi(getPersonal)
  const { execute: crearTarea } = useApi(postTarea)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [frecuencia, setFrecuencia] = useState('diaria')
  const [errorModal, setErrorModal] = useState(false)
  const [selectedPersonals, setSelectedPersonals] = useState([])

  useEffect(() => {
    execute()
  }, [])

  const personalData = data?.data?.values || []

  const togglePersonal = (id) => {
    setSelectedPersonals((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    )
  }

  const handleCrear = async () => {
    if (!titulo.trim() || !descripcion.trim())
      return alert('Debes completar todos los campos')

    try {
      await crearTarea({
        titulo,
        descripcion,
        frecuencia,
        personal_ids: selectedPersonals
      })
      onSuccess()
      setShowModal(false)
    } catch (err) {
      console.error(err)
      setErrorModal(true)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl p-6 w-full max-w-md relative shadow-lg'>
        <button
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
          onClick={() => setShowModal(false)}
        >
          <X className='w-5 h-5' />
        </button>

        <h2 className='text-lg font-bold mb-4 flex items-center space-x-2'>
          <Plus className='w-5 h-5' />
          <span>Crear Nueva Tarea</span>
        </h2>

        <div className='flex flex-col space-y-3 mb-4'>
          <input
            type='text'
            placeholder='Título'
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className='border rounded px-3 py-2 w-full'
          />
          <textarea
            placeholder='Descripción'
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className='border rounded px-3 py-2 w-full resize-none'
          />
          <select
            value={frecuencia}
            onChange={(e) => setFrecuencia(e.target.value)}
            className='border rounded px-3 py-2 w-full'
          >
            <option value='diaria'>Diaria</option>
            <option value='eventual'>Eventual</option>
          </select>
        </div>

        <div className='mb-4 max-h-48 overflow-y-auto'>
          <h3 className='font-medium mb-2'>Asignar Personal</h3>
          {loading && <p>Cargando personal...</p>}
          {error && <p className='text-red-500'>Error cargando personal</p>}
          {personalData.map((p) => (
            <label
              key={p.id}
              className='flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer'
            >
              <input
                type='checkbox'
                value={p.id}
                checked={selectedPersonals.includes(p.id)}
                onChange={() => togglePersonal(p.id)}
                className='form-checkbox h-4 w-4 text-blue-600'
              />
              <div className='ml-2'>
                <p className='font-medium'>{p.nombre}</p>
                <p className='text-gray-500 text-sm'>
                  {p.tipo_personal} - {p.turno}
                </p>
              </div>
            </label>
          ))}
        </div>

        <button
          className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full transition-colors'
          onClick={handleCrear}
        >
          Crear Tarea
        </button>
      </div>
      <ErrorModal
        isOpen={errorModal}
        onClose={() => setErrorModal(false)}
        message='Error al crear la tarea'
      />
    </div>
  )
}
