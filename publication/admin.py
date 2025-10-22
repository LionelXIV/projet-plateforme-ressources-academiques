from django.contrib import admin
from .models import Publication

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    """
    Configuration de l'interface d'administration pour le modèle Publication
    """
    list_display = (
        'titre', 
        'auteur', 
        'type_contenu', 
        'matiere', 
        'universite', 
        'est_publie', 
        'date_publication'
    )
    list_filter = (
        'type_contenu', 
        'matiere', 
        'universite', 
        'est_publie',
        'date_publication'
    )
    search_fields = (
        'titre', 
        'description', 
        'mots_cles', 
        'matiere',
        'theme'
    )
    list_editable = ('est_publie',)
    readonly_fields = ('date_publication', 'date_modification')
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('titre', 'description', 'mots_cles')
        }),
        ('Fichier et type', {
            'fields': ('fichier', 'type_contenu')
        }),
        ('Métadonnées académiques', {
            'fields': ('matiere', 'universite', 'theme')
        }),
        ('Gestion de la publication', {
            'fields': ('auteur', 'est_publie', 'date_publication', 'date_modification')
        }),
    )
