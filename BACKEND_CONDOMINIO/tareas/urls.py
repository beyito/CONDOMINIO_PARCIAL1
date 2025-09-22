from django.urls import path
from . import views

urlpatterns = [
    path('mostrarTareasPersonal', views.mostrarTareasPersonal, name='mostrarTareasPersonal'),
    path('crearTarea', views.crearTarea, name='crearTarea'),
    path('asignarPersonalTarea/<int:tarea_id>', views.asignarPersonalTarea, name='asignarPersonalTarea'),
    path('mostrarTodasTareas', views.mostrarTodasTareas, name='mostrarTodasTareas'),
    # path('', views.ListarComunicado, name="mostrarComunicados"),
]