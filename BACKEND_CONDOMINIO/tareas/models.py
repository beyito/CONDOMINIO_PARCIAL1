from django.db import models
from users.models import PersonalModel
# Create your models here.

class TareaModel(models.Model):
    titulo = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=200)
    fecha_creacion = models.DateField(auto_now_add=True)
    FRECUENCIA_CHOICES = (
        ('diaria', 'Diario'),
        ('eventual', 'Eventual'),
    )
    frecuencia = models.CharField(max_length=50, choices=FRECUENCIA_CHOICES)

    class Meta:
        db_table = 'tarea'

class TareaPersonalModel(models.Model):
    tarea = models.ForeignKey(TareaModel, on_delete=models.CASCADE)
    personal = models.ForeignKey(PersonalModel, on_delete=models.CASCADE)
    fecha_asignacion = models.DateField()  
    hora_realizacion = models.TimeField(null=True, blank=True)
    ESTADO_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('hecho', 'Hecho'),
    )
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="Pendiente")

    class Meta:
        db_table = 'tarea_personal'

