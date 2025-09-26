from django.db import models
from users.models import CopropietarioModel
# Create your models here.
class PagoModel(models.Model):
    descripcion = models.CharField(max_length=200)
    fecha_emision = models.DateField(auto_now_add=True)
    fecha_pago = models.DateField(null = True, blank=True)
    copropietario = models.ForeignKey(CopropietarioModel, on_delete=models.CASCADE, related_name="pagos")
    monto = models.FloatField(default=0.00, blank=True)
    url_comprobante = models.URLField(null=True, blank=True)
    ESTADO_CHOICES = (
        ('pagado', 'Pagado'),
        ('no pagado', 'No pagado'),
        ('pendiente', 'Pendiente'),
    )
    TIPO_CHOICES = (
        ('reserva', 'Reserva'),
        ('expensa', 'Expensa'),
        ('multa','Multa'),
    )
    estado = models.CharField(max_length=50, choices=ESTADO_CHOICES, default='no pagado')
    tipo_pago = models.CharField(max_length=50, choices=TIPO_CHOICES)

    class Meta:
        db_table = 'pago'