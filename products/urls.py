from django.urls import path

from . import views


app_name = 'products'

urlpatterns = [
    path('', views.product_list, name='list'),
    path('productos/nuevo/', views.product_create, name='create'),
    path('productos/<int:pk>/', views.product_detail, name='detail'),
    path('productos/<int:pk>/editar/', views.product_update, name='update'),
    path('productos/<int:pk>/eliminar/', views.product_delete, name='delete'),
]
