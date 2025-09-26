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


class PersonalModel(models.Model):
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
    turno = models.CharField(max_length=50, choices=TURNO_CHOICES, null=True, blank=True)
    fecha_contratacion = models.DateField(auto_now_add=True, null=True)
    PERSONAL_CHOICES = (
        ('guardia', 'Guardia'),
        ('limpieza', 'Limpieza'),
        ('mantenimiento', 'Mantenimiento'),
    )
    tipo_personal = models.CharField(max_length=50, choices=PERSONAL_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'personal'


class CopropietarioModel(models.Model):
    idUsuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column="id"
    )
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

class Residente(models.Model):
    ESTADOS = (
        ("activo", "Activo"),
        ("inactivo", "Inactivo"),
    )

    id_residente = models.AutoField(primary_key=True)  # PK autoincremental
    nombre = models.CharField(max_length=150)
    ci = models.CharField(max_length=20, unique=True, verbose_name="Carnet de Identidad")
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(unique=True)
    foto = models.ImageField(upload_to="residentes/fotos/", blank=True, null=True)
    estado = models.CharField(max_length=10, choices=ESTADOS, default="activo")

    # Relación con Unidad
    id_unidad = models.ForeignKey(
        "unidad_pertenencia.Unidad",  # asegúrate de tener el modelo Unidad creado
        on_delete=models.SET_NULL,  # si se elimina la unidad, queda null
        null=True,
        related_name="residentes"
    )

    created_at = models.DateTimeField(auto_now_add=True)  # opcional
    updated_at = models.DateTimeField(auto_now=True)      # opcional

    def __str__(self):
        return f"{self.nombre} - {self.ci}"

    class Meta:
        db_table = "residente"

from django.db import models

class Bitacora(models.Model):
    accion = models.TextField()           # Lo que pasó (ej. 'Asignó personal a tarea 3')
    ip = models.GenericIPAddressField()   # IP del cliente
    fecha_hora = models.DateTimeField(auto_now_add=True)  # Fecha y hora exacta

    class Meta:
        db_table = 'bitacora'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.fecha_hora} - {self.accion} ({self.ip})"
