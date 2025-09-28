from .models import Dispositivo
from .utils import enviar_notificacion

def notificar_usuario(usuario, titulo, mensaje):
    dispositivos = Dispositivo.objects.filter(usuario=usuario)
    for disp in dispositivos:
        enviar_notificacion(disp.token, titulo, mensaje)
