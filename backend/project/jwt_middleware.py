from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
import jwt

ALGO = getattr(settings, "JWT_ALGORITHM", "HS256")
LEEWAY_SECONDS = int(getattr(settings, "JWT_LEEWAY_SECONDS", 18000) or 0)

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        path = getattr(request, "path", None)
        print(">>> [MIDDLEWARE] Incoming request:", path)

        # Inspect AUTH header
        auth = request.META.get("HTTP_AUTHORIZATION", "")
        print(">>> [MIDDLEWARE] AUTH HEADER RAW:", repr(auth))

        # If no header → skip
        if not auth:
            print(">>> [MIDDLEWARE] NO AUTH HEADER → AnonymousUser")
            return None

        parts = auth.split()
        print(">>> [MIDDLEWARE] AUTH PARTS:", parts)

        if len(parts) != 2:
            print(">>> [MIDDLEWARE] BAD AUTH FORMAT")
            return None

        scheme = parts[0].lower()
        token = parts[1]

        if scheme not in ("bearer", "token"):
            print(">>> [MIDDLEWARE] UNSUPPORTED SCHEME:", scheme)
            return None

        print(">>> [MIDDLEWARE] Decoding token...")

        try:
            decode_kwargs = {"algorithms": [ALGO]}
            if LEEWAY_SECONDS:
                decode_kwargs["leeway"] = LEEWAY_SECONDS
            payload = jwt.decode(token, settings.SECRET_KEY, **decode_kwargs)
            print(">>> [MIDDLEWARE] TOKEN PAYLOAD:", payload)

            User = get_user_model()
            uid = payload.get("user_id")

            if uid is None:
                print(">>> [MIDDLEWARE] NO USER_ID IN PAYLOAD")
                request.user = AnonymousUser()
                return None

            try:
                user = User.objects.get(pk=uid)
                request.user = user
                print(">>> [MIDDLEWARE] USER AUTH:", user.username)
            except User.DoesNotExist:
                print(">>> [MIDDLEWARE] USER DOES NOT EXIST:", uid)
                request.user = AnonymousUser()

        except jwt.ExpiredSignatureError as exc:
            print(">>> [MIDDLEWARE] TOKEN EXPIRED:", exc)
            request.user = AnonymousUser()

        except Exception as exc:
            print(">>> [MIDDLEWARE] TOKEN DECODE ERROR:", repr(exc))
            request.user = AnonymousUser()

        return None
