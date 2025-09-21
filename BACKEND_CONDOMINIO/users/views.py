
from rest_framework import generics, viewsets, status
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, MyTokenObtainPairSerializer, CopropietarioSerializer, PersonalSerializer, ResidenteSerializer, PersonalListSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework.exceptions import AuthenticationFailed
from .models import PersonalModel, Residente
from unidad_pertenencia.models import Unidad
from rest_framework.decorators import api_view
User = get_user_model()

class RegisterCopropietarioView(generics.CreateAPIView):
    serializer_class = CopropietarioSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['idRol'] = 2  # rol de copropietario
        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            usuario = serializer.save()
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
    
# Listar todo el personal
class PersonalListView(generics.ListAPIView):
    queryset = PersonalModel.objects.select_related('idUsuario').all()
    serializer_class = PersonalListSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Lista de personal obtenida correctamente",
            "values": serializer.data
        })

# Obtener o editar un personal específico
class PersonalDetailView(generics.RetrieveUpdateAPIView):
    queryset = PersonalModel.objects.select_related('idUsuario').all()
    serializer_class = PersonalSerializer
    lookup_field = 'idUsuario'  # porque tu PK es OneToOne con Usuario
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "status": 1,
            "error": 0,
            "message": "Personal obtenido correctamente",
            "values": serializer.data
        })

    def update(self, request, *args, **kwargs):
        personal = self.get_object()  # PersonalModel
        usuario = personal.idUsuario  # Usuario real
        serializer = self.get_serializer(usuario, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Actualizar campos de PersonalModel
        personal.turno = request.data.get('turno', personal.turno)
        personal.tipo_personal = request.data.get('tipo_personal', personal.tipo_personal)
        personal.save()

        return Response({
            "status": 1,
            "error": 0,
            "message": "Personal actualizado correctamente",
            "values": serializer.data
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


        