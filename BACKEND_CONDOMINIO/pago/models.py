from django.db import models
from users.models import CopropietarioModel
from unidad_pertenencia.models import Unidad
# Create your models here.
class PagoModel(models.Model):
    descripcion = models.CharField(max_length=200)
    fecha_emision = models.DateField(auto_now_add=True)
    fecha_pago = models.DateField(null = True, blank=True)
    copropietario = models.ForeignKey(CopropietarioModel, on_delete=models.CASCADE, related_name="pagos", null = True)
    monto = models.FloatField(default=0.00, blank=True)
    url_comprobante = models.URLField(null=True, blank=True)
    ESTADO_CHOICES = (
        ('pagado', 'Pagado'),
        ('no pagado', 'No Pagado'),
        ('pendiente', 'Pendiente'),
        ('rechazado', 'Rechazado'),
        ('en mora', 'En Mora')
    )
    TIPO_CHOICES = (
        ('reserva', 'Reserva'),
        ('expensa', 'Expensa'),
        ('multa','Multa')
    )
    estado = models.CharField(max_length=50, choices=ESTADO_CHOICES, default='no pagado')
    tipo_pago = models.CharField(max_length=50, choices=TIPO_CHOICES, null = True)

    class Meta:
        db_table = 'pago'

class ExpensaModel(models.Model):
    id_expensa = models.AutoField(primary_key=True)
    pago = models.ForeignKey('PagoModel', on_delete=models.SET_NULL, null=True, blank=True, related_name='expensas')
    unidad = models.ForeignKey(Unidad, on_delete=models.SET_NULL, null=True, blank=True, related_name='expensas')
    monto = models.FloatField(default=0.00, blank=True)
    descripcion = models.CharField(max_length=200, null = True, blank = True)
    fecha = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'expensa'