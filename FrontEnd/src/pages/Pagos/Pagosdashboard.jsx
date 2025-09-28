import React, { useState, useEffect } from 'react'
import {
  getPagos,
  updatePago,
  marcarPagosEnMora,
  generarExpensas
} from '../../api/pagos/pagos'
import { useApi } from '../../hooks/useApi'
import {
  Clock,
  Check,
  X,
  AlertTriangle,
  FileText,
  User,
  FileText as ReportIcon,
  XCircle
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function PagoDashboard() {
  const { data, loading, error, execute } = useApi(getPagos)

  const [tab, setTab] = useState('reserva')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [reporteModal, setReporteModal] = useState(false)
  const [reporteData, setReporteData] = useState({
    tipoPago: 'todos',
    estado: 'todos',
    fechaInicio: '',
    fechaFin: '',
    formato: 'pdf'
  })

  useEffect(() => {
    execute()
  }, [execute])
  console.log(data)
  const handleUpdateEstado = async (id, estado) => {
    try {
      await updatePago(id, { estado })
      execute()
    } catch (err) {
      console.error('Error al actualizar pago:', err)
    }
  }

  const handleMarcarMora = async () => {
    try {
      await marcarPagosEnMora()
      execute()
    } catch (err) {
      console.error('Error al marcar en mora:', err)
    }
  }

  const handleGenerarExpensas = async () => {
    try {
      await generarExpensas()
      execute()
    } catch (err) {
      console.error('Error al generar expensas:', err)
    }
  }

  const pagosPorCategoria = (data?.data?.values || []).filter(
    (p) => p.tipo_pago === tab
  )

  const pagosFiltrados =
    estadoFiltro === 'todos'
      ? pagosPorCategoria
      : pagosPorCategoria.filter((p) => p.estado === estadoFiltro)

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'text-yellow-800 bg-yellow-100'
      case 'pagado':
        return 'text-green-800 bg-green-100'
      case 'rechazado':
        return 'text-red-800 bg-red-100'
      case 'en mora':
        return 'text-orange-800 bg-orange-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }
  //MANEJO DEL REPORTE PDF/EXCEL

  const handleGenerarReporte = () => {
    const filtros = totalPagos.filter((p) => {
      const matchTipo =
        reporteData.tipoPago === 'todos' || p.tipo_pago === reporteData.tipoPago
      const matchEstado =
        reporteData.estado === 'todos' || p.estado === reporteData.estado

      const fechaPago = new Date(p.fecha_emision)
      const fechaInicio = reporteData.fechaInicio
        ? new Date(reporteData.fechaInicio)
        : null
      const fechaFin = reporteData.fechaFin
        ? new Date(reporteData.fechaFin)
        : null

      const matchFecha =
        (!fechaInicio || fechaPago >= fechaInicio) &&
        (!fechaFin || fechaPago <= fechaFin)

      return matchTipo && matchEstado && matchFecha
    })

    if (reporteData.formato === 'pdf') {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Reporte de Pagos', 14, 20)

      // Crear tabla
      const tableColumn = [
        'Descripción',
        'Copropietario',
        'Tipo',
        'Estado',
        'Monto (Bs)',
        'Fecha emisión',
        'Fecha pago'
      ]
      const tableRows = []

      filtros.forEach((p) => {
        const pagoData = [
          p.descripcion,
          p.copropietario_nombre || 'N/A',
          p.tipo_pago,
          p.estado,
          p.monto.toFixed(2),
          p.fecha_emision,
          p.fecha_pago || '-'
        ]
        tableRows.push(pagoData)
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [30, 144, 255], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        styles: { fontSize: 10 }
      })

      doc.save('reporte_pagos.pdf')
    } else if (reporteData.formato === 'excel') {
      const wsData = filtros.map((p) => ({
        Descripcion: p.descripcion,
        Copropietario: p.copropietario_nombre || 'N/A',
        Tipo: p.tipo_pago,
        Estado: p.estado,
        Monto: p.monto.toFixed(2),
        FechaEmision: p.fecha_emision,
        FechaPago: p.fecha_pago || ''
      }))

      const ws = XLSX.utils.json_to_sheet(wsData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Pagos')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        'reporte_pagos.xlsx'
      )
    }

    setReporteModal(false)
  }

  const renderIconoEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className='w-6 h-6' />
      case 'pagado':
        return <Check className='w-6 h-6' />
      case 'rechazado':
        return <X className='w-6 h-6' />
      case 'en mora':
        return <AlertTriangle className='w-6 h-6' />
      default:
        return <FileText className='w-6 h-6' />
    }
  }

  const renderPagoCard = (pago) => {
    const disabled = pago.estado === 'pagado' || pago.estado === 'rechazado'

    return (
      <div
        key={pago.id}
        className={`mb-3 p-4 border-l-4 rounded-lg shadow flex justify-between items-center ${getEstadoStyle(
          pago.estado
        )}`}
      >
        <div className='flex gap-4 items-center'>
          {renderIconoEstado(pago.estado)}
          <div>
            <h3 className='font-semibold text-lg'>{pago.descripcion}</h3>
            <p className='text-sm text-gray-700 flex items-center gap-1'>
              <User className='w-4 h-4' />
              Copropietario: {pago.copropietario_nombre || 'N/A'}
            </p>
            <p className='text-sm text-gray-700'>Monto: {pago.monto} Bs</p>
            <p className='text-sm text-gray-700'>
              Fecha emisión: {pago.fecha_emision}
              {pago.fecha_pago && ` | Pago: ${pago.fecha_pago}`}
            </p>
            {pago.url_comprobante && (
              <button
                className='text-blue-600 underline mt-1 flex items-center gap-1'
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_API_URL}/media/${
                      pago.url_comprobante
                    }`,
                    '_blank'
                  )
                }
              >
                <FileText className='w-4 h-4' /> Ver comprobante
              </button>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2 items-end'>
          <span className='font-semibold'>{pago.estado.toUpperCase()}</span>
          <button
            disabled={disabled}
            className={`px-3 py-1 rounded text-white ${
              disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={() => handleUpdateEstado(pago.id, 'pagado')}
          >
            Aprobar
          </button>
          <button
            disabled={disabled}
            className={`px-3 py-1 rounded text-white ${
              disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={() => handleUpdateEstado(pago.id, 'rechazado')}
          >
            Rechazar
          </button>
        </div>
      </div>
    )
  }

  if (loading) return <p className='text-center'>Cargando pagos...</p>
  if (error)
    return <p className='text-center text-red-500'>Error al cargar pagos</p>

  // Totales para estadísticas
  const totalPagos = data?.data?.values || []

  const totalPagado = totalPagos
    .filter((p) => p.estado === 'pagado')
    .reduce((sum, p) => sum + p.monto, 0)

  const totalPendiente = totalPagos
    .filter((p) => p.estado === 'pendiente')
    .reduce((sum, p) => sum + p.monto, 0)

  const totalMora = totalPagos.filter((p) => p.estado === 'en mora').length

  const countPorTipo = (tipo) =>
    totalPagos.filter((p) => p.tipo_pago === tipo).length

  return (
    <div className='space-y-6'>
      {/* Estadísticas */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='p-4 bg-green-100 rounded-lg flex flex-col items-center justify-center'>
          <span className='text-gray-700 font-semibold'>Total Pagado</span>
          <span className='text-xl font-bold'>{totalPagado.toFixed(2)} Bs</span>
        </div>
        <div className='p-4 bg-yellow-100 rounded-lg flex flex-col items-center justify-center'>
          <span className='text-gray-700 font-semibold'>Total Pendiente</span>
          <span className='text-xl font-bold'>
            {totalPendiente.toFixed(2)} Bs
          </span>
        </div>
        <div className='p-4 bg-orange-100 rounded-lg flex flex-col items-center justify-center'>
          <span className='text-gray-700 font-semibold'>Pagos en Mora</span>
          <span className='text-xl font-bold'>{totalMora}</span>
        </div>
        <div className='p-4 bg-blue-100 rounded-lg flex flex-col items-center justify-center'>
          <span className='text-gray-700 font-semibold'>Reservas</span>
          <span className='text-xl font-bold'>{countPorTipo('reserva')}</span>
        </div>
      </div>

      {/* Botón de reportes */}
      <div className='flex justify-end mb-4'>
        <button
          onClick={() => setReporteModal(true)}
          className='px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2'
        >
          <ReportIcon className='w-4 h-4' /> Generar Reporte
        </button>
      </div>

      {/* Navbar categorías */}
      <nav className='flex gap-6 border-b pb-2'>
        {['reserva', 'expensa', 'multa'].map((t) => (
          <button
            key={t}
            className={`font-semibold ${
              tab === t
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}s
          </button>
        ))}
      </nav>

      {/* Filtros */}
      <div className='flex gap-4 items-center'>
        <label>Estado:</label>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className='border rounded px-2 py-1'
        >
          <option value='todos'>Todos</option>
          <option value='pendiente'>Pendiente</option>
          <option value='pagado'>Pagado</option>
          <option value='rechazado'>Rechazado</option>
          <option value='en mora'>En Mora</option>
        </select>

        <button
          onClick={handleGenerarExpensas}
          className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Generar Expensas
        </button>
        <button
          onClick={handleMarcarMora}
          className='px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600'
        >
          Marcar en Mora
        </button>
      </div>

      {/* Lista de pagos */}
      <section>
        {pagosFiltrados.length > 0 ? (
          pagosFiltrados.map(renderPagoCard)
        ) : (
          <p className='text-gray-500'>
            No hay pagos en esta categoría / filtro.
          </p>
        )}
      </section>

      {/* Modal de reporte */}
      {reporteModal && (
        <div className='fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white p-6 rounded-lg w-96 relative'>
            <button
              className='absolute top-2 right-2 text-gray-600 hover:text-gray-800'
              onClick={() => setReporteModal(false)}
            >
              <XCircle className='w-6 h-6' />
            </button>
            <h2 className='text-lg font-semibold mb-4'>Generar Reporte</h2>

            <div className='flex flex-col gap-3'>
              <label>Tipo de Pago:</label>
              <select
                value={reporteData.tipoPago}
                onChange={(e) =>
                  setReporteData({ ...reporteData, tipoPago: e.target.value })
                }
                className='border rounded px-2 py-1'
              >
                <option value='todos'>Todos</option>
                <option value='reserva'>Reservas</option>
                <option value='expensa'>Expensas</option>
                <option value='multa'>Multas</option>
              </select>

              <label>Estado:</label>
              <select
                value={reporteData.estado}
                onChange={(e) =>
                  setReporteData({ ...reporteData, estado: e.target.value })
                }
                className='border rounded px-2 py-1'
              >
                <option value='todos'>Todos</option>
                <option value='pendiente'>Pendiente</option>
                <option value='pagado'>Pagado</option>
                <option value='rechazado'>Rechazado</option>
                <option value='en mora'>En Mora</option>
              </select>

              <label>Rango de fechas:</label>
              <div className='flex gap-2'>
                <input
                  type='date'
                  value={reporteData.fechaInicio}
                  onChange={(e) =>
                    setReporteData({
                      ...reporteData,
                      fechaInicio: e.target.value
                    })
                  }
                  className='border rounded px-2 py-1 w-1/2'
                />
                <input
                  type='date'
                  value={reporteData.fechaFin}
                  onChange={(e) =>
                    setReporteData({ ...reporteData, fechaFin: e.target.value })
                  }
                  className='border rounded px-2 py-1 w-1/2'
                />
              </div>

              <label>Formato:</label>
              <select
                value={reporteData.formato}
                onChange={(e) =>
                  setReporteData({ ...reporteData, formato: e.target.value })
                }
                className='border rounded px-2 py-1'
              >
                <option value='pdf'>PDF</option>
                <option value='excel'>Excel</option>
              </select>

              <button
                onClick={handleGenerarReporte}
                className='mt-4 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700'
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
