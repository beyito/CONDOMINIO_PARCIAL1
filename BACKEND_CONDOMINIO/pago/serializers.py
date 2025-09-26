
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import serializers
from .models import PagoModel
from users.models import CopropietarioModel, PersonalModel, PersonaModel
from django.db.models import Q

class ListaPagosSerializer(serializers.ModelSerializer):
    copropietario_nombre = serializers.CharField(source='copropietario.idUsuario.nombre', read_only=True)
    copropietario_id = serializers.IntegerField(source='copropietario.idUsuario.id', read_only=True)

    class Meta:
        model = PagoModel
        fields = ['id','descripcion','fecha_emision', 'fecha_pago', 'monto', 'url_comprobante', 'estado', 'tipo_pago', 'copropietario_id','copropietario_nombre']