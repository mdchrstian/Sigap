import os

os.environ["AI_PROVIDER"] = "fake"
os.environ["STORAGE_BACKEND"] = "local"

import pytest  # noqa: E402
from rest_framework.test import APIClient  # noqa: E402
from rest_framework_simplejwt.tokens import RefreshToken  # noqa: E402


@pytest.fixture(autouse=True)
def _tmp_media(settings, tmp_path):
    settings.MEDIA_ROOT = str(tmp_path / "media")
    settings.AI_PROVIDER = "fake"
    settings.STORAGES = {
        **settings.STORAGES,
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
            "OPTIONS": {"location": settings.MEDIA_ROOT},
        },
    }


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def make_user(db):
    from accounts.models import User

    counter = {"n": 0}

    def _make(role="public", **kw):
        counter["n"] += 1
        email = kw.pop("email", f"user{counter['n']}@example.com")
        password = kw.pop("password", "pass12345")
        return User.objects.create_user(email=email, password=password, role=role, **kw)

    return _make


@pytest.fixture
def auth_client(api_client):
    def _auth(user):
        token = RefreshToken.for_user(user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return api_client

    return _auth
