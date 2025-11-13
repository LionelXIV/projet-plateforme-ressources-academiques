"""
Pytest configuration for backend tests.

Ensures the backend package is importable and Django settings are initialised.
"""
import os
import sys
from types import SimpleNamespace


PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
REPO_ROOT = os.path.dirname(PROJECT_ROOT)

if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)


os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

if "jwt" not in sys.modules:
    fake_jwt = SimpleNamespace(
        ExpiredSignatureError=type("ExpiredSignatureError", (Exception,), {}),
        encode=lambda payload, secret, algorithm=None: "dummy-token",
        decode=lambda token, secret, algorithms=None: {"user_id": 0},
    )
    sys.modules["jwt"] = fake_jwt

try:
    import django
except ImportError:  # pragma: no cover
    django = None

if django is not None:
    django.setup()
