from django import forms

from .models import Product


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'sku',
            'name',
            'description',
            'category',
            'quantity',
            'minimum_stock',
            'unit_price',
            'active',
        ]
        widgets = {
            'sku': forms.TextInput(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'category': forms.TextInput(attrs={'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'min': 0}),
            'minimum_stock': forms.NumberInput(attrs={'class': 'form-control', 'min': 0}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'step': '0.01'}),
            'active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

    def clean_sku(self):
        return self.cleaned_data['sku'].strip().upper()

    def clean_unit_price(self):
        unit_price = self.cleaned_data['unit_price']
        if unit_price < 0:
            raise forms.ValidationError('El precio unitario no puede ser negativo.')
        return unit_price
