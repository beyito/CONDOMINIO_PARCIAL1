from django.urls import path
from . import views

urlpatterns = [
    path('adjuntarComprobanteReserva/<int:id_reserva>/', views.adjuntarComprobanteReserva, name = 'adjuntarComprobanteReserva'),
    path('adjuntarComprobante/<int:id_pago>/',views.adjuntarComprobante, name = 'adjuntarComprobante'),
    path('mostrarPagosCopropietario', views.mostrarPagosCopropietario, name = 'mostrarPagosCopropietario'),
    path('generarExpensas', views.generarExpensas, name = 'generarExpensas'),
    path('listarPagosAdmin/', views.listarPagosAdmin, name='listarPagosAdmin'),
    path('actualizarEstadoPago/<int:id_pago>/', views.actualizarEstadoPago, name='actualizarEstadoPago'),
    path('detallePagoAdmin/<int:id_pago>/', views.detallePagoAdmin, name='detallePagoAdmin'),
    path('marcarPagosEnMora/', views.marcarPagosEnMora, name='marcarPagosEnMora'),
    # path('mostrarTodasTareas', views.mostrarTodasTareas, name='mostrarTodasTareas'),
    # path('marcarTareaRealizada/<int:id_tarea_personal>', views.marcarTareaRealizada, name = 'marcarTareaRealizada'),
]