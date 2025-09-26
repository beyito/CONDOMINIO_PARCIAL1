from django.utils import timezone
from rest_framework.decorators import api_view,action
from rest_framework.response import Response
from area_comun.models import Reserva
from .models import PagoModel, ExpensaModel
from unidad_pertenencia.models import Unidad
from users.models import CopropietarioModel
from .serializers import ListaPagosSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from condominio.permissions import IsPersonal, IsCopropietario
import requests
from django.conf import settings
import os
from users.bitacora import registrar_bitacora
# Create your views here.
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCopropietario])
def adjuntarComprobanteReserva(request, id_reserva):
    try:
        reserva = Reserva.objects.get(id_reserva=id_reserva)
        pago = PagoModel.objects.get(id = reserva.pago.id)
        if 'imagen' not in request.FILES:
            return Response({"status": 0, "message": "No se envió la imagen"})

        imagen = request.FILES['imagen']  # 👈 nombre que envía Flutter

        # Carpeta donde guardar los comprobantes
        carpeta = os.path.join(settings.MEDIA_ROOT, 'comprobantes')
        os.makedirs(carpeta, exist_ok=True)

        # Ruta completa para guardar el archivo
        ruta_guardado = os.path.join(carpeta, imagen.name)
        with open(ruta_guardado, 'wb+') as f:
            for chunk in imagen.chunks():
                f.write(chunk)

        # Guardar la ruta relativa en la BD
        pago.url_comprobante = f'comprobantes/{imagen.name}'
        pago.estado = 'pendiente'
        pago.tipo_pago = 'reserva'
        # pago.monto = reserva.area_comun.precio_por_bloque
        pago.copropietario = reserva.usuario
        pago.save()

        return Response({
            "status": 1,
            "message": "Comprobante subido correctamente",
            "url_comprobante": pago.url_comprobante
        })

    except Reserva.DoesNotExist:
        return Response({"status": 0, "message": "Reserva no encontrada"})
    except Exception as e:
        return Response({"status": 0, "message": str(e)})



@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsCopropietario])
def adjuntarComprobante(request, id_pago):
    try:
        pago = PagoModel.objects.get(id = id_pago)
        if 'imagen' not in request.FILES:
            return Response({"status": 0, "message": "No se envió la imagen"})

        imagen = request.FILES['imagen']  # 👈 nombre que envía Flutter

        # Carpeta donde guardar los comprobantes
        carpeta = os.path.join(settings.MEDIA_ROOT, 'comprobantes')
        os.makedirs(carpeta, exist_ok=True)

        # Ruta completa para guardar el archivo
        ruta_guardado = os.path.join(carpeta, imagen.name)
        with open(ruta_guardado, 'wb+') as f:
            for chunk in imagen.chunks():
                f.write(chunk)
        if (pago.tipo_pago == "expensa"):

            expensa = ExpensaModel.objects.get(pago = pago)                  
            pago.tipo_pago = 'expensa'
            pago.copropietario = expensa.unidad.id_copropietario
            pago.monto = expensa.monto
        elif ( pago.tipo_pago == "reserva"):  

            reserva = Reserva.objects.get(pago = pago)       
            pago.tipo_pago = 'reserva'
            # pago.monto = reserva.area_comun.precio_por_bloque
            pago.copropietario = reserva.usuario
            
        pago.url_comprobante = f'comprobantes/{imagen.name}'
        pago.estado = 'pendiente'
        pago.save()

        return Response({
            "status": 1,
            "message": "Comprobante subido correctamente",
            "url_comprobante": pago.url_comprobante
        })

    except PagoModel.DoesNotExist:
        return Response({"status": 0, "message": "Pago no encontrada"})
    except Exception as e:
        return Response({"status": 0, "message": str(e)})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCopropietario])
def mostrarPagosCopropietario(request):
    usuario_actual = request.user  
    try:
        copropietario = CopropietarioModel.objects.get(idUsuario = usuario_actual.id)
    except CopropietarioModel.DoesNotExist:
        return Response({
        "status": 2,
        "error": 1,
        "message": "no existe el copropietario",
        "values": []
    })
    # 🔹 Filtrar las reservas por el idUsuario
    # print(copropietario)
    hoy = timezone.now().date()
    print(hoy)
    pagos = PagoModel.objects.filter(copropietario=copropietario)
    
    # print(reservas)
    serializer = ListaPagosSerializer(pagos, many=True)
    return Response({
        "status": 1,
        "error": 0,
        "message": "Reservas obtenidas correctamente",
        "values": serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def generarExpensas(request):
    try:
        unidades = Unidad.objects.filter(estado = "ocupada")
    except Unidad.DoesNotExist:
        return Response ({
            "status": 2,
            "error": 1,
            "message": "no existe ninguna unidad ocupada"
        })
    expensas_creadas = []
    for unidad in unidades:
        pago = PagoModel.objects.create(
            # monto=area.precio_por_bloque * tiempo_reserva.total_seconds() / 3600,
            descripcion = f"Se generó el pago de expensa de la unidad con codigo: {unidad.codigo}",
            fecha_emision=timezone.now().date(),
            copropietario = unidad.id_copropietario,
            tipo_pago = "expensa",
            )
        expensa = ExpensaModel.objects.create(
            unidad=unidad,   # relacionar con el copropietario
            pago=pago,
            monto=pago.monto,
            descripcion=f"Expensa de la fecha {timezone.now().date()} para la unidad con codigo {unidad.codigo}"
            )
        expensas_creadas.append(expensa.id_expensa)
    registrar_bitacora(request, f"Generó las expensas para la fecha {timezone.now().date()}")
    return Response({
            "status": 1,
            "error": 0,
            "message": f"El admin con id: {pago.copropietario.idUsuario} generó las expensas para la fecha {timezone.now().date()}."
        })
