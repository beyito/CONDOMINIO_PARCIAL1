# users/urls.py
from django.urls import include, path
from .views import RegisterView, UserViewSet, MyTokenObtainPairView, LogoutView, RegisterCopropietarioView, RegisterPersonalView, PerfilUsuarioView, ResidenteViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

routerResidente = routers.DefaultRouter()
routerResidente.register(r'', ResidenteViewSet, basename='residentes')

urlpatterns = [
    # ESTA RUTA REGISTRA UN USUARIO ADMINISTRADOR
    path('register/', RegisterView.as_view(), name='register'),

    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil'), #obtener el perfil del usuario logueado
    path('mostrarUsuarios/', UserViewSet.as_view({'get': 'list'}), name='mostrarUsuarios'), #listar todos los usuarios
    path('registrarCopropietario/', RegisterCopropietarioView.as_view(), name='registrarCopropietario'), #registro de copropietario
    path('registrarPersonal/', RegisterPersonalView.as_view(), name='registrarPersonal'), #registro de personal, se le envía el tipo_personal
    path('api/v1/', include(router.urls)), #CRUD de los usuarios
    path('residentes/',include(routerResidente.urls)), #CRUD de los residentes
]
