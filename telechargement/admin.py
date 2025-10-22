from django.contrib import admin
from .models import Fichier

@admin.register(Fichier)
class FichierAdmin(admin.ModelAdmin):
    list_display = ("id", "titre", "date_upload")
