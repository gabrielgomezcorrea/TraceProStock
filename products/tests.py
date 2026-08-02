from django.test import TestCase
from django.urls import reverse

from .models import Product


class ProductCrudTests(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            sku='SKU-001',
            name='Tornillo zincado',
            description='Caja de tornillos para reposicion de bodega.',
            category='Ferreteria',
            quantity=25,
            minimum_stock=10,
            unit_price=1500,
        )

    def test_product_list_loads(self):
        response = self.client.get(reverse('products:list'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Tornillo zincado')

    def test_product_create(self):
        response = self.client.post(reverse('products:create'), {
            'sku': 'sku-002',
            'name': 'Guante de seguridad',
            'description': 'Guante para operarios de bodega.',
            'category': 'Seguridad',
            'quantity': 40,
            'minimum_stock': 12,
            'unit_price': 2990,
            'active': 'on',
        })

        self.assertRedirects(response, reverse('products:list'))
        self.assertTrue(Product.objects.filter(sku='SKU-002').exists())

    def test_product_update(self):
        response = self.client.post(reverse('products:update', args=[self.product.pk]), {
            'sku': 'SKU-001',
            'name': 'Tornillo zincado actualizado',
            'description': self.product.description,
            'category': self.product.category,
            'quantity': 8,
            'minimum_stock': 10,
            'unit_price': self.product.unit_price,
            'active': 'on',
        })

        self.assertRedirects(response, reverse('products:detail', args=[self.product.pk]))
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Tornillo zincado actualizado')
        self.assertTrue(self.product.requires_restock)

    def test_product_delete(self):
        response = self.client.post(reverse('products:delete', args=[self.product.pk]))

        self.assertRedirects(response, reverse('products:list'))
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())
