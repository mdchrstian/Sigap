import datetime as dt

from django.core.cache import cache
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts.permissions import IsOfficer
from ai_services import client as ai_client

from . import insights
from .services import compute_summary, stale_qs


def _date(v):
    return dt.date.fromisoformat(v) if v else None


class SummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        p = request.query_params
        try:
            f, t = _date(p.get("from")), _date(p.get("to"))
        except ValueError:
            return Response({"detail": "Format tanggal tidak valid (YYYY-MM-DD)."}, status=400)
        if f and t and f > t:
            return Response({"detail": "Tanggal awal setelah tanggal akhir."}, status=400)
        regency = (p.get("regency") or "").strip()
        key = f"analytics:summary:{f}:{t}:{regency.lower()}"
        data = cache.get(key)
        if data is None:
            data = compute_summary(f, t, regency or None)
            cache.set(key, data, 60)
        return Response(data)


class InsightsView(APIView):
    permission_classes = [IsOfficer]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ai_insights"

    def post(self, request):
        d = request.data
        try:
            f, t = _date(d.get("from")), _date(d.get("to"))
        except (ValueError, TypeError):
            return Response({"detail": "Format tanggal tidak valid (YYYY-MM-DD)."}, status=400)
        if f and t and f > t:
            return Response({"detail": "Tanggal awal setelah tanggal akhir."}, status=400)
        regency = str(d.get("regency") or "").strip()
        key = f"analytics:insights:{f}:{t}:{regency.lower()}"
        data = cache.get(key)
        if data is not None:
            return Response(data)
        stats, payload = insights.build_payload(f, t, regency or None)
        unavailable = Response({"detail": "Ringkasan AI tidak tersedia saat ini."}, status=503)
        try:
            result = ai_client.generate_json(
                insights.SYSTEM, payload, insights.SCHEMA, user=request.user)
        except ai_client.AIUnavailable:
            return unavailable
        if not isinstance(result, dict):
            return unavailable
        summary, highlights, verified = insights.verify(result, payload)
        data = {"summary": summary, "highlights": highlights, "verified": verified,
                "generated_at": timezone.now(), "based_on": stats}
        cache.set(key, data, 3600)
        return Response(data)


class StaleView(ListAPIView):
    permission_classes = [IsOfficer]

    def get_queryset(self):
        return stale_qs().select_related("category").order_by("updated_at", "id")

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        now = timezone.now()
        rows = [{
            "id": r.id, "code": r.code,
            "category": {"id": r.category_id, "slug": r.category.slug, "name": r.category.name},
            "status": r.status, "status_label": r.get_status_display(),
            "regency": r.regency, "updated_at": r.updated_at,
            "days_since_update": (now - r.updated_at).days,
        } for r in page]
        return self.get_paginated_response(rows)
