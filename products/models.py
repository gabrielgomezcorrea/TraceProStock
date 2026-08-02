from django.db import models
from django.urls import reverse


class Product(models.Model):
    sku = models.CharField('SKU', max_length=30, unique=True)
    name = models.CharField('Nombre', max_length=120)
    description = models.TextField('Descripcion', max_length=300)
    category = models.CharField('Categoria', max_length=80)
    quantity = models.PositiveIntegerField('Stock actual', default=0)
    minimum_stock = models.PositiveIntegerField('Stock minimo', default=0)
    unit_price = models.DecimalField('Precio unitario', max_digits=10, decimal_places=2)
    active = models.BooleanField('Activo', default=True)
    created_at = models.DateTimeField('Creado', auto_now_add=True)
    updated_at = models.DateTimeField('Actualizado', auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def __str__(self):
        return f'{self.sku} - {self.name}'

    @property
    def requires_restock(self):
        return self.quantity <= self.minimum_stock

    def get_absolute_url(self):
        return reverse('products:detail', kwargs={'pk': self.pk})
