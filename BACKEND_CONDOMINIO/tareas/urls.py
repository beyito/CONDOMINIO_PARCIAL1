from django.urls import path
from . import views

urlpatterns = [
    path('mostrarTareasPersonal', views.mostrarTareasPersonal, name='mostrarTareasPersonal'),
    # path('', views.ListarComunicado, name="mostrarComunicados"),
]