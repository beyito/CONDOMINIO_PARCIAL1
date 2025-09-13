import { XCircle, Plus, Search } from 'lucide-react'
export default function ModalCrearArea({ setShowModal }) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>Crear Nueva Área</h2>
          <button
            onClick={() => setShowModal(false)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <XCircle className='w-6 h-6 text-gray-400' />
          </button>
        </div>

        <form className='space-y-4'>
          <input
            type='text'
            placeholder='Nombre del área'
            className='w-full border border-gray-200 rounded-lg px-4 py-2'
          />
          <input
            type='number'
            placeholder='Capacidad'
            className='w-full border border-gray-200 rounded-lg px-4 py-2'
          />
          <input
            type='text'
            placeholder='Días hábiles'
            className='w-full border border-gray-200 rounded-lg px-4 py-2'
          />
          <input
            type='text'
            placeholder='Horario apertura - cierre'
            className='w-full border border-gray-200 rounded-lg px-4 py-2'
          />
          <textarea
            placeholder='Reglas del área'
            className='w-full border border-gray-200 rounded-lg px-4 py-2'
          />
          <input
            type='number'
            placeholder='Precio por bloque'
            className='w-full border border-gray-200 rounded-lg px-4 py-2'
          />

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
              Crear Área
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
