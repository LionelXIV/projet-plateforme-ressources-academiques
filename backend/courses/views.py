from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Course, Document

@csrf_exempt
@require_http_methods(["POST"])
def create_course(request):
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
    course = Course.objects.create(
        title=str(title)[:255],
        description=str(payload.get("description", ""))[:500],
        full_description=str(payload.get("fullDescription") or payload.get("full_description") or ""),
        instructor=str(payload.get("instructor", ""))[:200],
        category=str(payload.get("category", ""))[:100],
        level=str(payload.get("level", ""))[:100],
        image=str(payload.get("image") or ""),
        author=user
    )
    docs = payload.get("documents", []) or []
    created_docs = []
    for d in docs:
        doc = Document.objects.create(
            course=course,
            name=str(d.get("name") or "document")[:255],
            doc_type=str(d.get("type", ""))[:64],
            size=str(d.get("size", ""))[:64],
            url=str(d.get("url", ""))[:2000],
        )
        created_docs.append(doc.to_dict())
    result = course.to_dict()
    result["documents"] = created_docs
    return JsonResponse(result, status=201, json_dumps_params={'ensure_ascii': False})

@require_http_methods(["GET"])
def list_courses(request):
    qs = Course.objects.all().order_by('-id')
    results = [c.to_dict() for c in qs]
    return JsonResponse({"results": results}, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
def get_course(request, pk: int):
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
        docs = payload.get("documents", None)
        if isinstance(docs, list):
            course.documents.all().delete()
            for d in docs:
                name = d.get("name") or d.get("title") or "document"
                Document.objects.create(course=course, name=str(name)[:255], doc_type=str(d.get("type", ""))[:64], size=str(d.get("size", ""))[:64], url=str(d.get("url", ""))[:2000])
            changed = True
        if changed:
            course.save()
        data = course.to_dict()
        data["documents"] = [d.to_dict() for d in course.documents.all()]
        data["author"] = getattr(course.author, "username", None)
        return JsonResponse(data, json_dumps_params={"ensure_ascii": False})

    if request.method == "DELETE":
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return JsonResponse({"error": "authentication_required"}, status=401)
        course = get_object_or_404(Course, pk=pk)
        if course.author is not None and course.author != user and not user.is_staff:
            return JsonResponse({"error": "permission_refusee"}, status=403)
        course.delete()
        return JsonResponse({"message": "Course supprimee"}, status=200, json_dumps_params={'ensure_ascii': False})

    c = get_object_or_404(Course, pk=pk)
    data = c.to_dict()
    data['author'] = getattr(c.author, 'username', None)
    data['documents'] = [d.to_dict() for d in c.documents.all()]
    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})