import importlib
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]


def load_settings(monkeypatch, **env):
    for k in ("STORAGE_BACKEND", "SUPABASE_PUBLIC_URL", "RENDER_EXTERNAL_HOSTNAME",
              "CSRF_TRUSTED_ORIGINS", "DEBUG"):
        monkeypatch.delenv(k, raising=False)
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    import config.settings as s
    return importlib.reload(s)


@pytest.fixture(autouse=True)
def _restore():
    yield
    import config.settings as s
    importlib.reload(s)


def test_whitenoise_after_security():
    from django.conf import settings
    mw = settings.MIDDLEWARE
    i = mw.index("django.middleware.security.SecurityMiddleware")
    assert mw[i + 1] == "whitenoise.middleware.WhiteNoiseMiddleware"


def test_proxy_header(monkeypatch):
    s = load_settings(monkeypatch)
    assert s.SECURE_PROXY_SSL_HEADER == ("HTTP_X_FORWARDED_PROTO", "https")


def test_csrf_default_empty(monkeypatch):
    assert load_settings(monkeypatch).CSRF_TRUSTED_ORIGINS == []


def test_csrf_env(monkeypatch):
    s = load_settings(monkeypatch, CSRF_TRUSTED_ORIGINS="https://a.com,https://b.com")
    assert s.CSRF_TRUSTED_ORIGINS == ["https://a.com", "https://b.com"]


def test_prod_flags(monkeypatch):
    s = load_settings(monkeypatch, DEBUG="false")
    assert s.SESSION_COOKIE_SECURE and s.CSRF_COOKIE_SECURE
    assert "CompressedManifest" in s.STORAGES["staticfiles"]["BACKEND"]


def test_render_host(monkeypatch):
    s = load_settings(monkeypatch, RENDER_EXTERNAL_HOSTNAME="sigap.onrender.com")
    assert "sigap.onrender.com" in s.ALLOWED_HOSTS


def test_local_storage_default(monkeypatch):
    s = load_settings(monkeypatch)
    assert s.STORAGES["default"]["BACKEND"].endswith("FileSystemStorage")


@pytest.mark.parametrize("backend", ["supabase", "s3"])
def test_supabase_storage(monkeypatch, backend):
    s = load_settings(
        monkeypatch,
        STORAGE_BACKEND=backend,
        SUPABASE_PUBLIC_URL="https://x.supabase.co/storage/v1/object/public/b",
    )
    assert s.STORAGES["default"]["BACKEND"] == "storages.backends.s3.S3Storage"
    assert s.AWS_S3_CUSTOM_DOMAIN == "x.supabase.co/storage/v1/object/public/b"
    assert s.AWS_QUERYSTRING_AUTH is False


def test_render_yaml():
    t = (ROOT / "render.yaml").read_text()
    for needle in ("rootDir: backend", "healthCheckPath: /api/health",
                   "manage.py migrate --noinput && uv run gunicorn",
                   "key: DATABASE_URL\n        sync: false"):
        assert needle in t
