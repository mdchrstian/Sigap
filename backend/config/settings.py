from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, ["localhost", "127.0.0.1"]),
    CORS_ALLOWED_ORIGINS=(list, ["http://localhost:5173"]),
    STORAGE_BACKEND=(str, "local"),
    AI_PROVIDER=(str, "fake"),
    OPENAI_VISION_MODEL=(str, "gpt-4o-mini"),
    OPENAI_TEXT_MODEL=(str, "gpt-4o-mini"),
    OPENAI_EMBEDDING_MODEL=(str, "text-embedding-3-small"),
)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="dev-insecure-key-change-me-please-0123456789")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = list(env("ALLOWED_HOSTS"))
_render_host = env("RENDER_EXTERNAL_HOSTNAME", default="")
if _render_host and _render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(_render_host)

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "storages",
    "accounts",
    "reports",
    "ai_services",
    "duplicates",
    "locations",
    "tracking",
    "dashboard",
    "community",
    "notifications",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
APPEND_SLASH = False

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": env.db(
        "DATABASE_URL", default="postgres://sigap:sigap@localhost:54329/sigap"
    )
}

AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "id"
TIME_ZONE = "Asia/Makassar"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = env("CORS_ALLOWED_ORIGINS")

STORAGE_BACKEND = env("STORAGE_BACKEND")
if STORAGE_BACKEND in ("supabase", "s3"):
    _default_storage = {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "endpoint_url": env("SUPABASE_S3_ENDPOINT", default=""),
            "region_name": env("SUPABASE_S3_REGION", default=""),
            "access_key": env("SUPABASE_S3_ACCESS_KEY", default=""),
            "secret_key": env("SUPABASE_S3_SECRET_KEY", default=""),
            "bucket_name": env("SUPABASE_BUCKET", default=""),
            "querystring_auth": False,
        },
    }
else:
    _default_storage = {"BACKEND": "django.core.files.storage.FileSystemStorage"}
if STORAGE_BACKEND in ("supabase", "s3"):
    _public_url = env("SUPABASE_PUBLIC_URL", default="")
    if _public_url:
        AWS_S3_CUSTOM_DOMAIN = _public_url.removeprefix("https://").rstrip("/")
        AWS_QUERYSTRING_AUTH = False
        _default_storage["OPTIONS"]["custom_domain"] = AWS_S3_CUSTOM_DOMAIN
STORAGES = {
    "default": _default_storage,
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
        if DEBUG
        else "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}

AI_PROVIDER = env("AI_PROVIDER")
OPENAI_API_KEY = env("OPENAI_API_KEY", default="")
OPENAI_VISION_MODEL = env("OPENAI_VISION_MODEL")
OPENAI_TEXT_MODEL = env("OPENAI_TEXT_MODEL")
OPENAI_EMBEDDING_MODEL = env("OPENAI_EMBEDDING_MODEL")
NUSAROUTER_API_KEY = env.str("NUSAROUTER_API_KEY", default="")
NUSAROUTER_BASE_URL = env.str("NUSAROUTER_BASE_URL", default="")
NUSAROUTER_VISION_MODEL = env.str("NUSAROUTER_VISION_MODEL", default="")
NUSAROUTER_TEXT_MODEL = env.str("NUSAROUTER_TEXT_MODEL", default="")
NUSAROUTER_TIMEOUT = env.int("NUSAROUTER_TIMEOUT", default=30)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication"
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly"
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_RATES": {
        "register": "5/hour",
        "login": "10/min",
        "geocode": "30/min",
        "ai_analyze": "10/hour",
        "comments": "20/hour",
        "ai_insights": "20/hour",
    },
}

from datetime import timedelta  # noqa: E402

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "USER_ID_FIELD": "id",
}

NOMINATIM_URL = env("NOMINATIM_URL", default="https://nominatim.openstreetmap.org")
NOMINATIM_USER_AGENT = env(
    "NOMINATIM_USER_AGENT", default="Sigap/0.1 (Bali DigiFest 2026 demo)"
)

DUP_RADIUS_M = env.int("DUP_RADIUS_M", default=100)
DUP_WINDOW_DAYS = env.int("DUP_WINDOW_DAYS", default=90)
DUP_HIGH_SIM = env.float("DUP_HIGH_SIM", default=0.88)
DUP_HIGH_MAX_DIST_M = env.int("DUP_HIGH_MAX_DIST_M", default=50)
DUP_MEDIUM_SIM = env.float("DUP_MEDIUM_SIM", default=0.75)
DUP_MAX_CANDIDATES = env.int("DUP_MAX_CANDIDATES", default=5)
