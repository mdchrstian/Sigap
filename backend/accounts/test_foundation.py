import pytest
from django.conf import settings
from django.db import IntegrityError, connection

from accounts.models import User


def test_health(api_client, db):
    r = api_client.get("/api/health")
    assert r.status_code == 200 and r.json() == {"status": "ok"}


def test_create_user(db):
    u = User.objects.create_user("a@x.com", "secret123")
    assert u.role == "public" and u.password != "secret123" and u.check_password("secret123")


def test_create_superuser(db):
    u = User.objects.create_superuser("s@x.com", "secret123")
    assert u.role == "admin" and u.is_staff and u.is_superuser


def test_extensions(db):
    with connection.cursor() as c:
        c.execute("SELECT extname FROM pg_extension")
        names = {r[0] for r in c.fetchall()}
    assert {"postgis", "vector"} <= names


def test_auth_client(make_user, auth_client):
    assert auth_client(make_user()).get("/api/health").status_code == 200


def test_duplicate_email(db):
    User.objects.create_user("d@x.com", "p")
    with pytest.raises(IntegrityError):
        User.objects.create_user("d@x.com", "p")


def test_ai_default():
    assert settings.AI_PROVIDER == "fake"
