from django.urls import path
from . import views

urlpatterns = [
    path('mostrarTareasPersonal', views.mostrarTareasPersonal, name='mostrarTareasPersonal'),
    path('crearTarea', views.crearTarea, name='crearTarea'),
    path('asignarPersonalTarea/<int:tarea_id>', views.asignarPersonalTarea, name='asignarPersonalTarea'),
    path('mostrarTodasTareas', views.mostrarTodasTareas, name='mostrarTodasTareas'),
    path('marcarTareaRealizada/<int:id_tarea_personal>', views.marcarTareaRealizada, name = 'marcarTareaRealizada'),
    # path('', views.ListarComunicado, name="mostrarComunicados"),
]