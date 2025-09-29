import { useState } from 'react'
import { postQr } from '../../../api/pagos/pagos'
import { useApi } from '../../../hooks/useApi'
import ApprovalModal from '../../../components/AprovalModal'
import ErrorModal from '../../../components/ErrorModal'

const CLOUD_NAME = 'dpicsykwa'
const UPLOAD_PRESET = 'condominio'

const CrearQRModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null)
  const { execute, loading, error } = useApi(postQr, { manual: true })

  const [approvalMessage, setApprovalMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const result = await res.json()
    if (!result.secure_url) throw new Error('Error subiendo QR')
    return result.secure_url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setErrorMessage('Selecciona un archivo QR')
      return
    }

    try {
      const url_qr = await uploadToCloudinary(file)
      await execute({ url_qr, estado: 'activo' })
      setApprovalMessage('QR creado correctamente')
      setFile(null)
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Error al subir QR')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className='fixed inset-0 bg-black/20 flex justify-center items-center z-50'>
        <div className='bg-white rounded-lg p-6 w-full max-w-sm'>
          <h2 className='text-lg font-semibold mb-4'>Crear QR</h2>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <input type='file' accept='image/*' onChange={handleFileChange} />
            {file && <p>{file.name}</p>}
            <div className='flex justify-end gap-2'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border rounded'
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                disabled={loading}
              >
                {loading ? 'Subiendo...' : 'Crear'}
              </button>
            </div>
            {error && <p className='text-red-500 mt-2'>{error.message}</p>}
          </form>
        </div>
      </div>

      {/* Modal de aprobación */}
      <ApprovalModal
        isOpen={!!approvalMessage}
        onClose={() => {
          setApprovalMessage('')
          onClose()
        }}
        message={approvalMessage}
      />

      {/* Modal de error */}
      <ErrorModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </>
  )
}

export default CrearQRModal
