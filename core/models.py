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
    
    def to_dict(self):
        return {
            "id": self.pk,
            "titre": self.titre,
            "description": self.description,
            "mots_cles": self.mots_cles,
            "type_contenu": self.type_contenu,
            "matiere": self.matiere,
            "universite": self.universite,
            "theme": self.theme,
            "date_publication": self.date_publication.isoformat() if getattr(self, "date_publication", None) else None,
            "date_modification": self.date_modification.isoformat() if getattr(self, "date_modification", None) else None,
            "est_publie": bool(self.est_publie),
            "fichier_url": self.fichier.url if self.fichier else None,
            "auteur": getattr(self.auteur, "username", None),
        }

    class Meta:
        ordering = ['-date_publication']
        verbose_name = "Ressource"
        verbose_name_plural = "Ressources"

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500, blank=True)
    full_description = models.TextField(blank=True)
    instructor = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=100, blank=True)
    level = models.CharField(max_length=100, blank=True)
    students = models.IntegerField(default=0)
    image = models.URLField(blank=True)
    published_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def to_dict(self):
        return {
            "id": self.pk,
            "title": self.title,
            "description": self.description,
            "fullDescription": self.full_description,
            "instructor": self.instructor,
            "category": self.category,
            "level": self.level,
            "image": self.image,
            "publishedAt": self.published_at.isoformat(),
        }

    def __str__(self):
        return self.title

class Document(models.Model):
    course = models.ForeignKey(Course, related_name="documents", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=64, blank=True)
    size = models.CharField(max_length=64, blank=True)
    url = models.URLField(blank=True)

    def to_dict(self):
        return {
            "id": self.pk,
            "name": self.name,
            "type": self.doc_type,
            "size": self.size,
            "url": self.url,
        }

    def __str__(self):
        return f"{self.name} ({self.course_id})"
