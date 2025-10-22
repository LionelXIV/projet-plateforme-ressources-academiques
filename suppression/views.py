from django.http import JsonResponse
from telechargement.models import Fichier
import os

def supprimer_fichier(request, pk: int):
    """
    Supprime un fichier existant de la base de données et du système de fichiers.
    - Retourne un message JSON de succès ou d’erreur.
    - Agit sur le modèle Fichier de l'app 'telechargement'.
    """
    try:
        obj = Fichier.objects.get(pk=pk)
    except Fichier.DoesNotExist:
        return JsonResponse({"error": "Fichier introuvable."}, status=404)

    file_field = obj.fichier
    file_path = file_field.path if file_field else None

    # Supprime le fichier physique s’il existe
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    # Supprime l’enregistrement en base
    obj.delete()

    return JsonResponse(
        {"message": "Fichier supprimé avec succès."},
        json_dumps_params={"ensure_ascii": False}
    )
