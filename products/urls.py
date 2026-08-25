from django.urls import path

from . import views


app_name = 'products'

urlpatterns = [
    path('', views.login_view, name='login'),
    path('salir/', views.logout_view, name='logout'),
    path('panel/', views.dashboard, name='dashboard'),
    path('productos/', views.product_list, name='list'),
    path('productos/nuevo/', views.product_create, name='create'),
    path('productos/<int:pk>/', views.product_detail, name='detail'),
    path('productos/<int:pk>/editar/', views.product_update, name='update'),
    path('productos/<int:pk>/eliminar/', views.product_delete, name='delete'),
    path('movimientos/', views.movements, name='movements'),
    path('alertas/', views.alerts, name='alerts'),
    path('operario/', views.operator_home, name='operator_home'),
    path('operario/productos/', views.operator_products, name='operator_products'),
    path('operario/movimiento/', views.operator_movement, name='operator_movement'),
]
