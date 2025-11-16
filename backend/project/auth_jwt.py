import json
import datetime
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, logout as django_logout
from django.contrib.auth import get_user_model
import jwt
import logging

logger = logging.getLogger(__name__)

# Settings used:
# - settings.SECRET_KEY (used as JWT secret)
# - settings.JWT_ALGORITHM (default "HS256")
# - settings.JWT_EXPIRATION_HOURS (default 24)

ALGO = getattr(settings, "JWT_ALGORITHM", "HS256")
EXP_HOURS = getattr(settings, "JWT_EXPIRATION_HOURS", 24)

@csrf_exempt
@require_http_methods(["POST"])
def login_jwt(request):
    try:
        try:
            payload = json.loads(request.body.decode() or "{}")
        except Exception:
            return JsonResponse({"error": "invalid_json"}, status=400)

        username = payload.get("username")
        password = payload.get("password")
        logger.info("Login attempt for username=%s", username)

        if not username or not password:
            logger.warning("Missing credentials in login attempt (username=%s)", username)
            return JsonResponse({"error": "missing_credentials"}, status=400)

        User = get_user_model()

        user = authenticate(request, username=username, password=password)
        if user is None and "@" in (username or ""):
            try:
                u_email = User.objects.filter(email__iexact=username).first()
                if u_email:
                    user = authenticate(request, username=u_email.username, password=password)
                    logger.info("Fallback auth by email -> username=%s", u_email.username)
            except Exception as e:
                logger.debug("Email lookup failed: %s", e)
                user = None

        if user is None or not getattr(user, "is_active", True):
            logger.warning("Authentication failed for username=%s (user_obj=%s)", username, "exists" if user else "missing")
            return JsonResponse({"error": "invalid_credentials"}, status=401)

        now = datetime.datetime.utcnow()
        exp_dt = now + datetime.timedelta(hours=EXP_HOURS)

        token_payload = {
            "user_id": user.pk,
            "username": user.get_username(),
            "iat": int(now.timestamp()),
            "exp": int(exp_dt.timestamp()),
        }

        try:
            token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm=ALGO)
        except Exception as e:
            logger.exception("JWT encoding failed")
            return JsonResponse({"error": "token_generation_failed", "details": str(e)}, status=500)

        if isinstance(token, bytes):
            token = token.decode("utf-8")

        return JsonResponse({
        "token": token,
        "username": user.get_username(),
        "is_staff": bool(getattr(user, "is_staff", False)),
        "expires_in": EXP_HOURS * 3600
    })
    except Exception as exc:
        logger.exception("Unhandled exception in login_jwt")
        return JsonResponse({"error": "server_error", "details": str(exc)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def register_user(request):
    """
    POST JSON /api/auth/register/
    Body: { "username": "...", "password": "...", "email": "..." (optional) }
    Returns 201 + { success: true, username } on success or JSON error.
    """
    try:
        payload = json.loads(request.body.decode() or "{}")
    except Exception:
        return JsonResponse({"error": "invalid_json"}, status=400)

    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    email = (payload.get("email") or "").strip()

    if not username or not password:
        return JsonResponse({"error": "missing_credentials"}, status=400)

    User = get_user_model()
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "user_exists"}, status=409)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_active = True
        user.save()
    except Exception as e:
        logger.exception("Failed to create user")
        return JsonResponse({"error": "creation_failed", "details": str(e)}, status=500)

    return JsonResponse({"success": True, "username": user.get_username()}, status=201)