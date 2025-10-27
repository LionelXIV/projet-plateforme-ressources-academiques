from django.urls import path
from .views import telecharger_fichier

urlpatterns = [
    path("download/<int:pk>/", telecharger_fichier, name="download"),
]
