from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import serializers
from tareas.models import TareaModel,TareaPersonalModel
from users.models import PersonalModel
from django.db.models import Q
import requests

class TareaPersonalSerializer(serializers.ModelSerializer):
    tarea = serializers.CharField(source= 'tarea.titulo')
    tarea_id = serializers.IntegerField(source= 'tarea.id')
    descripcion = serializers.CharField(source = 'tarea.descripcion')
    personal = serializers.CharField(source= 'personal.idUsuario.nombre')
    personal_id = serializers.IntegerField(source='personal.idUsuario.id')
    class Meta:
        model = TareaPersonalModel
        fields = ['id', 'tarea_id', 'tarea','descripcion', 'personal', 'fecha_asignacion', 'hora_realizacion', 'estado', 'personal_id']

class TareaSerializer(serializers.ModelSerializer):
    asignaciones = TareaPersonalSerializer(source='tareapersonalmodel_set', many=True) 
    class Meta:
        model = TareaModel
        fields = ['id', 'titulo', 'descripcion', 'fecha_creacion', 'frecuencia', 'asignaciones']

class CrearTareaSerializer(serializers.ModelSerializer):
    # Permitimos enviar un listado de IDs de personal para asignar
    personal_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = TareaModel
        fields = ['id', 'titulo', 'descripcion', 'frecuencia', 'personal_ids']

    def create(self, validated_data):
        personal_ids = validated_data.pop('personal_ids', [])
        tarea = TareaModel.objects.create(**validated_data)
        
        # Asignar la tarea a cada personal
        for pid in personal_ids:
            personal = PersonalModel.objects.get(idUsuario=pid)
            TareaPersonalModel.objects.create(tarea=tarea, personal=personal)
        return tarea