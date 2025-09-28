import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { getResidentes } from '../../api/usuarios/usuarios';
import { useApi } from '../../hooks/useApi';
import Tesseract from 'tesseract.js';

async function detectarPlaca(frameCanvas) {
  const { data } = await Tesseract.recognize(frameCanvas, 'eng', {
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  });

  return data.text
    .toUpperCase()
    .split(/\s|\n/)
    .map((t) => t.replace(/[^A-Z0-9]/g, ''))
    .filter((t) => /^[0-9]{4}[A-Z]{3}$/.test(t));
}

function mejorarImagen(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width * 2; // duplicar tamaño
  canvas.height = img.height * 2;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export default function FaceRecognition() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [mensaje, setMensaje] = useState('Cargando...');
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [acceso, setAcceso] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const { data, error, loading, execute } = useApi(getResidentes);

  // --- Cargar modelos y iniciar cámara ---
useEffect(() => {
  const loadModels = async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      console.log('Modelos cargados correctamente desde:', MODEL_URL);
      startVideo();
    } catch (err) {
      console.error('Error cargando modelos:', err);
    }
  };
  loadModels();
}, []);

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setMensaje('Cámara iniciada, escaneando...');
        })
        .catch(() => setMensaje('Error accediendo a la cámara'));
    };


  // --- Cargar vehículos ---
  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/unidadpertenencia/vehiculos`);
        const data = await res.json();
        setVehiculos(data.values || []);
      } catch {
        setMensaje('Error cargando vehículos');
      }
    };
    fetchVehiculos();
  }, []);

  // --- Verificar placa ---
  const verificarPlacaLocal = (placaDetectada) => {
    const placa = placaDetectada.toUpperCase().trim();
    const vehiculo = vehiculos.find((v) => v.placa.toUpperCase() === placa);
    return vehiculo ? { existe: true, propietario: vehiculo } : { existe: false };
  };

  // --- Cargar residentes ---
  useEffect(() => {
    execute(); // no retorna nada
  }, []);

  // --- Inicializar faceMatcher ---
  useEffect(() => {
    if (!data?.data) return;

    const initFaceMatcher = async () => {
      const residentesConFoto = data.data.filter((res) => res.foto);
      if (!residentesConFoto.length) {
        setMensaje('Acceso facial denegado');
        return;
      }

      const labeledDescriptors = await Promise.all(
        residentesConFoto.map(async (res) => {
          try {
            const foto_url = res.foto.replace("http://", "https://");
            const img = await faceapi.fetchImage(foto_url);
            const detections = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
              .withFaceLandmarks()
              .withFaceDescriptor();
            if (!detections) return null;
            return new faceapi.LabeledFaceDescriptors(res.nombre, [detections.descriptor]);
          } catch {
            return null;
          }
        })
      );

      const validDescriptors = labeledDescriptors.filter(Boolean);
      if (validDescriptors.length > 0) setFaceMatcher(new faceapi.FaceMatcher(validDescriptors, 0.65));
      else setMensaje('Acceso facial denegado');
    };

    initFaceMatcher();
  }, [data]);

  // --- Detección facial y de placas ---
  useEffect(() => {
    if (!videoRef.current || !faceMatcher) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const displaySize = { width: video.videoWidth || 400, height: video.videoHeight || 300 };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      try {
        // Detección facial
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          const match = detections.map((d) => faceMatcher.findBestMatch(d.descriptor))[0];
          if (match.label !== 'unknown') {
            setAcceso(match.label);
            setMensaje(`Acceso facial concedido: ${match.label}`);
          } else setMensaje('Acceso facial denegado');
        }

        // Detección de placas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const tempMejorardo = mejorarImagen(tempCanvas)
        const placas = await detectarPlaca(tempMejorardo);
        if (placas.length) {
          for (const placa of placas) {
            const resultado = verificarPlacaLocal(placa);
            if (resultado.existe) {
              setMensaje(`Placa autorizada: ${placa} - ${resultado.propietario.marca} ${resultado.propietario.modelo}`);
            } else setMensaje(`Placa NO autorizada: ${placa}`);
            setTimeout(() => setMensaje(''), 3000);
          }
        }
      } catch {
        setMensaje('Error detectando caras o placas');
      }
    }, 1500);

    return () => clearInterval(interval); // cleanup válido
  }, [faceMatcher]);

  if (loading) return <p>Cargando residentes...</p>;
  if (error) return <p>Error cargando residentes</p>;

  return (
    <div style={{ position: 'relative', width: '400px', height: '300px' }}>
      <video ref={videoRef} autoPlay muted width="400" height="300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
      <canvas ref={canvasRef} width="400" height="300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }} />

      {mensaje && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '5px',
          zIndex: 10
        }}>
          {mensaje}
        </div>
      )}

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
              style={{ marginTop: '15px', padding: '8px 16px', cursor: 'pointer' }}
              onClick={() => setAcceso(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
