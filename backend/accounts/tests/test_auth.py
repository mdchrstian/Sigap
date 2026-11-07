import pytest
from django.contrib import admin
from django.core.cache import cache
from rest_framework.test import APIRequestFactory

from accounts.models import User
from accounts.permissions import IsOfficer

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear():
    cache.clear()


def reg(c, **kw):
    d = {"email": "a@x.com", "password": "pass12345", "full_name": "A"}
    d.update(kw)
    return c.post("/api/auth/register", d, format="json")


def test_register(api_client):
    r = reg(api_client)
    assert r.status_code == 201 and r.json()["role"] == "public"


def test_register_role_ignored(api_client):
    r = reg(api_client, role="admin")
    assert r.status_code == 201 and r.json()["role"] == "public"


def test_duplicate_and_case(api_client):
    reg(api_client, email="A@x.com")
    r = reg(api_client, email="a@x.com")
    assert r.status_code == 400 and "email" in r.json()


def test_weak_password(api_client):
    assert reg(api_client, password="123").status_code == 400


def test_login(api_client, make_user):
    make_user(email="l@x.com")
    r = api_client.post("/api/auth/login", {"email": "l@x.com", "password": "pass12345"}, format="json")
    assert r.status_code == 200
    assert {"access", "refresh", "user"} <= set(r.json())


def test_login_bad(api_client, make_user):
    make_user(email="l@x.com")
    r = api_client.post("/api/auth/login", {"email": "l@x.com", "password": "nope"}, format="json")
    assert r.status_code == 401 and r.json()["detail"] == "Email atau kata sandi salah."


def test_refresh(api_client, make_user):
    make_user(email="l@x.com")
    t = api_client.post("/api/auth/login", {"email": "l@x.com", "password": "pass12345"}, format="json").json()
    r = api_client.post("/api/auth/refresh", {"refresh": t["refresh"]}, format="json")
    assert r.status_code == 200 and "access" in r.json()


def test_me_unauth(api_client):
    assert api_client.get("/api/auth/me").status_code == 401


def test_patch_me(auth_client, make_user):
    u = make_user()
    r = auth_client(u).patch("/api/auth/me", {"full_name": "Z", "role": "admin"}, format="json")
    u.refresh_from_db()
    assert r.status_code == 200 and u.role == "public" and u.full_name == "Z"


def test_is_officer(make_user):
    req = APIRequestFactory().get("/")
    res = {}
    for role in ("public", "officer", "admin"):
        req.user = make_user(role=role)
        res[role] = IsOfficer().has_permission(req, None)
    assert res == {"public": False, "officer": True, "admin": True}


def test_admin_save_sets_staff(make_user, rf):
    ma = admin.site._registry[User]
    u = make_user(role="admin")
    u.is_staff = False
    ma.save_model(rf.get("/"), u, None, True)
    u.refresh_from_db()
    assert u.is_staff
    u.role = "officer"
    ma.save_model(rf.get("/"), u, None, True)
    u.refresh_from_db()
    assert not u.is_staff
