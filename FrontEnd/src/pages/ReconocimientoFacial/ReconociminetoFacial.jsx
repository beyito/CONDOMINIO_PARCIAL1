import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import { getResidentes } from '../../api/usuarios/usuarios'
import { useApi } from '../../hooks/useApi'

export default function FaceRecognition() {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [mensaje, setMensaje] = useState('Cargando...')
  const { data, error, loading, execute } = useApi(getResidentes)
  const [faceMatcher, setFaceMatcher] = useState(null)
  const [acceso, setAcceso] = useState(null)

  // -------------------- Cargar modelos --------------------
  useEffect(() => {
    const loadModels = async () => {
      console.log('Cargando modelos...')
      const MODEL_URL = '/models'
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      console.log('Modelos cargados')
      startVideo()
    }
    loadModels()
  }, [])

  // -------------------- Iniciar video --------------------
  const startVideo = () => {
    console.log('Solicitando acceso a la cámara...')
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream
        console.log('Cámara iniciada')
      })
      .catch((err) => console.error('Error accediendo a cámara:', err))
  }

  // -------------------- Traer residentes --------------------
  useEffect(() => {
    execute()
  }, [])
  console.log('Residentes', data?.data)

  // -------------------- Crear FaceMatcher --------------------
  useEffect(() => {
    if (!data?.data) return

    const initFaceMatcher = async () => {
      console.log('Procesando residentes...')
      const residentesConFoto = data.data.filter((res) => res.foto)
      if (residentesConFoto.length === 0) {
        console.warn('No hay residentes con foto')
        setMensaje('Acceso denegado')
        return
      }

      const labeledDescriptors = await Promise.all(
        residentesConFoto.map(async (res) => {
          try {
            console.log('Procesando foto de', res.foto)
            const url = res.foto.startsWith('https')
              ? res.foto
              : res.foto// : 'https://condominio-parcial1.onrender.com/media/residentes/fotos/fotoPerfil.jpeg'
            const img = await faceapi.fetchImage(url)
            const detections = await faceapi
              .detectSingleFace(
                img,
                new faceapi.TinyFaceDetectorOptions({
                  inputSize: 224,
                  scoreThreshold: 0.4
                })
              )
              .withFaceLandmarks()
              .withFaceDescriptor()
            if (!detections) return null
            console.log('Cara detectada en', res.nombre)
            return new faceapi.LabeledFaceDescriptors(res.nombre, [
              detections.descriptor
            ])
          } catch (err) {
            console.warn('Error procesando foto de', res.nombre, err)
            return null
          }
        })
      )

      const validDescriptors = labeledDescriptors.filter(Boolean)
      if (validDescriptors.length > 0) {
        setFaceMatcher(new faceapi.FaceMatcher(validDescriptors, 0.65))
        console.log(
          'FaceMatcher listo con',
          validDescriptors.length,
          'residentes'
        )
      } else {
        console.warn('No se pudo crear FaceMatcher')
        setMensaje('Acceso denegado')
      }
    }

    initFaceMatcher()
  }, [data])

  // -------------------- Detección --------------------
  useEffect(() => {
    if (!videoRef.current || !faceMatcher) return
    const canvas = canvasRef.current
    const displaySize = {
      width: videoRef.current.videoWidth || 400,
      height: videoRef.current.videoHeight || 300
    }
    canvas.width = displaySize.width
    canvas.height = displaySize.height
    faceapi.matchDimensions(canvas, displaySize)

    console.log('Iniciando detección...')
    setMensaje('Escaneando...')

    const interval = setInterval(async () => {
      if (!videoRef.current) return
      try {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.4
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptors()

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          )
          faceapi.draw.drawDetections(canvas, resizedDetections)
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
          console.log(
            'Número de caras detectadas en la cámara:',
            detections.length
          )

          const match = detections.map((d) =>
            faceMatcher.findBestMatch(d.descriptor)
          )
          const result = match[0]
          console.log('Resultado coincidencia:', result.label)
          if (result.label !== 'unknown') {
            setAcceso(result.label)
            setMensaje(`Acceso concedido: ${result.label}`)
          } else {
            setMensaje('Acceso denegado')
          }
        } else {
          setMensaje('Escaneando...')
        }
      } catch (err) {
        console.error('Error detectando caras:', err)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [faceMatcher])

  // -------------------- Render --------------------
  if (loading) return <p>Cargando residentes...</p>
  if (error) return <p>Error cargando residentes</p>

  return (
    <div style={{ position: 'relative', width: '400px', height: '300px' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        width='400'
        height='300'
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />
      <canvas
        ref={canvasRef}
        width='400'
        height='300'
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
      />
      <h2 style={{ marginTop: '310px' }}>{mensaje}</h2>

      {/* Modal de acceso */}
      {acceso && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setAcceso(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px 40px',
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <h1 style={{ color: 'green' }}>Acceso Concedido</h1>
            <p>Nombre: {acceso}</p>
            <button
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
              onClick={() => setAcceso(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
