import os
from django.conf import settings
import firebase_admin
from firebase_admin import credentials, messaging
import json

def initialize_firebase():
    if not firebase_admin._apps:
        try:
            # Opción 1: Buscar en la ruta de Secrets Files de Render
            render_secrets_path = '/etc/secrets/firebase_key.json'
            
            # Opción 2: Ruta local de desarrollo
            local_secrets_path = os.path.join(settings.BASE_DIR, 'secrets', 'firebase_key.json')
            
            # Opción 3: Desde variable de entorno (backup)
            firebase_config_json = os.environ.get('FIREBASE_CONFIG')
            
            if os.path.exists(render_secrets_path):
                # Render Secrets Files
                cred = credentials.Certificate(render_secrets_path)
                print("Firebase initialized from Render Secrets Files")
            elif os.path.exists(local_secrets_path):
                # Desarrollo local
                cred = credentials.Certificate(local_secrets_path)
                print("Firebase initialized from local file")
            elif firebase_config_json:
                # Desde variable de entorno
                firebase_config = json.loads(firebase_config_json)
                cred = credentials.Certificate(firebase_config)
                print("Firebase initialized from environment variable")
            else:
                raise Exception("No Firebase configuration found")
            
            firebase_admin.initialize_app(cred)
            
        except Exception as e:
            print(f"Firebase initialization failed: {e}")
            # No raises exception para no detener la aplicación

# Inicializar al importar
initialize_firebase()

def enviar_notificacion(token, titulo, mensaje):
    # Tu función existente
    try:
        # Verificar si Firebase está inicializado
        if not firebase_admin._apps:
            initialize_firebase()
            if not firebase_admin._apps:
                return False, "Firebase not initialized"
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=titulo,
                body=mensaje,
            ),
            token=token,
        )
        response = messaging.send(message)
        return True, response
    except Exception as e:
        return False, str(e)