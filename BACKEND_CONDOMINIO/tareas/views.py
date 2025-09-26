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
from django.db import transaction
from users.bitacora import registrar_bitacora

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
    registrar_bitacora(request, "Listo sus tareas")
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
        registrar_bitacora(request, f"Registró tarea {tarea.id} - {tarea.tarea}")
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
    fecha = request.data.get('fecha')  # fecha que viene del frontend

    print("datos que llegan:", request.data)

    if not fecha:
        return Response({
            "status": 0,
            "error": 1,
            "message": "La fecha es obligatoria"
        })

    try:
        tarea = TareaModel.objects.get(id=tarea_id)
    except TareaModel.DoesNotExist:
        return Response({
            "status": 0,
            "error": 1,
            "message": "La tarea no existe"
        })

    # Obtener asignaciones actuales solo para esa fecha
    actuales = TareaPersonalModel.objects.filter(tarea=tarea, fecha_asignacion=fecha)
    
    # Eliminar los que ya no están seleccionados para esa fecha
    actuales.exclude(personal__idUsuario__in=personal_ids).delete()

    # Crear los nuevos asignados solo para esa fecha
    for pid in personal_ids:
        personal = PersonalModel.objects.get(idUsuario=pid)
        TareaPersonalModel.objects.get_or_create(
            tarea=tarea,
            personal=personal,
            fecha_asignacion=fecha  # ⚠️ IMPORTANTE
        )
    registrar_bitacora(request, f"Asignó personal a la tarea {tarea.id} - {tarea.id}")
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

@api_view(['POST'])
def marcarTareaRealizada(request, id_tarea_personal):
    try:
        tareaPersonal = TareaPersonalModel.objects.get(id=id_tarea_personal)
    except TareaPersonalModel.DoesNotExist:
        return Response ({
            "status": 2,
            "error": 1,
            "message": "no existe ninguna tarea personal con ese id"
        })
    tareaPersonal.estado = 'hecho'
    tareaPersonal.hora_realizacion = timezone.now().time().replace(microsecond=0)
    tareaPersonal.save()
    registrar_bitacora(request, f"Marco la tarea personal con id: {tareaPersonal.id} como realizada")
    return Response({
            "status": 1,
            "error": 0,
            "message": f"La tarea personal con id: {tareaPersonal.id} a sido marcada como realizada."
        })
