import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


@csrf_exempt
@require_http_methods(["GET"])
def get_profile(request):
    """
    GET /api/profile/
    Retourne les informations du profil de l'utilisateur connecté.
    Requiert une authentification JWT.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "authentication_required"}, status=401)
    
    user = request.user
    
    # Compter les cours créés par l'utilisateur
    try:
        from backend.courses.models import Course
        courses_count = Course.objects.filter(author=user).count()
    except Exception:
        courses_count = 0
    
    return JsonResponse({
        "id": user.pk,
        "username": user.get_username(),
        "email": getattr(user, "email", ""),
        "first_name": getattr(user, "first_name", ""),
        "last_name": getattr(user, "last_name", ""),
        "is_staff": getattr(user, "is_staff", False),
        "date_joined": user.date_joined.isoformat() if hasattr(user, "date_joined") else None,
        "statistics": {
            "courses_created": courses_count,
        },
    })


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_profile(request):
    """
    PUT/PATCH /api/profile/update/
    Met à jour les informations du profil de l'utilisateur connecté.
    Body JSON: { "email": "...", "first_name": "...", "last_name": "..." }
    Requiert une authentification JWT.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "authentication_required"}, status=401)
    
    try:
        payload = json.loads(request.body.decode() or "{}")
    except Exception:
        return JsonResponse({"error": "invalid_json"}, status=400)
    
    user = request.user
    
    # Mise à jour des champs autorisés
    if "email" in payload:
        email = (payload.get("email") or "").strip()
        if email:
            # Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
            if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                return JsonResponse({"error": "email_already_exists"}, status=409)
            user.email = email
    
    if "first_name" in payload:
        user.first_name = (payload.get("first_name") or "").strip()
    
    if "last_name" in payload:
        user.last_name = (payload.get("last_name") or "").strip()
    
    try:
        user.save()
        logger.info("Profile updated for user=%s", user.get_username())
        return JsonResponse({
            "success": True,
            "id": user.pk,
            "username": user.get_username(),
            "email": getattr(user, "email", ""),
            "first_name": getattr(user, "first_name", ""),
            "last_name": getattr(user, "last_name", ""),
        })
    except Exception as e:
        logger.exception("Failed to update profile")
        return JsonResponse({"error": "update_failed", "details": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def change_password(request):
    """
    POST /api/profile/change-password/
    Change le mot de passe de l'utilisateur connecté.
    Body JSON: { "old_password": "...", "new_password": "..." }
    Requiert une authentification JWT.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "authentication_required"}, status=401)
    
    try:
        payload = json.loads(request.body.decode() or "{}")
    except Exception:
        return JsonResponse({"error": "invalid_json"}, status=400)
    
    old_password = payload.get("old_password", "")
    new_password = payload.get("new_password", "")
    
    if not old_password or not new_password:
        return JsonResponse({"error": "missing_passwords"}, status=400)
    
    user = request.user
    
    # Vérifier l'ancien mot de passe
    if not check_password(old_password, user.password):
        return JsonResponse({"error": "invalid_old_password"}, status=400)
    
    # Vérifier que le nouveau mot de passe est différent
    if old_password == new_password:
        return JsonResponse({"error": "same_password"}, status=400)
    
    # Valider le nouveau mot de passe avec les validateurs Django
    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError
    
    try:
        validate_password(new_password, user)
    except ValidationError as e:
        return JsonResponse({
            "error": "password_validation_failed",
            "details": list(e.messages)
        }, status=400)
    
    # Changer le mot de passe
    try:
        user.set_password(new_password)
        user.save()
        logger.info("Password changed for user=%s", user.get_username())
        return JsonResponse({"success": True, "message": "Password changed successfully"})
    except Exception as e:
        logger.exception("Failed to change password")
        return JsonResponse({"error": "password_change_failed", "details": str(e)}, status=500)
