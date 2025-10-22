from django.urls import path
from .views import supprimer_fichier

urlpatterns = [
    # ❌ Route pour supprimer un fichier existant
    path("delete/<int:pk>/", supprimer_fichier, name="delete_fichier"),
]
