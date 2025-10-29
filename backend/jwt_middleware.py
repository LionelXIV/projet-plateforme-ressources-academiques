from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
import jwt

ALGO = getattr(settings, "JWT_ALGORITHM", "HS256")

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Decode Authorization: Bearer <token> (or Token) and set request.user.
    Leaves request.user as anonymous on invalid/expired token.
    """
    def process_request(self, request):
        if getattr(request, "user", None) and request.user.is_authenticated:
            return None

        auth = request.META.get("HTTP_AUTHORIZATION", "") or ""
        if not auth:
            return None

        parts = auth.split()
        if len(parts) != 2:
            return None

        scheme, token = parts[0].lower(), parts[1]
        if scheme not in ("bearer", "token"):
            return None

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGO])
            User = get_user_model()
            uid = payload.get("user_id")
            if uid is None:
                request.user = AnonymousUser()
                return None
            try:
                request.user = User.objects.get(pk=uid)
            except User.DoesNotExist:
                request.user = AnonymousUser()
        except jwt.ExpiredSignatureError:
            request.user = AnonymousUser()
        except Exception:
            request.user = AnonymousUser()

        return None