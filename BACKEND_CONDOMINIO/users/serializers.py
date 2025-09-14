# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import GuardiaModel,Usuario,CopropietarioModel,Rol

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'ci',
            'telefono',
            'email',
            'password', 
            'idRol'  
        ]

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
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
        print(unidad)
        usuario.save()
        
        if unidad:
            CopropietarioModel.objects.create(idUsuario=usuario, unidad=unidad)
        else: CopropietarioModel.objects.create(idUsuario=usuario)
        return usuario
    
class GuardiaSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    turno = serializers.CharField(write_only=True, required = False)
    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'ci', 'email', 'telefono', 'password', 'idRol', 'turno']

    def create(self, validated_data):   
        print("joal")  
        turno = validated_data.pop('turno', None) 
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
        print(turno)
        usuario.save()
        
        if turno:
            GuardiaModel.objects.create(idUsuario=usuario, turno=turno)
        else: GuardiaModel.objects.create(idUsuario=usuario)
        return usuario