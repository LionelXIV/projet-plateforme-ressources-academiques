from django.urls import path
from . import views

app_name = 'profile'

urlpatterns = [
    path('', views.get_profile, name='get_profile'),
    path('update/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
]

