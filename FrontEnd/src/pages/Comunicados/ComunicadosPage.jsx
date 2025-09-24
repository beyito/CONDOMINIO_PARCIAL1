import React, { useEffect, useState } from 'react'
import { PlusCircle, FileText, Edit, Trash2 } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import {
  getComunicados,
  postComunicado,
  deleteComunicado,
  updateComunicado
} from '../../api/comunicados/comunicados'
import ApprovalModal from '../../components/AprovalModal'
import ErrorModal from '../../components/ErrorModal'
import ConfirmationModal from '../../components/ConfirmationModal'
import CrearOEditarComunicadoModal from './components/CrearEditarComunicadoModal'

import { useAuth } from '../../hooks/useAuth'

const ComunicadosPage = () => {
  const [comunicados, setComunicados] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const { user } = useAuth()

  const { execute: fetchComunicados } = useApi(getComunicados)
  const { execute: crearComunicadoApi } = useApi(postComunicado)
  const { execute: editarComunicadoApi } = useApi(updateComunicado)
  const { execute: eliminarComunicadoApi } = useApi(deleteComunicado)

  useEffect(() => {
    cargarComunicados()
  }, [])
  console.log(comunicados)

  const cargarComunicados = async () => {
    try {
      const response = await fetchComunicados()
      setComunicados(response.data?.values || [])
    } catch (err) {
      console.error('Error cargando comunicados:', err)
    }
  }

  const openEditForm = (com) => {
    setEditingId(com.id)
    setShowForm(true)
  }

  const handleSave = async (payload) => {
    try {
      if (editingId) {
        await editarComunicadoApi(editingId, payload)
        setMessage('Comunicado actualizado correctamente')
      } else {
        await crearComunicadoApi(payload)
        setMessage('Comunicado creado correctamente')
      }
      setShowApprovalModal(true)
      cargarComunicados()
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setMessage(err.message || 'Error al guardar comunicado')
      setShowErrorModal(true)
    }
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      await eliminarComunicadoApi(user.id, deleteId)
      setMessage('Comunicado eliminado correctamente')
      setShowApprovalModal(true)
      cargarComunicados()
    } catch (err) {
      setMessage('Error al eliminar comunicado')
      setShowErrorModal(true)
    } finally {
      setShowDeleteModal(false)
      setDeleteId(null)
    }
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <FileText size={24} /> Comunicados
        </h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
          }}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          <PlusCircle size={20} />
          Nuevo Comunicado
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {comunicados.map((com) => (
          <div
            key={com.id}
            className='bg-white rounded-lg shadow p-4 flex flex-col justify-between'
          >
            <div>
              <h2 className='text-lg font-semibold'>{com.titulo}</h2>
              <p className='text-sm text-gray-600 mb-2'>{com.tipo}</p>
              <p className='text-gray-800 mb-2'>{com.descripcion}</p>
              {com.imagen_url && (
                <img
                  src={com.imagen_url}
                  alt={com.titulo}
                  className='w-full h-40 object-cover rounded mb-2'
                />
              )}
              <p className='text-xs text-gray-500'>
                Publicado: {com.fecha_publicacion}
              </p>
              {com.fecha_vencimiento && (
                <p className='text-xs text-red-500'>
                  Vence: {com.fecha_vencimiento}
                </p>
              )}
            </div>
            <div className='flex justify-end gap-2 mt-2'>
              <button
                onClick={() => openEditForm(com)}
                className='px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-1'
              >
                <Edit size={16} /> Editar
              </button>
              <button
                onClick={() => confirmDelete(com.id)}
                className='px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1'
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      <CrearOEditarComunicadoModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingId(null)
        }}
        onSave={handleSave}
        initialData={
          editingId ? comunicados.find((c) => c.id === editingId) : {}
        }
      />

      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        message={message}
      />
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={message}
      />
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message='¿Seguro que deseas eliminar este comunicado?'
      />
    </div>
  )
}

export default ComunicadosPage
