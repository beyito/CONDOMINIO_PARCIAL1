from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import serializers
from tareas.models import TareaModel,TareaPersonalModel
from django.db.models import Q
import requests



class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TareaModel
        fields = '__all__'

class TareaPersonalSerializer(serializers.ModelSerializer):
    tarea = serializers.CharField(source= 'tarea.titulo')
    descripcion = serializers.CharField(source = 'tarea.descripcion')
    personal = serializers.CharField(source= 'personal.idUsuario.nombre')
    class Meta:
        model = TareaPersonalModel
        fields = ['id', 'tarea','descripcion', 'personal', 'fecha_asignacion', 'hora_realizacion', 'estado']
