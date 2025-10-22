from django.db import models
from django.contrib.auth.models import User

class Publication(models.Model):
    """
    Modèle pour la publication de contenu académique
    Correspond à l'issue "Publication de contenu" - branche lionel
    """
    
    TYPE_CONTENU = [
        ('pdf', 'PDF'),
        ('video', 'Vidéo'),
        ('audio', 'Audio'),
        ('texte', 'Texte'),
        ('image', 'Image'),
        ('presentation', 'Présentation'),
    ]
    
    # Champs principaux
    titre = models.CharField(
        max_length=200,
        help_text="Titre du contenu publié"
    )
    description = models.TextField(
        help_text="Description détaillée du contenu"
    )
    mots_cles = models.CharField(
        max_length=500,
        help_text="Mots-clés séparés par des virgules"
    )
    
    # Fichier et type
    fichier = models.FileField(
        upload_to='publications/',
        blank=True,
        null=True,
        help_text="Fichier à publier"
    )
    type_contenu = models.CharField(
        max_length=15,
        choices=TYPE_CONTENU,
        default='pdf',
        help_text="Type de contenu"
    )
    
    # Métadonnées académiques
    matiere = models.CharField(
        max_length=100,
        help_text="Matière ou cours"
    )
    universite = models.CharField(
        max_length=100,
        help_text="Université ou établissement"
    )
    theme = models.CharField(
        max_length=100,
        help_text="Thème ou sujet"
    )
    
    # Gestion de la publication
    date_publication = models.DateTimeField(
        auto_now_add=True,
        help_text="Date de publication"
    )
    date_modification = models.DateTimeField(
        auto_now=True,
        help_text="Date de dernière modification"
    )
    est_publie = models.BooleanField(
        default=True,
        help_text="Statut de publication"
    )
    
    # Relations
    auteur = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        help_text="Auteur de la publication"
    )
    
    def __str__(self):
        return f"{self.titre} - {self.auteur.username}"
    
    class Meta:
        ordering = ['-date_publication']
        verbose_name = "Publication"
        verbose_name_plural = "Publications"
