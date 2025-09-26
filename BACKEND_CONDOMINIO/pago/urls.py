from django.urls import path
from . import views

urlpatterns = [
    path('adjuntarComprobanteReserva/<int:id_reserva>/', views.adjuntarComprobanteReserva, name = 'adjuntarComprobanteReserva'),
    path('adjuntarComprobanteExpensa/<int:id_expensa>/',views.adjuntarComprobanteExpensa, name = 'adjuntarComprobanteExpensa'),
    path('mostrarPagosCopropietario', views.mostrarPagosCopropietario, name = 'mostrarPagosCopropietario'),
    path('generarExpensas', views.generarExpensas, name = 'generarExpensas'),
    # path('mostrarTodasTareas', views.mostrarTodasTareas, name='mostrarTodasTareas'),
    # path('marcarTareaRealizada/<int:id_tarea_personal>', views.marcarTareaRealizada, name = 'marcarTareaRealizada'),
]