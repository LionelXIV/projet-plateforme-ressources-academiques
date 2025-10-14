from django.urls import path
from . import views

urlpatterns = [
    path('api/recherche/', views.api_recherche_simple, name='api_recherche'),
]