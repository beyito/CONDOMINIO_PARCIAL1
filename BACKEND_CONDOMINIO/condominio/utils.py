import firebase_admin
from firebase_admin import credentials, messaging
import os
import json
from dotenv import load_dotenv

load_dotenv()  # Carga variables de .env

if not firebase_admin._apps:
    firebase_key_json = os.environ.get("FIREBASE_KEY_JSON")
    cred = credentials.Certificate(json.loads(firebase_key_json))
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
