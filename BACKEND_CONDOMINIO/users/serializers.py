# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import PersonalModel,Usuario,CopropietarioModel,Rol, Residente

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    rol_name = serializers.SerializerMethodField() #campo extra a devolver

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
        user.set_password(validated_data['password'])  # 🔑 contraseña encriptada
        user.save()
        return user

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
    unidad = serializers.CharField(write_only=True, required = False)
    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'ci', 'email', 'telefono', 'password', 'idRol', 'unidad']

    def create(self, validated_data):   
        print("joal")  
        unidad = validated_data.pop('unidad', None) 
        password = validated_data.pop('password')  # 👉 la sacamos antes
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(password)
        usuario.save()
        
        if unidad:
            CopropietarioModel.objects.create(idUsuario=usuario, unidad=unidad)
        else:
            CopropietarioModel.objects.create(idUsuario=usuario)
        return usuario
    
class PersonalSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    turno = serializers.CharField(write_only=True, required = False)
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
