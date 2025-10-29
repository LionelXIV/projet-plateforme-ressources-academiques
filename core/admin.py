from django.contrib import admin
from .models import Course, Document, Ressource

@admin.register(Ressource)
class RessourceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'auteur', 'matiere', 'date_publication', 'est_publie')
    search_fields = ('titre', 'description', 'mots_cles', 'matiere', 'universite', 'theme')
    list_filter = ('type_contenu', 'matiere', 'est_publie')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'instructor', 'category', 'level', 'published_at')
    search_fields = ('title', 'description', 'full_description', 'instructor')
    list_filter = ('category', 'level')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'doc_type', 'size')
    search_fields = ('name',)