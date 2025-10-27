from django.contrib import admin
from .models import Ressource

@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'auteur', 'matiere', 'date_publication', 'est_publie')
    search_fields = ('titre', 'description', 'mots_cles', 'matiere', 'universite', 'theme')
    list_filter = ('type_contenu', 'matiere', 'est_publie')