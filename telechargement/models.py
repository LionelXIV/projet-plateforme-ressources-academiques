from django.db import models

class Fichier(models.Model):
    titre = models.CharField(max_length=255)
    fichier = models.FileField(upload_to='fichiers/')
    date_upload = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre
