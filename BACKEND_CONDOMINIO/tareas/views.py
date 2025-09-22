from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view,action
from rest_framework.response import Response
from datetime import datetime
from .models import TareaPersonalModel, TareaModel
from .serializers import TareaPersonalSerializer, CrearTareaSerializer, TareaSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from condominio.permissions import IsPersonal, IsCopropietario
from users.serializers import PersonalListSerializer
from users.models import PersonalModel

# Create your views here.

# MOSTRAR TAREAS PARA UN PERSONAL
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsPersonal])
def mostrarTareasPersonal(request):
    print(request.user.id)
    # request['idUsuario'] = request.user.id

    tareas = TareaPersonalModel.objects.filter(personal = request.user.id, fecha_asignacion = timezone.now().date())
    tareas_serializadas = TareaPersonalSerializer(tareas, many=True).data

    # print(TareaPersonalSerializer(tareas, many=True).data)
    # data = []
    # for tarea in tareas_serializadas:
    #     data.append({
    #         "id": tarea["id"],
    #         "tarea": tarea["tarea"],
    #         "descripcion": tarea["descripcion"],
    #         "personal": tarea["personal"],
    #         "fecha_asignacion": tarea["fecha_asignacion"],
    #         "hora_realizacion": tarea["hora_realizacion"],
    #         "estado": tarea["estado"],
    #     })

    return Response({
        "status": 1,
        "error": 0,
        "message": "Tareas listadas correctamente",
        "values": tareas_serializadas #data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crearTarea(request):
    serializer = CrearTareaSerializer(data=request.data)
    if serializer.is_valid():
        tarea = serializer.save()
        return Response({
            "status": 1,
            "error": 0,
            "message": "Tarea creada y asignada correctamente",
            "tarea": serializer.data
        })
    return Response({
        "status": 0,
        "error": 1,
        "message": "Error al crear tarea",
        "details": serializer.errors
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignarPersonalTarea(request, tarea_id):
    personal_ids = request.data.get('personal_ids', [])
    try:
        tarea = TareaModel.objects.get(id=tarea_id)
    except TareaModel.DoesNotExist:
        return Response({
            "status": 0,
            "error": 1,
            "message": "La tarea no existe"
        })

    # Obtener todos los asignados actualmente
    actuales = TareaPersonalModel.objects.filter(tarea=tarea)
    
    # Eliminar los que ya no están seleccionados
    actuales.exclude(personal__idUsuario__in=personal_ids).delete()
    

    # Crear los nuevos asignados
    for pid in personal_ids:
        personal = PersonalModel.objects.get(idUsuario=pid)
        TareaPersonalModel.objects.get_or_create(tarea=tarea, personal=personal)

    return Response({
        "status": 1,
        "error": 0,
        "message": "Personal actualizado correctamente"
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # o IsAdmin si quieres restringir
def mostrarTodasTareas(request):
    tareas = TareaModel.objects.all()

    fecha = request.GET.get('fecha')
    if fecha:
        tareas = tareas.filter(tareapersonalmodel__fecha_asignacion=fecha)

    tareas_serializadas = []
    for tarea in tareas:
        asignaciones = TareaPersonalModel.objects.filter(tarea=tarea)
        asignaciones_serializadas = TareaPersonalSerializer(asignaciones, many=True).data
        
        # Estado general de la tarea (opcional)
        if not asignaciones_serializadas:
            estado_general = 'Sin Asignar'
        elif all(a['estado'].lower() == 'hecho' for a in asignaciones_serializadas):
            estado_general = 'hecho'
        elif any(a['estado'].lower() == 'pendiente' for a in asignaciones_serializadas):
            estado_general = 'pendiente'
        else:
            estado_general = 'Sin Asignar'



        tareas_serializadas.append({
            'id': tarea.id,
            'titulo': tarea.titulo,
            'descripcion': tarea.descripcion,
            'fecha_creacion': tarea.fecha_creacion,
            'frecuencia': tarea.frecuencia,
            'estado': estado_general,
            'asignaciones': asignaciones_serializadas
        })

    return Response({
        "status": 1,
        "error": 0,
        "message": "Todas las tareas listadas correctamente",
        "values": tareas_serializadas
    })
# # Create your views here.
# @api_view(['GET'])
# def mostrarCalendarioAreasComunes(request):
#     # Obtener fecha del body
#     fecha_str = request.data.get("fecha")
#     if not fecha_str:
#         return Response({
#             "status": 2,
#             "error": 1,
#             "message": "Debe enviar una fecha en formato YYYY-MM-DD",
#         })

#     try:
#         fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
#     except ValueError:
#         return Response({
#             "status": 2,
#             "error": 1,
#             "message": "Formato de fecha inválido, use YYYY-MM-DD",
#         })

#     data = {"disponibles": [], "ocupados": []}

#     for area in AreaComun.objects.all():
#         # Obtener horario de apertura/cierre de la zona
#         horario_inicio = timezone.make_aware(datetime.combine(fecha, area.apertura_hora))
#         horario_fin = timezone.make_aware(datetime.combine(fecha, area.cierre_hora))

#         # Traer reservas del día
#         reservas = Reserva.objects.filter(
#             area_comun=area,
#             fecha=fecha,
#             estado='confirmada'  # Solo considerar reservas confirmadas
#         ).order_by("hora_inicio")

#         ocupados = []
#         libres = []
#         current_time = horario_inicio

#         for r in reservas:
#             # Combinar fecha y hora para datetime aware
#             inicio_dt = timezone.make_aware(datetime.combine(r.fecha, r.hora_inicio))
#             fin_dt = timezone.make_aware(datetime.combine(r.fecha, r.hora_fin))

#             # Añadir a ocupados
#             ocupados.append({
#                 "hora_inicio": inicio_dt.strftime("%H:%M"),
#                 "hora_fin": fin_dt.strftime("%H:%M")
#             })

#             # Hueco libre antes de esta reserva
#             if inicio_dt > current_time:
#                 libres.append({
#                     "hora_inicio": current_time.strftime("%H:%M"),
#                     "hora_fin": inicio_dt.strftime("%H:%M")
#                 })

#             # Avanzar current_time al final de la reserva
#             if fin_dt > current_time:
#                 current_time = fin_dt

#         # Último hueco hasta cierre del área
#         if current_time < horario_fin:
#             libres.append({
#                 "hora_inicio": current_time.strftime("%H:%M"),
#                 "hora_fin": horario_fin.strftime("%H:%M")
#             })

#         data["ocupados"].append({"area_comun": area.nombre_area, "horarios": ocupados})
#         data["disponibles"].append({"area_comun": area.nombre_area, "horarios": libres})

#     return Response({
#         "status": 1,
#         "error": 0,
#         "message": "Calendario de áreas comunes",
#         "values": data
#     })
