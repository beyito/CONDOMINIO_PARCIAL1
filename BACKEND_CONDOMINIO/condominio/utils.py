import os
import firebase_admin
from firebase_admin import credentials, messaging

# Obtener la ruta absoluta del archivo de claves
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
firebase_key_path = os.path.join(BASE_DIR, 'secrets', 'firebase_key.json')

# Inicializar Firebase solo una vez
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_key_path)
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
