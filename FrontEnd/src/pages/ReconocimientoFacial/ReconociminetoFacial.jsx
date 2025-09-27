import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { getResidentes } from '../../api/usuarios/usuarios';
import { useApi } from '../../hooks/useApi';
import Tesseract from 'tesseract.js';


async function detectarPlaca(frameCanvas) {
  const { data } = await Tesseract.recognize(frameCanvas, 'eng', {
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    logger: (m) => console.log(m)
  });

//  console.log('Texto detectado por Tesseract:', data.text);

  const placas = data.text
    .toUpperCase()
    .split(/\s|\n/)
    .map((t) => t.replace(/[^A-Z0-9]/g, ''))
    .filter((t) => /^[0-9]{4}[A-Z]{3}$/.test(t));

  return placas;
}

export default function FaceRecognition() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [mensaje, setMensaje] = useState('Cargando...');
  const { data, error, loading, execute } = useApi(getResidentes);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [acceso, setAcceso] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      startVideo();
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
      .catch((err) => console.error('Error accediendo a cámara:', err));
  };

  const [vehiculos, setVehiculos] = useState([]);

useEffect(() => {
  const fetchVehiculos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/unidadpertenencia/vehiculos`); // tu endpoint
      const data = await res.json();
      setVehiculos(data.values || []); // guardamos el array de vehículos
      console.log("Vehículos cargados:", data.values);
    } catch (err) {
      console.error("Error cargando vehículos:", err);
    }
  };
  fetchVehiculos();
}, []);

function verificarPlacaLocal(placaDetectada) {
  const placa = placaDetectada.toUpperCase().trim(); 
  const vehiculo = vehiculos.find(v => v.placa.toUpperCase() === placa);
  if (vehiculo) {
    console.log("SE ENCONTRO VEHICULO");
    return { existe: true, propietario: vehiculo };
  } else {
    console.log("NO SE ENCONTRO VEHICULO");
    return { existe: false };
  }
}

  useEffect(() => {
    execute();
  }, []);

  useEffect(() => {
    if (!data?.data) return;

    const initFaceMatcher = async () => {
      const residentesConFoto = data.data.filter((res) => res.foto);
      if (residentesConFoto.length === 0) {
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
      if (validDescriptors.length > 0) {
        setFaceMatcher(new faceapi.FaceMatcher(validDescriptors, 0.65));
      } else {
        setMensaje('Acceso facial denegado');
      }
    };

    initFaceMatcher();
  }, [data]);

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
        // --- Detección facial ---
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          const match = detections.map((d) => faceMatcher.findBestMatch(d.descriptor));
          const result = match[0];
          if (result.label !== 'unknown') {
            setAcceso(result.label);
            setMensaje(`Acceso facial concedido: ${result.label}`);
          } else {
            setMensaje('Acceso facial denegado');
          }
        }

        // --- Detección de placas ---
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

const placas = await detectarPlaca(tempCanvas);
if (placas.length > 0) {
  for (const placa of placas) {
    const resultado = verificarPlacaLocal(placa);
    if (resultado.existe) {
      setMensaje(`Placa autorizada: ${placa} - ${resultado.propietario.marca} ${resultado.propietario.modelo}`);
    } else {
      setMensaje(`Placa NO autorizada: ${placa}`);
    }

    // Limpiar el mensaje después de 3 segundos
    setTimeout(() => setMensaje(''), 3000);
  }
} else {
  setMensaje(''); // si no detecta placas, no muestra mensaje
}

      } catch (err) {
        console.error('Error detectando caras o placas:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [faceMatcher]);

  if (loading) return <p>Cargando residentes...</p>;
  if (error) return <p>Error cargando residentes</p>;

  return (
  <div style={{ position: 'relative', width: '400px', height: '300px' }}>
    <video
      ref={videoRef}
      autoPlay
      muted
      width="400"
      height="300"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
    />
    <canvas
      ref={canvasRef}
      width="400"
      height="300"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
    />

<div style={{ position: 'relative', width: '400px', height: '300px', marginTop: '50px' }}>
  <video 
    ref={videoRef} 
    autoPlay 
    muted 
    width="400" 
    height="300" 
    style={{ position: 'absolute', top: 0, left: 0 }} 
  />
  <canvas 
    ref={canvasRef} 
    width="400" 
    height="300" 
    style={{ position: 'absolute', top: 0, left: 0 }} 
  />

  {/* Mensaje temporal */}
  {mensaje && (
    <div style={{
      position: 'absolute',
      top: '-40px', // por encima del video
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
</div>



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
