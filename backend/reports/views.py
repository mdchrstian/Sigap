from django.http import Http404
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Report
from .serializers import (CategorySerializer, ReportCreateSerializer, serialize_detail,
                          serialize_list_item)
from .services import create_report

QS = Report.objects.select_related("category", "reporter", "master",
                                   "ai_suggested_category").prefetch_related("images")


class CategoryListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        qs = Category.objects.filter(is_active=True).order_by("id")
        return Response(CategorySerializer(qs, many=True).data)


class ReportCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        s = ReportCreateSerializer(data=request.data)
        s.is_valid(raise_exception=False)
        errors = dict(s.errors)
        files = request.FILES.getlist("images")
        try:
            files = s.validate_images(files)
        except Exception as e:
            errors["images"] = getattr(e, "detail", [str(e)])
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        report = create_report(request.user, s.validated_data, files)
        report = QS.get(pk=report.pk)
        return Response(serialize_detail(report, request), status=status.HTTP_201_CREATED)


class ReportDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            r = QS.get(pk=pk)
        except Report.DoesNotExist:
            raise Http404
        u = request.user
        if r.is_hidden:
            ok = u.is_authenticated and (r.reporter_id == u.id or u.role in ("officer", "admin"))
            if not ok:
                raise Http404
        return Response(serialize_detail(r, request))


class MyReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = QS.filter(reporter=request.user).order_by("-created_at", "-id")
        pager = PageNumberPagination()
        page = pager.paginate_queryset(qs, request, view=self)
        return pager.get_paginated_response([serialize_list_item(r, request) for r in page])
