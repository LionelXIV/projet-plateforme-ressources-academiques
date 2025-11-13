"""
Tests for lightweight view helpers in backend.views.
"""
from types import SimpleNamespace


def test_home_redirects_to_core(monkeypatch):
    """Ensure home view redirects to the expected core list URL."""
    from project import views

    monkeypatch.setattr(views, "reverse", lambda name: "/core/list/")
    request = SimpleNamespace()

    response = views.home(request)

    assert response.status_code == 302
    assert response.url == "/core/list/"
