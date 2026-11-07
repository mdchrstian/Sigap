from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsOfficer
from reports.models import Report
from reports.serializers import _cat, _url, serialize_detail

from .services import StatusError, change_status


def serialize_officer_item(r, request):
    first = next(iter(r.images.all()), None)
    d = r.description
    return {
        "id": r.id, "code": r.code, "category": _cat(r.category),
        "description": d if len(d) <= 140 else d[:139] + "…",
        "status": r.status, "status_label": r.get_status_display(),
        "regency": r.regency,
        "thumbnail_url": _url(request, first.image) if first else None,
        "master_id": r.master_id,
        "master_count": getattr(r, "master_n", None) or (1 if r.master_id else 0),
        "reporter_name": r.reporter.full_name,
        "is_hidden": r.is_hidden,
        "created_at": r.created_at, "updated_at": r.updated_at,
    }


class OfficerReportListView(ListAPIView):
    permission_classes = [IsOfficer]

    def get_queryset(self):
        p = self.request.query_params
        qs = (Report.objects.select_related("category", "reporter")
              .prefetch_related("images").order_by("-created_at", "-id"))
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        if p.get("category"):
            c = p["category"]
            qs = qs.filter(category_id=c) if c.isdigit() else qs.filter(category__slug=c)
        if p.get("regency"):
            qs = qs.filter(regency__iexact=p["regency"])
        if p.get("q"):
            q = p["q"].strip()
            cond = Q(description__icontains=q)
            digits = q.upper().removeprefix("SGP-")
            if digits.isdigit():
                cond |= Q(id=int(digits))
            qs = qs.filter(cond)
        return qs

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        ids = {r.master_id for r in page if r.master_id}
        counts = dict(Report.objects.filter(master_id__in=ids).values("master_id")
                      .annotate(n=Count("id")).values_list("master_id", "n"))
        for r in page:
            r.master_n = counts.get(r.master_id)
        return self.get_paginated_response(
            [serialize_officer_item(r, request) for r in page])


class OfficerStatusView(APIView):
    permission_classes = [IsOfficer]

    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        try:
            changed = change_status(report, request.data.get("status"),
                                    request.data.get("note", ""), request.user)
        except StatusError as e:
            return Response({"detail": str(e)}, status=400)
        report = Report.objects.get(pk=pk)
        return Response({"updated": [r.id for r in changed],
                         "report": serialize_detail(report, request)})
