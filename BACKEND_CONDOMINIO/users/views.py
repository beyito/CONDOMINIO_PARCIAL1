
from rest_framework import generics, viewsets, status
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, MyTokenObtainPairSerializer, CopropietarioSerializer, PersonalSerializer, ResidenteSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework.exceptions import AuthenticationFailed
from .models import PersonalModel, Residente
from rest_framework.decorators import api_view
User = get_user_model()

class RegisterCopropietarioView(generics.CreateAPIView):
    serializer_class = CopropietarioSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['idRol'] = 2  # forzar el rol de copropietario
        print(data)
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            usuario = serializer.save()  # crea el copropietario

            # Crear Residente automáticamente
            unidad_id = data.get('unidad')  # debe venir el ID de la unidad
            if unidad_id:
                try:
                    unidad = Unidad.objects.get(id=unidad_id)
                    # Cambiar estado a activa
                    unidad.estado = "activa"
                    unidad.save()

                    Residente.objects.create(
                        nombre=usuario.nombre,
                        ci=usuario.ci,
                        telefono=usuario.telefono,
                        correo=usuario.email,
                        estado='activo',
                        id_unidad=unidad
                    )
                except Unidad.DoesNotExist:
                    pass  # opcional: manejar error si la unidad no exist
            return Response({
                "status": 1,
                "error": 0,
                "message": "Usuario registrado correctamente",
                "values": serializer.data
            })
        print("VALIDACION FALLIDA:", serializer.errors)
        return Response({
            "status": 2,
            "error": 1,
            "message": "Usuario no se pudo registrar correctamente",
            "errors": serializer.errors
        })

class RegisterPersonalView(generics.CreateAPIView):
    serializer_class = PersonalSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['idRol'] = 3  # forzar el rol de personal
        print(data)
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()  # llama automáticamente al create del serializer
            return Response({
                "status": 1,
                "error": 0,
                "message": "Usuario registrado correctamente",
                "values": serializer.data
            })
        return Response({
            "status": 2,
            "error": 1,
            "message": "Usuario no se pudo registrar correctamente",
            "errors": serializer.errors
        })


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Usuario registrado correctamente",
            "values": serializer.data
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Usuarios listados correctamente",
            "values": serializer.data
        })


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print("Request data", request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed as e:
            # Aquí puedes personalizar según el mensaje
            error_msg = str(e)
            if "No active account" in error_msg:
                return Response({
                    "status": 2,
                    "error": 1,
                    "message": "Usuario o contraseña incorrectos"
                })
            
            return Response({
                "status": 2,
                "error": 1,
                "message": error_msg
            })

        # Si pasó la validación
        return Response({
            "status": 1,
            "error": 0,
            "message": "Se inició sesión correctamente",
            "values": serializer.validated_data
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Tomamos el access token del header Authorization
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return Response({
                    "status": 2,
                    "error": 1,
                    "message": "No se proporcionó token de acceso"
                })

            token_str = auth_header.split(" ")[1]  # "Bearer <token>"
            token = AccessToken(token_str)

            # Si tu configuración tiene blacklist habilitado, podemos invalidarlo
            if hasattr(token, 'blacklist'):
                token.blacklist()

            return Response({
                "status": 1,
                "error": 0,
                "message": "Se cerró la sesión correctamente",
            })

        except Exception as e:
            return Response({
                "status": 2,
                "error": 1,
                "message": f"Error al cerrar la sesión: {str(e)}",
            })
# VER PERFIL

class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        usuario = request.user  # ya es el usuario autenticado
        if usuario.idRol.idRol > 2 : 
            personal = PersonalModel.objects.get(idUsuario=usuario.id)  # ✅ Correcto          
            rol = personal.tipo_personal 
        else: 
            rol = usuario.idRol.name
        print(usuario)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Perfil obtenido correctamente",
            "values": {
                    "id": usuario.id,
                    "username": usuario.username,
                    "nombre": usuario.nombre,
                    "ci": usuario.ci,
                    "email": usuario.email,
                    "telefono": usuario.telefono,
                    "rol": rol,
            }
        })
class ResidenteViewSet(viewsets.ModelViewSet):
    queryset = Residente.objects.all().order_by("-created_at")
    serializer_class = ResidenteSerializer


        