from django.http import JsonResponse
from django.db.models import Q
from .models import ContenuPedagogique
import json

def api_recherche_simple(request):
    """
    API backend pour la recherche simple
    Retourne du JSON uniquement
    """
    if request.method == 'GET':
        mots_cles = request.GET.get('q', '').strip()
        
        if not mots_cles:
            return JsonResponse({
                'erreur': 'Paramètre "q" (mots-clés) requis'
            }, status=400)
        
        # Construction de la requête de recherche
        query = Q(titre__icontains=mots_cles) | \
               Q(description__icontains=mots_cles) | \
               Q(mots_cles__icontains=mots_cles) | \
               Q(matiere__icontains=mots_cles) | \
               Q(universite__icontains=mots_cles) | \
               Q(theme__icontains=mots_cles)
        
        # Filtrage des contenus publiés uniquement
        resultats = ContenuPedagogique.objects.filter(
            query, 
            est_publie=True
        )
        
        # Formatage des résultats en JSON
        contenus_data = []
        for contenu in resultats:
            contenus_data.append({
                'id': contenu.id,
                'titre': contenu.titre,
                'description': contenu.description,
                'mots_cles': contenu.mots_cles,
                'type_contenu': contenu.type_contenu,
                'matiere': contenu.matiere,
                'universite': contenu.universite,
                'theme': contenu.theme,
                'date_publication': contenu.date_publication.isoformat(),
                'fichier_url': contenu.fichier.url if contenu.fichier else None
            })
        
        response_data = {
            'mots_cles_recherches': mots_cles,
            'nombre_resultats': len(contenus_data),
            'resultats': contenus_data
        }
        
        if not contenus_data:
            response_data['message'] = "Aucun contenu trouvé"
        
        return JsonResponse(response_data, safe=False)
    
    return JsonResponse({'erreur': 'Méthode non autorisée'}, status=405)