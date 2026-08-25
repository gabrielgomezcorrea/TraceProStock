from functools import wraps

from django.shortcuts import get_object_or_404, redirect, render

from .forms import ProductForm
from .models import Product


def simple_login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.session.get('traceprostock_logged_in'):
            return view_func(request, *args, **kwargs)
        return redirect('products:login')

    return wrapper


def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('traceprostock_logged_in'):
            return redirect('products:login')
        if request.session.get('traceprostock_role') != 'admin':
            return redirect('products:operator_home')
        return view_func(request, *args, **kwargs)

    return wrapper


def operator_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('traceprostock_logged_in'):
            return redirect('products:login')
        if request.session.get('traceprostock_role') != 'operario':
            return redirect('products:dashboard')
        return view_func(request, *args, **kwargs)

    return wrapper


def product_stats():
    products = Product.objects.all()
    total_products = products.count()
    low_stock = sum(1 for product in products if product.requires_restock and product.quantity > 0)
    out_of_stock = products.filter(quantity=0).count()
    total_stock = sum(product.quantity for product in products)
    return {
        'total_products': total_products,
        'low_stock': low_stock,
        'out_of_stock': out_of_stock,
        'total_stock': total_stock,
    }


def login_view(request):
    error = ''
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        if username == 'admin' and password == 'admin':
            request.session['traceprostock_logged_in'] = True
            request.session['traceprostock_user'] = 'Admin'
            request.session['traceprostock_role'] = 'admin'
            return redirect('products:dashboard')
        if username == 'operario' and password == 'operario':
            request.session['traceprostock_logged_in'] = True
            request.session['traceprostock_user'] = 'Operario'
            request.session['traceprostock_role'] = 'operario'
            return redirect('products:operator_home')
        error = 'Usuario o clave incorrectos.'

    return render(request, 'products/login.html', {'error': error})


def logout_view(request):
    request.session.flush()
    return redirect('products:login')


@admin_required
def dashboard(request):
    products = Product.objects.all()
    latest_products = products[:5]
    products_to_review = [product for product in products if product.requires_restock][:4]
    return render(request, 'products/dashboard.html', {
        'stats': product_stats(),
        'latest_products': latest_products,
        'products_to_review': products_to_review,
    })


@admin_required
def product_list(request):
    products = Product.objects.all()
    return render(request, 'products/product_list.html', {
        'products': products,
        'stats': product_stats(),
    })


@admin_required
def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'products/product_detail.html', {'product': product})


@admin_required
def product_create(request):
    form = ProductForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('products:list')

    return render(request, 'products/product_form.html', {
        'form': form,
        'title': 'Agregar producto',
    })


@admin_required
def product_update(request, pk):
    product = get_object_or_404(Product, pk=pk)
    form = ProductForm(request.POST or None, instance=product)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('products:detail', pk=product.pk)

    return render(request, 'products/product_form.html', {
        'form': form,
        'title': 'Editar producto',
    })


@admin_required
def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.delete()
        return redirect('products:list')

    return render(request, 'products/product_confirm_delete.html', {'product': product})


@admin_required
def movements(request):
    products = Product.objects.all()[:5]
    return render(request, 'products/movements.html', {'products': products})


@admin_required
def alerts(request):
    products = [product for product in Product.objects.all() if product.requires_restock]
    return render(request, 'products/alerts.html', {'products': products})


@operator_required
def operator_home(request):
    products = Product.objects.all()
    products_to_review = [product for product in products if product.requires_restock][:5]
    return render(request, 'products/operator_home.html', {
        'products': products[:6],
        'products_to_review': products_to_review,
        'stats': product_stats(),
    })


@operator_required
def operator_products(request):
    products = Product.objects.all()
    return render(request, 'products/operator_products.html', {'products': products})


@operator_required
def operator_movement(request):
    products = Product.objects.all()
    message = ''
    message_type = ''

    if request.method == 'POST':
        product_id = request.POST.get('product')
        movement_type = request.POST.get('movement_type')
        try:
            quantity = int(request.POST.get('quantity') or 0)
        except ValueError:
            quantity = 0

        if not product_id:
            message = 'Selecciona un producto.'
            message_type = 'danger'
        elif movement_type not in ['entrada', 'salida']:
            message = 'Selecciona un tipo de movimiento valido.'
            message_type = 'danger'
        elif quantity <= 0:
            message = 'Ingresa una cantidad mayor que cero.'
            message_type = 'danger'
        else:
            product = get_object_or_404(Product, pk=product_id)
            if movement_type == 'salida' and product.quantity < quantity:
                message = 'No hay stock suficiente para registrar la salida.'
                message_type = 'danger'
            else:
                if movement_type == 'entrada':
                    product.quantity += quantity
                    message = f'Entrada registrada para {product.name}.'
                else:
                    product.quantity -= quantity
                    message = f'Salida registrada para {product.name}.'
                product.save()
                message_type = 'success'

    return render(request, 'products/operator_movement.html', {
        'products': products,
        'message': message,
        'message_type': message_type,
    })
