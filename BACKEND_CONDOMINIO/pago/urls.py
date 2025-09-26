from django.urls import path
from . import views

urlpatterns = [
    path('adjuntarComprobanteReserva/<int:id_reserva>/', views.adjuntarComprobanteReserva, name = 'adjuntarComprobanteReserva')
    # path('mostrarTodasTareas', views.mostrarTodasTareas, name='mostrarTodasTareas'),
    # path('marcarTareaRealizada/<int:id_tarea_personal>', views.marcarTareaRealizada, name = 'marcarTareaRealizada'),
]