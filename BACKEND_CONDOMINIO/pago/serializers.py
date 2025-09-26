from rest_framework import serializers
from .models import PagoModel
from area_comun.models import Reserva

class ListaPagosSerializer(serializers.ModelSerializer):
    copropietario_nombre = serializers.CharField(source='copropietario.idUsuario.nombre', read_only=True)
    copropietario_id = serializers.IntegerField(source='copropietario.idUsuario.id', read_only=True)
    reserva_id = serializers.SerializerMethodField()  # ✅
    expensa_id = serializers.SerializerMethodField()  # ✅


    class Meta:
        model = PagoModel
        fields = ['id','descripcion','fecha_emision','fecha_pago','monto','url_comprobante',
                  'reserva_id','estado','tipo_pago','copropietario_id','copropietario_nombre']

    def get_reserva_id(self, obj):
        # obj es la instancia de PagoModel
        try:
            reserva = Reserva.objects.get(pago=obj)
            return reserva.id_reserva
        except Reserva.DoesNotExist:
            return None
