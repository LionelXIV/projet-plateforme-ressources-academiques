from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404, JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import QueryDict
import mimetypes
import os
import json

from .models import Ressource, Course
from .forms import RessourceForm

def liste_ressources(request):
    """
    Listing public des ressources.
    Retourne JSON (200) contenant { results, page, total_items, total_pages }.
    Si le client demande explicitement 'text/html' via Accept, on peut rendre un template existant.
    """
    qs = Ressource.objects.all().order_by('-id')
    try:
        page = int(request.GET.get('page', 1))
    except Exception:
        page = 1
    try:
        per_page = int(request.GET.get('per_page', 20))
    except Exception:
        per_page = 20

    paginator = Paginator(qs, per_page)
    page_obj = paginator.get_page(page)
    results = [r.to_dict() for r in page_obj.object_list]

    data = {
        "results": results,
        "page": page_obj.number,
        "total_items": paginator.count,
        "total_pages": paginator.num_pages,
    }

    accept = request.META.get("HTTP_ACCEPT", "")
    if "text/html" in accept:

        return JsonResponse(data, json_dumps_params={"ensure_ascii": False})

    return JsonResponse(data, json_dumps_params={"ensure_ascii": False})


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

# Creation (JSON)
@csrf_exempt
@require_http_methods(["POST"])
def create_course(request):
    """
    POST JSON /core/courses/creer/  (JSON body)
    Body example:
    {
      "title": "Mon cours",
      "description": "Court",
      "fullDescription": "Détail",
      "instructor": "Nom",
      "category": "Développement",
      "level": "Débutant",
      "image": "https://...",
      "documents": [{ "name": "Plan.pdf", "type": "PDF", "size": "1.2 MB", "url": "https://..." }, ...]
    }
    Requires authenticated user (JWT or session).
    Returns created course + documents (201).
    """
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return JsonResponse({"error": "authentication_required"}, status=401)

    try:
        payload = json.loads(request.body.decode() or "{}")
    except Exception:
        return JsonResponse({"error": "invalid_json"}, status=400)

    title = payload.get("title") or ""
    if not title:
        return JsonResponse({"error": "title_required"}, status=400)

    course_data = {
        "title": str(title)[:255],
        "description": str(payload.get("description", ""))[:500],
        "full_description": payload.get("fullDescription") or payload.get("full_description") or "",
        "instructor": payload.get("instructor", "")[:200],
        "category": payload.get("category", "")[:100],
        "level": payload.get("level", "")[:100],
        "image": payload.get("image", "") or "",
    }

    from .models import Course, Document 
    try:
        course = Course.objects.create(author=user, **course_data)
    except Exception as e:
        return JsonResponse({"error": "creation_failed", "details": str(e)}, status=500)

    docs = payload.get("documents", []) or []
    created_docs = []
    for d in docs:
        name = d.get("name") or d.get("title") or "document"
        doc = Document.objects.create(
            course=course,
            name=str(name)[:255],
            doc_type=str(d.get("type", ""))[:64],
            size=str(d.get("size", ""))[:64],
            url=str(d.get("url", ""))[:2000],
        )
        created_docs.append(doc.to_dict())

    result = course.to_dict()
    result["documents"] = created_docs

    return JsonResponse(result, status=201, json_dumps_params={"ensure_ascii": False})

# List (JSON)
@require_http_methods(["GET"])
def list_courses(request):
    """
    GET /api/courses/?page=1&per_page=12&search=...
    Returns paginated list of courses with documents.
    """
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 12))

    qs = Course.objects.all().order_by('-published_at')

    q = request.GET.get('search') or request.GET.get('q')
    if q:
        qs = qs.filter(
            Q(title__icontains=q) |
            Q(description__icontains=q) |
            Q(full_description__icontains=q) |
            Q(instructor__icontains=q) |
            Q(category__icontains=q)
        )

    paginator = Paginator(qs, per_page)
    page_obj = paginator.get_page(page)

    results = []
    for c in page_obj:
        results.append({
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'fullDescription': c.full_description,
            'instructor': c.instructor,
            'category': c.category,
            'level': c.level,
            'image': c.image,
            'publishedAt': c.published_at.isoformat() if getattr(c, 'published_at', None) else None,
            'author': getattr(c.author, 'username', None),
            'documents': [d.to_dict() for d in c.documents.all()]
        })

    return JsonResponse({
        'page': page_obj.number,
        'per_page': per_page,
        'total_pages': paginator.num_pages,
        'total_items': paginator.count,
        'results': results
    }, json_dumps_params={'ensure_ascii': False})

# Display, delete and update details (JSON)
@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
def get_course(request, pk: int):
    """
    GET /api/courses/<pk>/  -> return course json
    PUT/PATCH /api/courses/<pk>/ -> update course (authenticated, author or staff)
    DELETE /api/courses/<pk>/ -> delete course (authenticated, author or staff)
    """
    # Update handler
    if request.method in ("PUT", "PATCH"):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return JsonResponse({"error": "authentication_required"}, status=401)

        course = get_object_or_404(Course, pk=pk)
        if course.author is not None and course.author != user and not user.is_staff:
            return JsonResponse({"error": "permission_refusee"}, status=403)

        try:
            payload = json.loads(request.body.decode() or "{}")
        except Exception:
            return JsonResponse({"error": "invalid_json"}, status=400)

        updatable = {
            "title": ("title", str, 255),
            "description": ("description", str, 500),
            "fullDescription": ("full_description", str, None),
            "full_description": ("full_description", str, None),
            "instructor": ("instructor", str, 200),
            "category": ("category", str, 100),
            "level": ("level", str, 100),
            "image": ("image", str, None),
        }

        changed = False
        for key, (field, typ, maxlen) in updatable.items():
            if key in payload:
                val = payload.get(key)
                try:
                    if typ is int:
                        val = int(val or 0)
                    else:
                        val = str(val or "")
                        if maxlen:
                            val = val[:maxlen]
                except Exception:
                    continue
                setattr(course, field, val)
                changed = True

        # Update documents if provided (replace behavior)
        docs = payload.get("documents", None)
        if isinstance(docs, list):
            # remove existing
            course.documents.all().delete()
            from .models import Document
            for d in docs:
                name = d.get("name") or d.get("title") or "document"
                Document.objects.create(
                    course=course,
                    name=str(name)[:255],
                    doc_type=str(d.get("type", ""))[:64],
                    size=str(d.get("size", ""))[:64],
                    url=str(d.get("url", ""))[:2000],
                )
            changed = True

        if changed:
            try:
                course.save()
            except Exception as e:
                return JsonResponse({"error": "update_failed", "details": str(e)}, status=500)

        data = course.to_dict()
        data["documents"] = [d.to_dict() for d in course.documents.all()]
        data["author"] = getattr(course.author, "username", None)
        return JsonResponse(data, json_dumps_params={"ensure_ascii": False})

    # DELETE handler
    if request.method == "DELETE":
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return JsonResponse({"error": "authentication_required"}, status=401)

        course = get_object_or_404(Course, pk=pk)
        if course.author is not None and course.author != user and not user.is_staff:
            return JsonResponse({"error": "permission_refusee"}, status=403)

        course.delete()
        return JsonResponse({"message": "Course supprimee"}, status=200, json_dumps_params={'ensure_ascii': False})

    # existing GET behaviour
    c = get_object_or_404(Course, pk=pk)
    data = c.to_dict()
    data['author'] = getattr(c.author, 'username', None)
    data['documents'] = [d.to_dict() for d in c.documents.all()]
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})