"""
Tests for backend URL configuration to ensure primary routes exist.
"""
from importlib import reload


def test_urlpatterns_include_auth_routes():
    """Ensure login and logout routes point to the expected view callables."""
    from project import auth_jwt, urls

    login_route = next((pattern for pattern in urls.urlpatterns if getattr(pattern, "name", None) == "api_login"), None)
    logout_route = next((pattern for pattern in urls.urlpatterns if getattr(pattern, "name", None) == "api_logout"), None)

    assert login_route is not None
    assert logout_route is not None
    assert login_route.callback == auth_jwt.login_jwt
    assert logout_route.callback == auth_jwt.logout_jwt


def test_debug_static_patterns_added(monkeypatch):
    """Ensure static helper is invoked when DEBUG is true."""
    import project.urls as urls_module
    base_len = len(urls_module.urlpatterns)

    called = {}

    def fake_static(*args, **kwargs):
        called["args"] = (args, kwargs)
        return ["static-item"]

    import django.conf

    monkeypatch.setattr(django.conf.settings, "DEBUG", True, raising=False)
    monkeypatch.setattr(django.conf.settings, "MEDIA_URL", "/media/", raising=False)
    monkeypatch.setattr(django.conf.settings, "MEDIA_ROOT", "/tmp", raising=False)
    monkeypatch.setattr("django.conf.urls.static.static", fake_static)

    reload(urls_module)

    assert called, "static() helper was not invoked"
    assert "static-item" in urls_module.urlpatterns
    reload(urls_module)
