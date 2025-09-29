import firebase_admin
from firebase_admin import credentials, messaging
import os

if not firebase_admin._apps:
    key_path = os.path.join(os.path.dirname(__file__), '..', 'secrets', 'firebase_key.json')
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)

def enviar_notificacion(token, titulo, cuerpo, data_extra=None):
    message = messaging.Message(
        notification=messaging.Notification(
            title=titulo,
            body=cuerpo
        ),
        data=data_extra or {},
        token=token
    )
    response = messaging.send(message)
    return response
