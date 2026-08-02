from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sku', models.CharField(max_length=30, unique=True, verbose_name='SKU')),
                ('name', models.CharField(max_length=120, verbose_name='Nombre')),
                ('description', models.TextField(max_length=300, verbose_name='Descripcion')),
                ('category', models.CharField(max_length=80, verbose_name='Categoria')),
                ('quantity', models.PositiveIntegerField(default=0, verbose_name='Stock actual')),
                ('minimum_stock', models.PositiveIntegerField(default=0, verbose_name='Stock minimo')),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Precio unitario')),
                ('active', models.BooleanField(default=True, verbose_name='Activo')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Creado')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Actualizado')),
            ],
            options={
                'verbose_name': 'Producto',
                'verbose_name_plural': 'Productos',
                'ordering': ['name'],
            },
        ),
    ]
