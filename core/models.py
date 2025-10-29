from django.db import models
from django.conf import settings

class Ressource(models.Model):
    TYPE_CONTENU = [
        ('pdf', 'PDF'),
        ('video', 'Vidéo'),
        ('audio', 'Audio'),
        ('texte', 'Texte'),
        ('image', 'Image'),
        ('presentation', 'Présentation'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    mots_cles = models.CharField(max_length=500, blank=True)
    fichier = models.FileField(upload_to='ressources/', blank=True, null=True)
    type_contenu = models.CharField(max_length=15, choices=TYPE_CONTENU, default='pdf')
    matiere = models.CharField(max_length=100, blank=True)
    universite = models.CharField(max_length=100, blank=True)
    theme = models.CharField(max_length=100, blank=True)
    date_publication = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    est_publie = models.BooleanField(default=True)
    auteur = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.titre}"
    
    class Meta:
        ordering = ['-date_publication']
        verbose_name = "Ressource"
        verbose_name_plural = "Ressources"
