# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import PersonalModel,Usuario,CopropietarioModel,Rol, Residente, Bitacora
from unidad_pertenencia.models import Unidad

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    rol_name = serializers.SerializerMethodField()  # campo extra a devolver

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'nombre',
            'ci',
            'telefono',
            'email',
            'password', 
            'idRol',
            'estado',     # esto devuelve el valor normal
            'rol_name'
        ]

    def get_rol_name(self, obj):
        return obj.idRol.name if obj.idRol else None

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            ci=validated_data.get('ci', ''),
            telefono=validated_data.get('telefono', ''),
            email=validated_data.get('email', ''),
            idRol=validated_data.get('idRol', Rol.objects.get(idRol=1))
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    rol_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'nombre',
            'ci',
            'telefono',
            'email',
            'password', 
            'idRol',
            'estado',
            'rol_name'
        ]

    def get_rol_name(self, obj):
        return obj.idRol.name if obj.idRol else None

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        print(self.user.idRol)
        # Agregar info extra
        data['id'] = self.user.id 
        data['username'] = self.user.username
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        data['email'] = self.user.email
        if self.user.idRol.idRol > 2 : 
            personal = PersonalModel.objects.get(idUsuario=self.user.id)  # ✅ Correcto          
            data['rol'] = personal.tipo_personal 
        else: 
            data['rol'] = self.user.idRol.name
        data['is_staff'] = self.user.is_staff
        return data
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=6, write_only=True)
    token = serializers.CharField(write_only=True)
    uidb64 = serializers.CharField(write_only=True)



# PARTE DEL PROYECTO INMOBILIARIA
class CopropietarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    unidad = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'ci', 'email', 'telefono', 'password', 'idRol', 'unidad']

    def create(self, validated_data):
        unidad_id = validated_data.pop('unidad', None)
        password = validated_data.pop('password')

        # Crear Usuario
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(password)
        usuario.save()

        # Crear Copropietario
        copropietario = CopropietarioModel.objects.create(idUsuario=usuario)

        # Si se pasó una unidad, asignarla al copropietario y crear residente
        if unidad_id:
            try:
                unidad = Unidad.objects.get(id=unidad_id)
                unidad.id_copropietario = copropietario
                unidad.estado = "activa"
                unidad.save()

                # Crear Residente ligado a esa unidad
                Residente.objects.create(
                    nombre=usuario.nombre,
                    ci=usuario.ci,
                    telefono=usuario.telefono,
                    correo=usuario.email,
                    estado='activo',
                    id_unidad=unidad
                )
            except Unidad.DoesNotExist:
                pass

        return usuario

    
class PersonalSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    turno = serializers.CharField(write_only=True, required = False)
    tipo_personal = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'ci', 'email', 'telefono', 'password', 'idRol', 'turno', 'tipo_personal']

    def create(self, validated_data):   
        print("joal")  
        turno = validated_data.pop('turno', None) 
        tipo_personal = validated_data.pop('tipo_personal',None)
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
        print(turno)
        usuario.save()
        
        if turno and tipo_personal:
            PersonalModel.objects.create(idUsuario=usuario, turno=turno, tipo_personal=tipo_personal)
        else: PersonalModel.objects.create(idUsuario=usuario)
        return usuario
    
class PersonalListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='idUsuario.id')
    username = serializers.CharField(source='idUsuario.username')
    nombre = serializers.CharField(source='idUsuario.nombre')
    ci = serializers.CharField(source='idUsuario.ci')
    email = serializers.EmailField(source='idUsuario.email')
    telefono = serializers.CharField(source='idUsuario.telefono', allow_blank=True, allow_null=True)
    rol_id = serializers.IntegerField(source='idUsuario.idRol.idRol')  # <- aquí el cambio
    rol_name = serializers.CharField(source='idUsuario.idRol.name')    # nombre del rol
    estado = serializers.CharField(source='idUsuario.estado')

    class Meta:
        model = PersonalModel
        fields = [
            'id',
            'username',
            'nombre',
            'ci',
            'telefono',
            'email',
            'rol_id',
            'rol_name',
            'turno',
            'estado',
            'tipo_personal',
        ]

class ResidenteSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    class Meta:
        model = Residente
        fields = "__all__"
        read_only_fields = ["id_residente", "created_at", "updated_at"]
    def get_rol(self, obj):
        try:
            usuario = Usuario.objects.get(ci=obj.ci)
            return usuario.idRol.name if usuario.idRol else None
        except Usuario.DoesNotExist:
            return None
        
class BitacoraSerializer(serializers.ModelSerializer):
    # Campos separados de fecha y hora
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()

    class Meta:
        model = Bitacora
        fields = ['id', 'accion', 'ip', 'fecha_hora', 'fecha', 'hora']

    def get_fecha(self, obj):
        return obj.fecha_hora.date()

    def get_hora(self, obj):
        return obj.fecha_hora.time().strftime('%H:%M:%S')