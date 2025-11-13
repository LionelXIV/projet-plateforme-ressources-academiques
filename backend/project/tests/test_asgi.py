"""
Tests for backend.asgi ensuring the ASGI application is initialised correctly.
"""
import importlib
import sys
import types


def test_application_initialised(monkeypatch):
    """Ensure the ASGI application callable is created from Django's factory."""
    fake_asgi = types.ModuleType("django.core.asgi")
    fake_asgi.get_asgi_application = lambda: "asgi-app"
    monkeypatch.setitem(sys.modules, "django.core.asgi", fake_asgi)
    monkeypatch.setenv("DJANGO_SETTINGS_MODULE", "backend.project.settings")

    sys.modules.pop("backend.project.asgi", None)
    module = importlib.import_module("backend.project.asgi")

    assert getattr(module, "application") == "asgi-app"
