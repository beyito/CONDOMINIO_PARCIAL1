from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view,action
from rest_framework.response import Response
from datetime import datetime, timedelta
from users.models import CopropietarioModel
from .models import AreaComun, Reserva, AutorizacionVisita
from .serializers import MarcarEntradaSerializer, MarcarSalidaSerializer,AreaComunSerializer, ReservaSerializer, ListaVisitantesSerializer, RegistroVisita, ListaReservasSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from condominio.permissions import IsPersonal, IsCopropietario
import requests

# #Crear Lista Invitados


# @api_view(['POST'])
# def crearListaInvitados(request):

# MOSTRAR VISITAS PARA EL GUARDIA
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPersonal])
def mostrarVisitas(request):
    
    visitas = AutorizacionVisita.objects.exclude(estado="Completado")
    visitas_serializadas = ListaVisitantesSerializer(visitas, many=True).data
    print(ListaVisitantesSerializer(visitas, many=True).data)
    data = []
    for visita in visitas_serializadas:
        data.append({
            "id": visita["id"],
            "copropietario": visita["copropietario"],
            "nombre": visita["nombre"],
            "apellido": visita["apellido"],
            # "CI": visita["ci"],
            "fecha_inicio": visita["hora_inicio"],
            "fecha_fin": visita["hora_fin"],
            "motivo_visita": visita["motivo_visita"],
            "estado": visita["estado"],
        })

    return Response({
        "status": 1,
        "error": 0,
        "message": "Visitas listadas correctamente",
        "values": data
    })

# Create your views here.
@api_view(['GET','POST'])
def mostrarCalendarioAreasComunes(request):
    # Obtener fecha del body
    fecha_str = request.data.get("fecha")
    if not fecha_str:
        return Response({
            "status": 2,
            "error": 1,
            "message": "Debe enviar una fecha en formato YYYY-MM-DD",
        })

    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return Response({
            "status": 2,
            "error": 1,
            "message": "Formato de fecha inválido, use YYYY-MM-DD",
        })

    data = {"disponibles": [], "ocupados": []}

    for area in AreaComun.objects.all():
        # Obtener horario de apertura/cierre de la zona
        horario_inicio = timezone.make_aware(datetime.combine(fecha, area.apertura_hora))
        horario_fin = timezone.make_aware(datetime.combine(fecha, area.cierre_hora))

        # Traer reservas del día
        reservas = Reserva.objects.filter(
            area_comun=area,
            fecha=fecha,
            estado__in=['confirmada', 'pendiente']   # Solo considerar reservas confirmadas
        ).order_by("hora_inicio")

        ocupados = []
        libres = []
        current_time = horario_inicio

        for r in reservas:
            # Combinar fecha y hora para datetime aware
            inicio_dt = timezone.make_aware(datetime.combine(r.fecha, r.hora_inicio))
            fin_dt = timezone.make_aware(datetime.combine(r.fecha, r.hora_fin))

            # Añadir a ocupados
            ocupados.append({
                "hora_inicio": inicio_dt.strftime("%H:%M"),
                "hora_fin": fin_dt.strftime("%H:%M")
            })

            # Hueco libre antes de esta reserva
            if inicio_dt > current_time:
                libres.append({
                    "hora_inicio": current_time.strftime("%H:%M"),
                    "hora_fin": inicio_dt.strftime("%H:%M")
                })

            # Avanzar current_time al final de la reserva
            if fin_dt > current_time:
                current_time = fin_dt

        # Último hueco hasta cierre del área
        if current_time < horario_fin:
            libres.append({
                "hora_inicio": current_time.strftime("%H:%M"),
                "hora_fin": horario_fin.strftime("%H:%M")
            })

        data["ocupados"].append({"area_comun": area.nombre_area, "horarios": ocupados})
        data["disponibles"].append({"area_comun": area.nombre_area, "horarios": libres})

    return Response({
        "status": 1,
        "error": 0,
        "message": "Calendario de áreas comunes",
        "values": data
    })

@api_view(['PATCH'])
def marcarEntradaVisita(request):
    print(request.data)
    request.data["personal_id"] = request.user.id
    serializer = MarcarEntradaSerializer(data=request.data)
    if serializer.is_valid():
        resultado = serializer.save()
        visitante = resultado['visitante']
        registro = resultado['registro']
        return Response({
            "status": 1,
            "error": 0,
            "message": f"Entrada registrada para {visitante.nombre} {visitante.apellido} a las {registro.fecha_entrada}."
        })
    return Response({
        "status": 2,
        "error": 1,
        "message": serializer.errors
    })


@api_view(['PATCH'])
def marcarSalidaVisita(request):
    print(request.user.id)
    print(request.data)
    request.data["personal_id"] = request.user.id
    serializer = MarcarSalidaSerializer(data=request.data)
    if serializer.is_valid():
        resultado = serializer.save()
        visitante = resultado['visitante']
        registro = resultado['registro']
        return Response({
            "status": 1,
            "error": 0,
            "message": f"Salida registrada para {visitante.nombre} {visitante.apellido} a las {registro.fecha_salida}."
        })
    return Response({
        "status": 2,
        "error": 1,
        "message": serializer.errors
    })

class AreaComunViewSet(viewsets.ModelViewSet):
    queryset = AreaComun.objects.all()
    serializer_class = AreaComunSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        areas = self.get_queryset()
        serializer = self.get_serializer(areas, many=True)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Áreas listadas correctamente",
            "values": serializer.data
        })
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.idRol_id != 1:
            return Response({
                "status": 0,
                "error": 1,
                "message": "No tienes permisos para eliminar áreas comunes",
                "values": None
            })
        
        instance = self.get_object()
        instance.activa = False
        instance.estado = 'inactivo'
        instance.save()

        return Response({
            "status": 1,
            "error": 0,
            "message": f"Área con id {instance.pk} eliminada correctamente",
            "values": {}
        })

    def create(self, request, *args, **kwargs):
        #Validar si es Admin
        if not request.user.is_authenticated or request.user.idRol_id != 1:
            return Response({
                "status": 0,
                "error": 1,
                "message": "No tienes permisos para crear áreas comunes",
                "values": None
            })
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Área creada correctamente",
            "values": serializer.data
        })


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser] 

    def list(self, request, *args, **kwargs):
        reservas = self.get_queryset()
        serializer = self.get_serializer(reservas, many=True)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Reservas listadas correctamente",
            "values": serializer.data
        })
   

    def perform_create(self, serializer):
        
        serializer.save()

    def create(self, request, *args, **kwargs):
        area_nombre = request.data.get("area_comun")
        try:
            copropietario = CopropietarioModel.objects.get(idUsuario=request.user)
        except CopropietarioModel.DoesNotExist:
            return Response({
                "status": 0,
                "error": 1,
                "message": "El usuario logueado no es un copropietario"
            })
        try:
            area = AreaComun.objects.get(nombre_area=area_nombre)
        except AreaComun.DoesNotExist:
            return Response({
                "status": 0,
                "error": 1,
                "message": f"Área '{area_nombre}' no existe"
            })

        # Parsear fecha y horas
        fecha_obj = datetime.strptime(request.data.get('fecha'), "%Y-%m-%d").date()
        hora_inicio_obj = datetime.strptime(request.data.get('hora_inicio'), "%H:%M").time()
        hora_fin_obj = datetime.strptime(request.data.get('hora_fin'), "%H:%M").time()

        inicio_datetime = timezone.make_aware(datetime.combine(fecha_obj, hora_inicio_obj))
        fin_datetime = timezone.make_aware(datetime.combine(fecha_obj, hora_fin_obj))

        ahora_local = timezone.localtime()

        if inicio_datetime < ahora_local + timedelta(hours=24):
            return Response({
                "status": 0,
                "error": 1,
                "message": "Las reservas deben realizarse al menos 24 horas antes.",
                "data": None
            })

        if fin_datetime <= inicio_datetime:
            return Response({
                "status": 0,
                "error": 1,
                "message": "La hora de fin debe ser posterior a la hora de inicio.",
                "data": None
            })

        data = request.data.copy()
        data['area_comun'] = area.id_area
        data['usuario'] = copropietario.idUsuario
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "status": 1,
            "error": 0,
            "message": "Reserva creada correctamente",
            "values": serializer.data
        })


    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancelar(self, request, pk=None):
        reserva = self.get_object()
        if reserva.estado == 'cancelada':
            return Response({
                "status": 2,
                "error": 1,
                "message": "La reserva ya está cancelada",
                "values": {}
            })
        
        motivo = request.data.get('motivo_cancelacion', '')
        reserva.estado = 'cancelada'
        reserva.cancelada_en = timezone.now()
        reserva.motivo_cancelacion = motivo
        reserva.save()

        serializer = self.get_serializer(reserva)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Reserva cancelada correctamente",
            "values": serializer.data
            })
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mostrarReservasCopropietario(request):
     # 🔹 El usuario logueado está en request.user
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
    hoy = timezone.localdate()
    reservas = Reserva.objects.filter(usuario=copropietario,fecha__gte=hoy)
    
    # print(reservas)
    serializer = ListaReservasSerializer(reservas, many=True)
    return Response({
        "status": 1,
        "error": 0,
        "message": "Reservas obtenidas correctamente",
        "values": serializer.data
    })

@api_view(['PATCH'])
def cancelarReserva(request, id_reserva):
    try:
        reserva = Reserva.objects.get(id_reserva=id_reserva)
    except Reserva.DoesNotExist:
        return Response ({
            "status": 2,
            "error": 1,
            "message": "no existe ninguna reserva con ese id"
        })
    reserva.estado = 'cancelada'
    motivo_cancelacion = request.data.get('motivo_cancelacion')
    if motivo_cancelacion :
        reserva.motivo_cancelacion = motivo_cancelacion
    reserva.cancelada_en = datetime.now()
    reserva.save()
    return Response({
            "status": 1,
            "error": 0,
            "message": f"La reserva con id: {reserva.id_reserva} a sido cancelada."
        })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def adjuntarComprobante(request, id_reserva):
    try:
        reserva = Reserva.objects.get(id_reserva=id_reserva)

        if 'imagen' not in request.FILES:
            return Response({"status": 0, "message": "No se envió la imagen"})

        imagen = request.FILES['imagen']  # 👈 este nombre debe coincidir con Flutter
        reserva.url_comprobante = imagen
        reserva.save()

        return Response({
            "status": 1,
            "message": "Comprobante subido correctamente",
            "url_comprobante": reserva.url_comprobante if reserva.url_comprobante else None
        })

    except Reserva.DoesNotExist:
        return Response({"status": 0, "message": "Reserva no encontrada"})
    except Exception as e:
        return Response({"status": 0, "message": str(e)})

