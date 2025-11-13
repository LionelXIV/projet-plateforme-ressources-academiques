"""
Tests for backend.project.settings to validate environment-derived configuration.
"""
import importlib
import sys

import pytest


def test_secret_key_loaded_from_env(monkeypatch):
    """Ensure importing settings picks up SECRET_KEY from the environment."""
    monkeypatch.setenv("SECRET_KEY", "from-env")
    sys.modules.pop("backend.project.settings", None)

    settings = importlib.import_module("backend.project.settings")

    assert settings.SECRET_KEY == "from-env"
    assert settings.JWT_ALGORITHM == "HS256"
    assert settings.JWT_EXPIRATION_HOURS == 24

def test_missing_secret_key_raises(monkeypatch):
    """Ensure missing SECRET_KEY triggers a runtime error during import."""
    monkeypatch.delenv("SECRET_KEY", raising=False)
    monkeypatch.setattr("dotenv.load_dotenv", lambda *a, **kw: None, raising=False)
    sys.modules.pop("backend.project.settings", None)

    with pytest.raises(RuntimeError):
        importlib.import_module("backend.project.settings")

    monkeypatch.setenv("SECRET_KEY", "restored")
    sys.modules.pop("backend.project.settings", None)
    importlib.import_module("backend.project.settings")
