from .models import Bitacora
def registrar_bitacora(request, accion):
    # Obtener la IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    # Guardar en la bitácora
    Bitacora.objects.create(
        accion=accion,
        ip=ip
    )