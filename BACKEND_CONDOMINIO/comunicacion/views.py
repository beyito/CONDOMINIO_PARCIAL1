from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Comunicado
from .serializers import ListarComunicadoSerializer, ComunicadoSerializer
from users.models import Usuario


# Create your views here.
# CREAR COMUNICADO SOLO LO PUEDE HACER EL ADMINISTRADOR
@api_view(["POST"])
def crearComunicado(request, administrador_id):
    try:
        admin = Usuario.objects.get(id=administrador_id)
        print(admin)
    except Usuario.DoesNotExist:
        return Response({"status": 2, "error": 1, "message": "Usuario no encontrado"})

    if not admin.es_admin():
        return Response(
            {
                "status": 2,
                "error": 1,
                "message": "El usuario no es un administrador válido.",
            }
        )
    data = request.data.copy()
    data["administrador"] = administrador_id
    # Pasa el ID, no el objeto
    print(data)

    serializer = ComunicadoSerializer(data=data)
    if serializer.is_valid():
        comunicado = serializer.save()  # aquí Django crea el objeto correctamente
        return Response(
            {
                "status": 1,
                "error": 0,
                "message": "Comunicado creado correctamente",
                "values": ComunicadoSerializer(comunicado).data,
            }
        )

    return Response(
        {
            "status": 2,
            "error": 1,
            "message": "Error al crear el comunicado",
            "values": serializer.errors,
        }
    )


@api_view(["GET"])
def ListarComunicado(request):
    objetos = Comunicado.objects.filter(activo=True)
    serializer = ListarComunicadoSerializer(objetos, many=True)
    
    return Response(
        {
            "status": 1,
            "errorr": 0,
            "message": "Se crea la lista de comunicados correctamente",
            "values": serializer.data,
        }
    )

# ----------------------------------
# EDITAR COMUNICADO
# ----------------------------------
@api_view(["PUT"])
def editarComunicado(request, comunicado_id, administrador_id):
    try:
        admin = Usuario.objects.get(id=administrador_id)
    except Usuario.DoesNotExist:
        return Response({"status": 2, "error": 1, "message": "Usuario no encontrado"})

    if not admin.es_admin():
        return Response({"status": 2, "error": 1, "message": "Usuario no es administrador válido."})

    try:
        comunicado = Comunicado.objects.get(id=comunicado_id)
    except Comunicado.DoesNotExist:
        return Response({"status": 2, "error": 1, "message": "Comunicado no encontrado"})

    data = request.data.copy()
    data["administrador"] = administrador_id  # aseguramos que siga siendo del admin

    serializer = ComunicadoSerializer(comunicado, data=data, partial=True)  # partial permite actualizar algunos campos
    if serializer.is_valid():
        comunicado = serializer.save()
        return Response({
            "status": 1,
            "error": 0,
            "message": "Comunicado actualizado correctamente",
            "values": ComunicadoSerializer(comunicado).data
        })
    return Response({
        "status": 2,
        "error": 1,
        "message": "Error al actualizar comunicado",
        "values": serializer.errors
    })


# ----------------------------------
# ELIMINAR COMUNICADO
# ----------------------------------
@api_view(["DELETE"])
def eliminarComunicado(request, comunicado_id, administrador_id):
    try:
        admin = Usuario.objects.get(id=administrador_id)
    except Usuario.DoesNotExist:
        return Response({"status": 2, "error": 1, "message": "Usuario no encontrado"})

    if not admin.es_admin():
        return Response({"status": 2, "error": 1, "message": "Usuario no es administrador válido."})

    try:
        comunicado = Comunicado.objects.get(id=comunicado_id)
    except Comunicado.DoesNotExist:
        return Response({"status": 2, "error": 1, "message": "Comunicado no encontrado"})

    # Opción 1: eliminar físicamente
    # comunicado.delete()

    # Opción 2: marcar como inactivo (recomendado)
    comunicado.activo = False
    comunicado.save()

    return Response({
        "status": 1,
        "error": 0,
        "message": "Comunicado eliminado correctamente"
    })
