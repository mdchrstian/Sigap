from django.http import Http404
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from reports.images import ImageError, process_image
from reports.models import Report

from .models import ReportComment


class CommentThrottle(UserRateThrottle):
    scope = "comments"


def author_label(c):
    if c.author_id == c.report.reporter_id:
        return "Pelapor"
    if c.author.role in ("officer", "admin"):
        return "Petugas"
    return "Warga"


def serialize(c, request):
    u = request.user
    return {
        "id": c.id,
        "body": c.body,
        "image_url": request.build_absolute_uri(c.image.url) if c.image else None,
        "author_label": author_label(c),
        "is_mine": bool(u.is_authenticated and u.id == c.author_id),
        "created_at": c.created_at,
    }


class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_throttles(self):
        return [CommentThrottle()] if self.request.method == "POST" else []

    def _report(self, pk):
        try:
            return Report.objects.get(pk=pk, is_hidden=False)
        except Report.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        report = self._report(pk)
        qs = (ReportComment.objects.filter(report=report, is_hidden=False)
              .select_related("author", "report").order_by("created_at", "id"))
        pager = PageNumberPagination()
        page = pager.paginate_queryset(qs, request, view=self)
        return pager.get_paginated_response([serialize(c, request) for c in page])

    def post(self, request, pk):
        report = self._report(pk)
        body = (request.data.get("body") or "").strip()
        errors = {}
        if not 3 <= len(body) <= 1000:
            errors["body"] = ["Komentar harus 3 sampai 1000 karakter."]
        image = request.FILES.get("image")
        processed = None
        if image:
            try:
                processed = process_image(image, name="comment")
            except ImageError as e:
                errors["image"] = [str(e)]
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        c = ReportComment.objects.create(report=report, author=request.user, body=body,
                                         image=processed)
        return Response(serialize(c, request), status=status.HTTP_201_CREATED)


class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            c = ReportComment.objects.get(pk=pk, is_hidden=False)
        except ReportComment.DoesNotExist:
            raise Http404
        if c.author_id != request.user.id and request.user.role != "admin":
            return Response({"detail": "Tidak diizinkan."}, status=status.HTTP_403_FORBIDDEN)
        c.is_hidden = True
        c.save(update_fields=["is_hidden"])
        return Response(status=status.HTTP_204_NO_CONTENT)
