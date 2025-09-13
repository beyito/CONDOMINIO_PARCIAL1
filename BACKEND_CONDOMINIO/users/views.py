
from rest_framework import generics, viewsets, status
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, MyTokenObtainPairSerializer, CopropietarioSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

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
            serializer.save()  # llama automáticamente al create del serializer
            return Response({
                "Status": 1,
                "Error": 0,
                "message": "Usuario registrado correctamente",
                "data": serializer.data
            })
        return Response({
            "Status": 2,
            "Error": 1,
            "message": "Usuario no se pudo registrar correctamente",
            "errors": serializer.errors
        })

class RegisterGuardiaView(generics.CreateAPIView):
    serializer_class = CopropietarioSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['idRol'] = 3  # forzar el rol de guardia
        print(data)
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()  # llama automáticamente al create del serializer
            return Response({
                "Status": 1,
                "Error": 0,
                "message": "Usuario registrado correctamente",
                "data": serializer.data
            })
        return Response({
            "Status": 2,
            "Error": 1,
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
            "Status": 1,
            "Error": 0,
            "message": "Usuario registrado correctamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response({
            "Status": 1,
            "Error": 0,
            "message": "Usuarios listados correctamente",
            "data": serializer.data
        })


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
             return Response({
                 "Status": 2,
                 "Error": 1,
                 "message": "Error al iniciar sesión",
                 "data": {}
             })
        
        return Response({
            "Status": 1,
            "Error": 0,
            "message": "Se inició sesión correctamente",
            "data": serializer.validated_data
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Tomamos el access token del header Authorization
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return Response({
                    "Status": 2,
                    "Error": 1,
                    "message": "No se proporcionó token de acceso"
                }, status=status.HTTP_400_BAD_REQUEST)

            token_str = auth_header.split(" ")[1]  # "Bearer <token>"
            token = AccessToken(token_str)

            # Si tu configuración tiene blacklist habilitado, podemos invalidarlo
            if hasattr(token, 'blacklist'):
                token.blacklist()

            return Response({
                "Status": 1,
                "Error": 0,
                "message": "Se cerró la sesión correctamente",
            }, status=status.HTTP_205_RESET_CONTENT)

        except Exception as e:
            return Response({
                "Status": 2,
                "Error": 1,
                "message": f"Error al cerrar la sesión: {str(e)}",
            }, status=status.HTTP_400_BAD_REQUEST)
        