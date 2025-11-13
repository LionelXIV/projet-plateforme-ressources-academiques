"""
Tests for backend.wsgi ensuring the WSGI application is initialised correctly.
"""
import importlib
import sys
import types


def test_wsg_application_initialised(monkeypatch):
    """Ensure the WSGI application callable is created from Django's factory."""
    fake_wsg = types.ModuleType("django.core.wsgi")
    fake_wsg.get_wsgi_application = lambda: "wsgi-app"
    monkeypatch.setitem(sys.modules, "django.core.wsgi", fake_wsg)
    monkeypatch.setenv("DJANGO_SETTINGS_MODULE", "backend.project.settings")

    sys.modules.pop("backend.project.wsgi", None)
    module = importlib.import_module("backend.project.wsgi")

    assert getattr(module, "application") == "wsgi-app"
