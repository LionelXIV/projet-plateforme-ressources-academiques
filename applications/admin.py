from django.contrib import admin
from .models import ContenuPedagogique

@admin.register(ContenuPedagogique)
class ContenuPedagogiqueAdmin(admin.ModelAdmin):
    list_display = ('titre', 'type_contenu', 'matiere', 'universite', 'est_publie', 'date_publication')
    list_filter = ('type_contenu', 'matiere', 'universite', 'est_publie')
    search_fields = ('titre', 'description', 'mots_cles', 'matiere')
    list_editable = ('est_publie',)