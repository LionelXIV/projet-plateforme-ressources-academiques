from django.http import FileResponse, Http404
from .models import Fichier
import mimetypes

def telecharger_fichier(request, pk: int):
    """
    Renvoie le fichier pour téléchargement (PDF, vidéo, etc.).
    - 404 si l'id n'existe pas ou si le fichier est manquant.
    """
    try:
        obj = Fichier.objects.get(pk=pk)
    except Fichier.DoesNotExist:
        raise Http404("Fichier introuvable.")

    file_field = obj.fichier
    if not file_field or not file_field.name:
        raise Http404("Fichier non disponible.")

    content_type, _ = mimetypes.guess_type(file_field.name)
    response = FileResponse(file_field.open('rb'), content_type=content_type or 'application/octet-stream')
    response["Content-Disposition"] = f'attachment; filename="{file_field.name.split("/")[-1]}"'
    return response
