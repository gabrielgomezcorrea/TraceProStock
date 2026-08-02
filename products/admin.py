from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'sku',
        'name',
        'category',
        'quantity',
        'minimum_stock',
        'unit_price',
        'active',
    )
    list_filter = ('category', 'active')
    search_fields = ('sku', 'name', 'description')
