from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404, JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.views.decorators.http import require_http_methods
from django.http import QueryDict
import mimetypes
import os

from .models import Ressource
from .forms import RessourceForm

# Liste paginée (JSON)
def liste_ressources(request):
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 12))

    qs = Ressource.objects.filter(est_publie=True).order_by('-date_publication')

    q = request.GET.get('search') or request.GET.get('q')
    if q:
        qs = qs.filter(
            Q(titre__icontains=q) |
            Q(description__icontains=q) |
            Q(mots_cles__icontains=q) |
            Q(matiere__icontains=q) |
            Q(theme__icontains=q) |
            Q(universite__icontains=q)
        )

    paginator = Paginator(qs, per_page)
    page_obj = paginator.get_page(page)

    data = []
    for r in page_obj:
        data.append({
            'id': r.id,
            'titre': r.titre,
            'description': r.description,
            'mots_cles': r.mots_cles,
            'type_contenu': r.type_contenu,
            'matiere': r.matiere,
            'universite': r.universite,
            'theme': r.theme,
            'date_publication': r.date_publication.isoformat(),
            'fichier_url': r.fichier.url if r.fichier else None,
            'auteur': getattr(r.auteur, 'username', None),
        })

    return JsonResponse({
        'page': page_obj.number,
        'per_page': per_page,
        'total_pages': paginator.num_pages,
        'total_items': paginator.count,
        'results': data
    }, json_dumps_params={'ensure_ascii': False})


# Détail (JSON)
def detail_ressource(request, pk):
    r = get_object_or_404(Ressource, pk=pk, est_publie=True)
    similar_qs = Ressource.objects.filter(matiere=r.matiere, est_publie=True).exclude(pk=pk)[:4]
    similar = [{'id': s.id, 'titre': s.titre} for s in similar_qs]
    data = {
        'id': r.id,
        'titre': r.titre,
        'description': r.description,
        'mots_cles': r.mots_cles,
        'type_contenu': r.type_contenu,
        'matiere': r.matiere,
        'universite': r.universite,
        'theme': r.theme,
        'date_publication': r.date_publication.isoformat(),
        'date_modification': r.date_modification.isoformat() if getattr(r, 'date_modification', None) else None,
        'fichier_url': r.fichier.url if r.fichier else None,
        'auteur': getattr(r.auteur, 'username', None),
        'similar': similar
    }
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})


# Téléchargement du fichier
def telecharger_fichier(request, pk: int):
    try:
        obj = Ressource.objects.get(pk=pk)
    except Ressource.DoesNotExist:
        raise Http404("Fichier introuvable.")
    file_field = obj.fichier
    if not file_field or not file_field.name:
        raise Http404("Fichier non disponible.")
    content_type, _ = mimetypes.guess_type(file_field.name)
    response = FileResponse(file_field.open('rb'), content_type=content_type or 'application/octet-stream')
    response["Content-Disposition"] = f'attachment; filename="{os.path.basename(file_field.name)}"'
    return response


# Recherche simple (JSON)
@require_http_methods(["GET"])
def api_recherche_simple(request):
    q = request.GET.get('q', '').strip()
    if not q:
        return JsonResponse({'erreur': 'Parametre "q" (mots-cles) requis'}, status=400)
    query = Q(titre__icontains=q) | Q(description__icontains=q) | Q(mots_cles__icontains=q) | Q(matiere__icontains=q) | Q(universite__icontains=q) | Q(theme__icontains=q)
    resultats = Ressource.objects.filter(query, est_publie=True)
    data = [{
        'id': r.id,
        'titre': r.titre,
        'description': r.description,
        'mots_cles': r.mots_cles,
        'type_contenu': r.type_contenu,
        'matiere': r.matiere,
        'universite': r.universite,
        'theme': r.theme,
        'date_publication': r.date_publication.isoformat(),
        'fichier_url': r.fichier.url if r.fichier else None
    } for r in resultats]
    return JsonResponse({'mots_cles_recherches': q, 'nombre_resultats': len(data), 'resultats': data}, json_dumps_params={'ensure_ascii': False})


# Création (JSON) — Formulaire de validation
@login_required
@require_http_methods(["POST"])
def creer_ressource(request):
    form = RessourceForm(request.POST, request.FILES)
    if form.is_valid():
        res = form.save(commit=False)
        res.auteur = request.user
        res.save()
        return JsonResponse({'id': res.id, 'message': 'Ressource creee'}, status=201, json_dumps_params={'ensure_ascii': False})
    return JsonResponse({'errors': form.errors}, status=400, json_dumps_params={'ensure_ascii': False})

# Modification (JSON)
@login_required
@require_http_methods(["POST", "PUT", "PATCH"])
def modifier_ressource(request, pk):
    res = get_object_or_404(Ressource, pk=pk)
    if res.auteur is not None and res.auteur != request.user and not request.user.is_staff:
        return JsonResponse({'error': 'Permission refusee'}, status=403)

    # support POST (form), PUT/PATCH (body) and multipart file uploads
    if request.method in ('PUT', 'PATCH'):
        data = QueryDict(request.body)
        files = None
    else:
        data = request.POST
        files = request.FILES or None

    # Try normal ModelForm update first
    form = RessourceForm(data or None, files, instance=res)
    if form.is_valid():
        form.save()
        return JsonResponse({'id': res.id, 'message': 'Ressource modifiee'}, json_dumps_params={'ensure_ascii': False})

    # If form invalid (partial update scenario), apply partial field updates safely
    # Allowed fields to update
    updatable = ['titre', 'description', 'mots_cles', 'type_contenu', 'matiere', 'universite', 'theme', 'est_publie']
    changed = False
    for field in updatable:
        if field in data and data.get(field) != '':
            val = data.get(field)
            # handle boolean est_publie (checkbox semantics)
            if field == 'est_publie':
                val = data.get('est_publie') in ('on', 'true', '1', True)
            setattr(res, field, val)
            changed = True

    # handle file replacement if provided
    if files and files.get('fichier'):
        res.fichier = files.get('fichier')
        changed = True

    if changed:
        try:
            res.save()
            return JsonResponse({'id': res.id, 'message': 'Ressource modifiee (partiel)'}, json_dumps_params={'ensure_ascii': False})
        except Exception as e:
            return JsonResponse({'error': 'Erreur lors de la sauvegarde', 'details': str(e)}, status=500)

    # fallback: return form errors
    return JsonResponse({'errors': form.errors}, status=400, json_dumps_params={'ensure_ascii': False})


# Suppression (JSON)
@login_required
@require_http_methods(["POST", "DELETE"])
def supprimer_ressource(request, pk: int):
    res = get_object_or_404(Ressource, pk=pk)
    if res.auteur is not None and res.auteur != request.user and not request.user.is_staff:
        return JsonResponse({'error': 'Permission refusee'}, status=403)
    file_field = res.fichier
    file_path = file_field.path if file_field else None
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass
    res.delete()
    return JsonResponse({'message': 'Ressource supprimee'}, json_dumps_params={'ensure_ascii': False})

