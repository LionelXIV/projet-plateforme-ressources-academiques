from django.db import models
from django.contrib.auth.models import User

class ContenuPedagogique(models.Model):
    TYPE_CONTENU = [
        ('pdf', 'PDF'),
        ('video', 'Vidéo'),
        ('audio', 'Audio'),
        ('texte', 'Texte'),
    ]
    
    titre = models.CharField(max_length=200)
    description = models.TextField()
    mots_cles = models.CharField(max_length=500, help_text="Mots-clés séparés par des virgules")
    fichier = models.FileField(upload_to='contenus/', blank=True, null=True)
    type_contenu = models.CharField(max_length=10, choices=TYPE_CONTENU, default='pdf')
    matiere = models.CharField(max_length=100)
    universite = models.CharField(max_length=100)
    theme = models.CharField(max_length=100)
    date_publication = models.DateTimeField(auto_now_add=True)
    est_publie = models.BooleanField(default=True)
    auteur = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.titre
    
    class Meta:
        ordering = ['-date_publication']