from datetime import datetime, time

from django.db.models import Count
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Report

LIMIT = 1000
MAX_SPAN = 2.0


def _bad(msg):
    return Response({"detail": msg}, status=400)


class ReportMapView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        p = request.query_params
        try:
            min_lng, min_lat, max_lng, max_lat = (float(x) for x in p["bbox"].split(","))
        except (KeyError, ValueError):
            return _bad("bbox required: minLng,minLat,maxLng,maxLat")
        if max_lng < min_lng or max_lat < min_lat or \
                max_lng - min_lng > MAX_SPAN or max_lat - min_lat > MAX_SPAN:
            return _bad("bbox invalid or span exceeds 2 degrees")

        qs = Report.objects.filter(
            is_hidden=False, latitude__gte=min_lat, latitude__lte=max_lat,
            longitude__gte=min_lng, longitude__lte=max_lng)
        cats = [c for c in p.get("category", "").split(",") if c]
        if cats:
            qs = qs.filter(category__slug__in=cats)
        sts = [s for s in p.get("status", "").split(",") if s]
        if sts:
            qs = qs.filter(status__in=sts)
        if p.get("regency"):
            qs = qs.filter(regency=p["regency"])
        tz = timezone.get_current_timezone()
        if p.get("from"):
            d = parse_date(p["from"])
            if not d:
                return _bad("invalid from")
            qs = qs.filter(created_at__gte=timezone.make_aware(datetime.combine(d, time.min), tz))
        if p.get("to"):
            d = parse_date(p["to"])
            if not d:
                return _bad("invalid to")
            qs = qs.filter(created_at__lte=timezone.make_aware(datetime.combine(d, time.max), tz))

        rows = list(qs.select_related("category", "master")
                    .annotate(_mc=Count("master__reports"))
                    .order_by("-created_at", "-id")[:LIMIT + 1])
        truncated = len(rows) > LIMIT
        features = [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [r.longitude, r.latitude]},
            "properties": {
                "id": r.id, "code": r.code, "category_slug": r.category.slug,
                "category_name": r.category.name, "status": r.status,
                "status_label": r.get_status_display(), "created_at": r.created_at.isoformat(),
                "master_count": r._mc if r.master_id else 1,
            },
        } for r in rows[:LIMIT]]
        return Response({"type": "FeatureCollection", "truncated": truncated,
                         "features": features})
