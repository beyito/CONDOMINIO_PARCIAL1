# Create your models here.

from django.contrib.auth.models import AbstractUser
from django.db import models

# Esto tenias tu sebas
# class Rol(models.Model):
#     name = models.CharField(max_length=20, unique=True)

#     def __str__(self):
#         return self.name
    
# class Usuario(AbstractUser):
#     email = models.EmailField(unique=True)
#     ci = models.CharField(max_length=20, unique=True)
#     phone_number = models.CharField(max_length=20, blank=True)
#     ESTADO_CHOICES = (
#         ('activo', 'Activo'),
#         ('inactivo', 'Inactivo'),
#     )
#     estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
#     rol = models.ForeignKey(Rol, on_delete=models.CASCADE, default=2)

#     # first_name y last_name ya existen en AbstractUser

#     def __str__(self):
#         return self.username
    

class Rol(models.Model):
    idRol = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "rol" 

    def __str__(self):
        return self.name

class Usuario(AbstractUser):
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    ci = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    ESTADO_CHOICES = (
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    )
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
    idRol = models.ForeignKey(Rol, on_delete=models.RESTRICT, db_column="idRol", default=1, blank=True, null=True)  # Relación con Rol, puede ser nulo

    # first_name y last_name ya existen en AbstractUser
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def es_copropietario(self):
        return self.idRol is not None and self.idRol.name == "Copropietario"

    def es_empleado(self):
        return self.idRol is not None and self.idRol.name == "Guardia"

    def es_admin(self):
        return self.idRol is not None and self.idRol.name == "Administrador"

    class Meta:
        db_table = "usuario"

    def __str__(self):
        return self.username


class GuardiaModel(models.Model):
    idUsuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column="id"
    )
    TURNO_CHOICES = (
        ('mañana', 'Mañana'),
        ('tarde', 'Tarde'),
        ('noche', 'Noche'),
    )
    turno = models.CharField(max_length=50, choices=TURNO_CHOICES)
    fecha_contratacion = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'guardia'


class CopropietarioModel(models.Model):
    idUsuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column="id"
    )
    unidad = models.CharField(max_length=50, null=True, blank=True)  # Ejemplo: "Apto 101"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'copropietario'


class PersonaModel(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    documento = models.CharField(max_length=50, unique=True)  # CI
    
    # Relación muchos a muchos: visitante puede visitar a varios copropietarios
    copropietarios = models.ManyToManyField(CopropietarioModel, through="area_comun.AutorizacionVisita")

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

    class Meta:
        db_table = 'persona'
