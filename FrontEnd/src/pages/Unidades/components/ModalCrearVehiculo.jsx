import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApi } from '../../../hooks/useApi'
import {
  postVehiculo,
  updateVehiculo
} from '../../../api/Unidades y Pertenencias/unidades_y_pertenencias'
import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

const ModalCrearVehiculo = ({ setShowModal, onSuccess, unidad, vehiculo }) => {
  const [formData, setFormData] = useState({
    id: vehiculo?.id || null,
    placa: vehiculo?.placa || '',
    marca: vehiculo?.marca || '',
    modelo: vehiculo?.modelo || '',
    color: vehiculo?.color || '',
    unidad: vehiculo?.unidad || unidad // obligatorio
  })

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [message, setMessage] = useState('')

  const { execute, loading, error } = useApi(
    vehiculo ? updateVehiculo : postVehiculo
  )

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await execute(formData)
      if (response.data.error === 1) {
        const msg = response.data?.values?.placa?.[0] || response.data.message
        setMessage(msg)
        setShowErrorModal(true)
        console.error(response.data)
      } else {
        console.log('Vehiculo guardado:', response.data)
        setMessage(
          vehiculo
            ? 'Vehículo actualizado exitosamente'
            : 'Vehículo creado exitosamente'
        )
        setShowApprovalModal(true)
      }
    } catch (err) {
      console.error(err)
      setMessage('Error al guardar vehículo')
      setShowErrorModal(true)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/20 bg-opacity-40 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-md p-6'>
        {/* Header */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>
            {vehiculo ? 'Editar Vehículo' : 'Añadir Vehículo'}
          </h2>
          <button
            onClick={() => setShowModal(null)}
            className='text-gray-400 hover:text-gray-600'
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Placa</label>
            <input
              type='text'
              name='placa'
              value={formData.placa}
              onChange={handleChange}
              required
              className='w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Marca</label>
            <input
              type='text'
              name='marca'
              value={formData.marca}
              onChange={handleChange}
              required
              className='w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Modelo</label>
            <input
              type='text'
              name='modelo'
              value={formData.modelo}
              onChange={handleChange}
              required
              className='w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Color</label>
            <input
              type='text'
              name='color'
              value={formData.color}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Unidad solo info, no editable */}

          {error && <p className='text-red-500 text-sm'>{error}</p>}

          <div className='flex justify-end space-x-2 mt-4'>
            <button
              type='button'
              onClick={() => setShowModal(null)}
              className='px-4 py-2 border rounded-lg hover:bg-gray-100'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? 'Guardando...' : vehiculo ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>

        {/* Modales */}
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false)
            onSuccess()
            setShowModal(null)
          }}
          message={message}
        />
        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={message}
        />
      </div>
    </div>
  )
}

export default ModalCrearVehiculo
