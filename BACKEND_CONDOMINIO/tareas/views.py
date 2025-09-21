from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view,action
from rest_framework.response import Response
from datetime import datetime
from .models import TareaPersonalModel, TareaModel
from .serializers import TareaPersonalSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from condominio.permissions import IsPersonal, IsCopropietario

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
