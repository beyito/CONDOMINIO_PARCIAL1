"""
URL configuration for condominio project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls import include
from rest_framework import routers
from django.http import JsonResponse
from django.conf.urls.static import static
from django.conf import settings
def home(request):
    return JsonResponse({"status": "ok", "message": "Backend funcionando 🚀"})

urlpatterns = [
    path("", home),
    path('admin/', admin.site.urls),
    path('usuario/', include('users.urls')),
    path('areacomun/', include('area_comun.urls')),
    path('comunicacion/', include('comunicacion.urls')),
    path('unidadpertenencia/', include('unidad_pertenencia.urls')),
    path('tareas/', include('tareas.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
