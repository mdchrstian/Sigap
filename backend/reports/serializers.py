import json

from rest_framework import serializers

from locations.services import is_in_bali

from .images import ImageError, validate_image
from .models import Category, Report


def _cat(c):
    return {"id": c.id, "slug": c.slug, "name": c.name} if c else None


def _url(request, f):
    url = f.url
    return request.build_absolute_uri(url) if request else url


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "slug", "name")


class ReportCreateSerializer(serializers.Serializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True), source="category")
    description = serializers.CharField(min_length=10, max_length=2000)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    ai_used = serializers.BooleanField(required=False, default=False)
    ai_suggested_category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="ai_suggested_category",
        required=False, allow_null=True)
    ai_suggested_description = serializers.CharField(required=False, allow_blank=True)
    ai_observations = serializers.CharField(required=False, allow_blank=True)

    def validate_ai_observations(self, value):
        if not value:
            return []
        try:
            data = json.loads(value)
        except ValueError:
            raise serializers.ValidationError("Harus berupa JSON list yang valid.")
        if not isinstance(data, list):
            raise serializers.ValidationError("Harus berupa JSON list yang valid.")
        return data

    def validate(self, attrs):
        if not is_in_bali(attrs["latitude"], attrs["longitude"]):
            raise serializers.ValidationError(
                {"latitude": "Lokasi harus berada di Provinsi Bali."})
        return attrs

    def validate_images(self, files):
        if not 1 <= len(files) <= 3:
            raise serializers.ValidationError("Unggah 1 sampai 3 foto.")
        for f in files:
            try:
                validate_image(f)
            except ImageError as e:
                raise serializers.ValidationError(str(e))
        return files


def serialize_list_item(r, request):
    first = next(iter(r.images.all()), None)
    d = r.description
    return {
        "id": r.id, "code": r.code, "category": _cat(r.category),
        "description": d if len(d) <= 140 else d[:139] + "…",
        "status": r.status, "status_label": r.get_status_display(),
        "thumbnail_url": _url(request, first.image) if first else None,
        "regency": r.regency, "created_at": r.created_at,
    }


def serialize_detail(r, request):
    u = request.user if request else None
    authed = bool(u and u.is_authenticated)
    out = {
        "id": r.id, "code": r.code, "category": _cat(r.category),
        "description": r.description, "latitude": r.latitude, "longitude": r.longitude,
        "address": r.address, "regency": r.regency,
        "status": r.status, "status_label": r.get_status_display(),
        "images": [{"id": i.id, "url": _url(request, i.image)} for i in r.images.all()],
        "master": ({"id": r.master_id, "report_count": r.master.report_count}
                   if r.master_id else None),
        "ai": {"used": r.ai_used, "suggested_category": _cat(r.ai_suggested_category),
               "suggested_description": r.ai_suggested_description,
               "observations": r.ai_observations},
        "created_at": r.created_at, "updated_at": r.updated_at,
        "is_mine": bool(authed and r.reporter_id == u.id),
    }
    if authed and u.role in ("officer", "admin"):
        rep = r.reporter
        out["reporter"] = {"id": rep.id, "full_name": rep.full_name, "email": rep.email}
    return out
