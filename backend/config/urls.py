from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

APPS = ["accounts", "reports", "ai_services", "duplicates", "locations",
        "tracking", "dashboard", "community", "notifications"]


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health", health),
] + [path("api/", include(f"{a}.urls")) for a in APPS]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
