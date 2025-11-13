"""
Tests for the custom JWT authentication middleware.
"""
from types import SimpleNamespace

from django.contrib.auth.models import AnonymousUser

from project.jwt_middleware import JWTAuthenticationMiddleware


class DummyUser:
    """Simple stand-in for a Django user model."""
    pk = 9
    is_authenticated = True

    class DoesNotExist(Exception):
        """Raised when a user is missing."""


class DummyManager:
    """Fake manager returning the dummy user based on primary key."""
    def __init__(self, user):
        self._user = user

    def get(self, pk):
        if pk != self._user.pk:
            raise DummyUser.DoesNotExist()
        return self._user


def test_process_request_keeps_existing_user(monkeypatch):
    """Ensure middleware leaves already authenticated users untouched."""
    request = SimpleNamespace(user=SimpleNamespace(is_authenticated=True))

    middleware = JWTAuthenticationMiddleware(lambda req: None)
    middleware.process_request(request)

    assert request.user.is_authenticated is True

def test_process_request_sets_authenticated_user(monkeypatch):
    """Ensure a valid JWT payload resolves to the expected user."""
    import project.jwt_middleware as jwt_mod

    dummy_user = DummyUser()
    monkeypatch.setattr(jwt_mod, "get_user_model", lambda: SimpleNamespace(objects=DummyManager(dummy_user)), raising=False)
    monkeypatch.setattr(jwt_mod, "jwt", SimpleNamespace(decode=lambda token, secret, algorithms=None: {"user_id": dummy_user.pk}), raising=False)
    monkeypatch.setattr(jwt_mod, "settings", SimpleNamespace(SECRET_KEY="secret"), raising=False)

    request = SimpleNamespace(user=None, META={"HTTP_AUTHORIZATION": "Bearer token"})
    middleware = JWTAuthenticationMiddleware(lambda req: None)
    middleware.process_request(request)

    assert request.user is dummy_user


def test_process_request_sets_anonymous_on_failure(monkeypatch):
    """Ensure decoding errors fall back to an AnonymousUser instance."""
    import project.jwt_middleware as jwt_mod

    def _decode(*args, **kwargs):
        raise RuntimeError("bad token")

    fake_jwt = SimpleNamespace(
        decode=_decode,
        ExpiredSignatureError=type("ExpiredSignatureError", (Exception,), {}),
    )
    monkeypatch.setattr(jwt_mod, "jwt", fake_jwt, raising=False)
    monkeypatch.setattr(jwt_mod, "settings", SimpleNamespace(SECRET_KEY="secret"), raising=False)

    request = SimpleNamespace(user=None, META={"HTTP_AUTHORIZATION": "Bearer broken"})
    middleware = JWTAuthenticationMiddleware(lambda req: None)
    middleware.process_request(request)

    assert isinstance(request.user, AnonymousUser)
