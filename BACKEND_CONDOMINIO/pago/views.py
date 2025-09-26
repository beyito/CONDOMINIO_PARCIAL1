
from rest_framework.decorators import api_view,action
from rest_framework.response import Response
from area_comun.models import Reserva
from .models import PagoModel
# from .serializers import MarcarEntradaSerializer, MarcarSalidaSerializer,AreaComunSerializer, ReservaSerializer, ListaVisitantesSerializer, RegistroVisita, ListaReservasSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from condominio.permissions import IsPersonal, IsCopropietario
import requests
from django.conf import settings
import os

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