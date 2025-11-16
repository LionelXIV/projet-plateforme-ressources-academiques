"""
Tests for the JWT authentication views implemented in backend.auth_jwt.
"""
import json
from types import SimpleNamespace

import pytest

from project import auth_jwt


def _make_request(body_dict):
    """Build a minimal request object with the provided JSON body."""
    body = json.dumps(body_dict).encode("utf-8")
    request = SimpleNamespace(body=body, method="POST")
    return request


def test_login_jwt_rejects_invalid_json():
    """Ensure malformed JSON payload returns HTTP 400."""
    request = SimpleNamespace(body=b"{invalid", method="POST")
    response = auth_jwt.login_jwt(request)

    assert response.status_code == 400
    assert json.loads(response.content)["error"] == "invalid_json"


def test_login_jwt_requires_credentials():
    """Ensure missing credentials return HTTP 400 with error message."""
    request = _make_request({"username": "alice"})
    response = auth_jwt.login_jwt(request)

    assert response.status_code == 400
    assert json.loads(response.content)["error"] == "missing_credentials"


def test_login_jwt_handles_invalid_credentials(monkeypatch):
    """Ensure authenticate returning None yields a 401 invalid_credentials response."""
    monkeypatch.setattr(auth_jwt, "authenticate", lambda request, username, password: None)

    request = _make_request({"username": "alice", "password": "bad"})
    response = auth_jwt.login_jwt(request)

    assert response.status_code == 401
    assert json.loads(response.content)["error"] == "invalid_credentials"


def test_login_jwt_success(monkeypatch):
    """Ensure a successful authentication yields a token payload."""
    fake_user = SimpleNamespace(
        pk=7,
        is_active=True,
        get_username=lambda: "alice"
    )
    monkeypatch.setattr(auth_jwt, "authenticate", lambda request, username, password: fake_user)
    monkeypatch.setattr(auth_jwt.settings, "SECRET_KEY", "secret-key")
    monkeypatch.setattr(auth_jwt, "jwt", SimpleNamespace(
        encode=lambda payload, secret, algorithm=None: "jwt-token"
    ))

    request = _make_request({"username": "alice", "password": "good"})
    response = auth_jwt.login_jwt(request)
    payload = json.loads(response.content)

    assert response.status_code == 200
    assert payload["token"] == "jwt-token"
    assert payload["username"] == "alice"
    assert isinstance(payload["expires_in"], int)


def test_login_jwt_handles_token_generation_failure(monkeypatch):
    """Ensure an exception from jwt.encode triggers a 500 error with details."""
    fake_user = SimpleNamespace(
        pk=1,
        is_active=True,
        get_username=lambda: "bob"
    )
    monkeypatch.setattr(auth_jwt, "authenticate", lambda request, username, password: fake_user)
    monkeypatch.setattr(auth_jwt.settings, "SECRET_KEY", "secret-key")

    def _raise_encode(*args, **kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(auth_jwt, "jwt", SimpleNamespace(encode=_raise_encode))

    request = _make_request({"username": "bob", "password": "good"})
    response = auth_jwt.login_jwt(request)
    payload = json.loads(response.content)

    assert response.status_code == 500
    assert payload["error"] == "token_generation_failed"
    assert "boom" in payload["details"]

