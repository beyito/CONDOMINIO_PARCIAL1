from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import serializers
from .models import AutorizacionVisita, RegistroVisitaModel, AreaComun, Reserva
from users.models import CopropietarioModel, PersonalModel, PersonaModel
from django.db.models import Q
import requests

# CALNEDARIO AREA COMUNES
class AreaComunSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaComun
        fields = '__all__'

class RegistroVisita(serializers.ModelSerializer):
    class Meta:
        model = RegistroVisitaModel
        fields = '__all__'

class ReservaSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(write_only=True, required=False)
    area_comun = serializers.PrimaryKeyRelatedField(queryset=AreaComun.objects.all(), required=False)

    class Meta:
        model = Reserva
        fields = '__all__'
        read_only_fields = ['usuario']

    def create(self, validated_data):
        imagen = validated_data.pop('imagen', None)
        if imagen:

        # 2️⃣ Subir la imagen a ImgBB
            api_key = "8d18e4a7c02bd81c54d5c190ceddfdd9" # Reemplazar con tu propia API key de ImgBB
            files = {'image': imagen.read()}
            response = requests.post(
               f'https://api.imgbb.com/1/upload?key={api_key}',
              files=files
            )
            if response.status_code == 200:
               url = response.json()['data']['url']
               validated_data['url_comprobante'] = url
            else:
                raise serializers.ValidationError("Error subiendo la imagen a ImgBB")

        # 3️⃣ Obtener el Copropietario del usuario logueado
        usuario_actual = self.context['request'].user
        try:
            copropietario = CopropietarioModel.objects.get(idUsuario=usuario_actual)
        except CopropietarioModel.DoesNotExist:
            raise serializers.ValidationError("El usuario logueado no es un copropietario.")

        # 4️⃣ Crear la reserva
        reserva = Reserva.objects.create(usuario=copropietario, **validated_data)
        return reserva

    def validate(self, data):
        fecha = data['fecha']
        hora_inicio = data['hora_inicio']
        hora_fin = data['hora_fin']
        area = data['area_comun']
       

        # 🔹 Validación: solapamiento de reservas
        solapadas = Reserva.objects.filter(
            area_comun=area,
            fecha=fecha
        ).filter(
            Q(hora_inicio__lt=hora_fin) & Q(hora_fin__gt=hora_inicio)
        )

        if solapadas.exists():
            raise serializers.ValidationError({
                "Status": 0,
                "Error": 1,
                "message": "Ya existe una reserva en ese horario para esta área.",
                "data": None
            })

        return data
# REGISTRO DE VISITAS

class ListaVisitantesSerializer(serializers.ModelSerializer):
    id = "id"
    copropietario = serializers.CharField(source='copropietario.idUsuario.nombre', read_only=True)
    nombre = serializers.CharField(source='visitante.nombre', read_only=True)
    apellido = serializers.CharField(source='visitante.apellido', read_only=True)
    ci = serializers.CharField(source='visitante.ci', read_only=True)
    motivo_visita = "motivo_visita"
    class Meta:
        model = AutorizacionVisita
        fields = ['id', 'copropietario', 'nombre', 'apellido', 'ci', 'motivo_visita', 'hora_inicio', 'hora_fin', 'estado']

class ListaReservasSerializer(serializers.ModelSerializer):
    id_reserva = "id_reserva"
    usuario = "usuario"
    fecha = "fecha"
    hora_inicio = "hora_inicio"
    hora_fin = "hora_fin"
    estado = "estado"
    nota = "nota"
    class Meta:
        model = Reserva
        fields = ['id_reserva','usuario', 'fecha','hora_inicio','hora_fin','estado' ,'nota']

class MarcarEntradaSerializer(serializers.Serializer):
    personal_id = serializers.IntegerField()
    autorizacion_id = serializers.IntegerField()

    def validate(self, data):
        print(data)
        print(data['autorizacion_id'])
        print(data['personal_id'])
        autorizacion = AutorizacionVisita.objects.filter(id=data['autorizacion_id']).first()
        personal = PersonalModel.objects.filter(idUsuario=data['personal_id']).first()
        print (autorizacion)
        print(personal)
        
        if not autorizacion or autorizacion.estado != "Pendiente":
            raise serializers.ValidationError("No hay una autorización válida en este momento.")
        data['autorizacion'] = autorizacion
        return data

    def save(self):
        autorizacion = self.validated_data['autorizacion']
        personal = PersonalModel.objects.get(idUsuario=self.validated_data['personal_id'])
        visitante = PersonaModel.objects.get(id=autorizacion.visitante_id)

        from django.utils import timezone
        ahora = timezone.now()

        registro = RegistroVisitaModel.objects.create(
            autorizacion=autorizacion,
            personal=personal,
            fecha_entrada=ahora,
            fecha_salida=None
        )

        autorizacion.estado = "En Visita"
        autorizacion.save()

        return {
            "visitante": visitante,
            "registro": registro
        }


class MarcarSalidaSerializer(serializers.Serializer):
    autorizacion_id = serializers.IntegerField()

    def validate(self, data):
        autorizacion = AutorizacionVisita.objects.filter(id=data['autorizacion_id']).first()
        if not autorizacion:
            raise serializers.ValidationError("Autorización no encontrada.")
        data['autorizacion'] = autorizacion

        registro = RegistroVisitaModel.objects.filter(
            autorizacion=autorizacion,
            fecha_entrada__isnull=False,
            fecha_salida__isnull=True
        ).first()
        if not registro:
            raise serializers.ValidationError("No hay un registro de visita activo para este visitante.")
        data['registro'] = registro
        return data

    def save(self):
        registro = self.validated_data['registro']
        autorizacion = self.validated_data['autorizacion']

        from django.utils import timezone
        ahora = timezone.now()

        registro.fecha_salida = ahora
        registro.save()

        autorizacion.estado = "Completada"
        autorizacion.save()

        visitante = PersonaModel.objects.get(id=autorizacion.visitante_id)

        return {
            "visitante": visitante,
            "registro": registro
        }
