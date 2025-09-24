import React, { useState, useEffect } from 'react'

import { useAuth } from '../../../hooks/useAuth'
const CLOUD_NAME = 'dpicsykwa'
const UPLOAD_PRESET = 'condominio'

const CrearOEditarComunicadoModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = {}
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen_file: null,
    fecha_vencimiento: '',
    tipo: 'COMUNICADO',
    id_administrador: user.id,
    ...initialData
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setFormData({
      titulo: initialData.titulo || '',
      descripcion: initialData.descripcion || '',
      imagen_file: null,
      fecha_vencimiento: initialData.fecha_vencimiento || '',
      tipo: initialData.tipo || 'COMUNICADO',
      id_administrador: user.id
    })
  }, [initialData, user.id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, imagen_file: e.target.files[0] })
  }

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: data }
    )
    const result = await res.json()
    if (!result.secure_url) {
      throw new Error(result.error?.message || 'Error subiendo imagen')
    }
    return result.secure_url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_vencimiento: formData.fecha_vencimiento,
        tipo: formData.tipo,
        id_administrador: user.id
      }

      // Solo añadir imagen_url si hay un nuevo archivo seleccionado
      if (formData.imagen_file) {
        const imagen_url = await uploadImageToCloudinary(formData.imagen_file)
        payload.imagen_url = imagen_url
      }

      await onSave(payload)

      // Reset form
      setFormData({
        titulo: '',
        descripcion: '',
        imagen_file: null,
        fecha_vencimiento: '',
        tipo: 'COMUNICADO',
        id_administrador: user.id
      })
      onClose()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error al guardar comunicado')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md shadow-lg'>
        <h2 className='text-xl font-bold mb-4'>
          {initialData?.id ? 'Editar Comunicado' : 'Crear Comunicado'}
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Título</label>
            <input
              type='text'
              name='titulo'
              value={formData.titulo}
              onChange={handleChange}
              required
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Descripción
            </label>
            <textarea
              name='descripcion'
              value={formData.descripcion}
              onChange={handleChange}
              required
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Imagen</label>
            <input
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='w-full border rounded-lg px-3 py-2'
            />
            {formData.imagen_file && (
              <p className='text-sm text-gray-500 mt-1'>
                {formData.imagen_file.name}
              </p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Fecha de Vencimiento
            </label>
            <input
              type='date'
              name='fecha_vencimiento'
              value={formData.fecha_vencimiento}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Tipo</label>
            <select
              name='tipo'
              value={formData.tipo}
              onChange={handleChange}
              className='w-full border rounded-lg px-3 py-2'
            >
              <option value='ANUNCIO'>Anuncio</option>
              <option value='COMUNICADO'>Comunicado</option>
              <option value='ADVERTENCIA'>Advertencia</option>
            </select>
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border rounded-lg hover:bg-gray-100'
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
              disabled={uploading}
            >
              {uploading
                ? 'Guardando...'
                : initialData?.id
                ? 'Actualizar'
                : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CrearOEditarComunicadoModal
