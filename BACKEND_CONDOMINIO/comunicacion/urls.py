from django.urls import path
from . import views

urlpatterns = [
    path('crearComunicado/<int:administrador_id>', views.crearComunicado, name='crearComunicado'),
    path('mostrarComunicados', views.ListarComunicado, name="mostrarComunicados"),
    path('editarComunicado/<int:comunicado_id>/<int:administrador_id>', views.editarComunicado, name='editarComunicado'),
    path('eliminarComunicado/<int:comunicado_id>/<int:administrador_id>', views.eliminarComunicado, name='eliminarComunicado')
]