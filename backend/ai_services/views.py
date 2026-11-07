import io

from PIL import Image, ImageOps
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from reports.images import ImageError, validate_image
from reports.models import Category

from . import client
from .models import AIProcessingLog

FALLBACK = {"detail": "Analisis AI tidak tersedia. Silakan isi laporan secara manual.",
            "fallback": "manual"}


def prepare_image(upload):
    """Downscale to <=1024 px JPEG; re-encoding drops EXIF."""
    img = Image.open(upload)
    img.load()
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")
    img.thumbnail((1024, 1024))
    out = io.BytesIO()
    img.save(out, "JPEG", quality=85)
    return out.getvalue()


class AnalyzePhotoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai_analyze"

    def post(self, request):
        upload = request.FILES.get("image")
        if not upload:
            return Response({"image": "Foto wajib diunggah."}, status=400)
        try:
            validate_image(upload)
            data = prepare_image(upload)
        except ImageError as e:
            return Response({"image": str(e)}, status=400)
        except Exception:  # noqa: BLE001
            return Response({"image": "File harus berupa gambar JPG, PNG, atau WebP."},
                            status=400)

        cats = list(Category.objects.filter(is_active=True).values("slug", "name"))
        try:
            res = client.analyze_photo(data, cats, user=request.user)
        except client.AIUnavailable:
            return Response(FALLBACK, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        slug = res.get("category_slug")
        if slug not in {c["slug"] for c in cats}:
            slug = None
        obs = [str(o) for o in (res.get("observations") or [])][:5]
        log = AIProcessingLog.objects.filter(
            user=request.user, kind="analyze_photo").order_by("-id").first()
        return Response({
            "is_infrastructure": bool(res.get("is_infrastructure")),
            "category_slug": slug,
            "description": str(res.get("description") or "")[:600],
            "observations": obs,
            "requires_review": True,
            "log_id": log.id if log else None,
        })
