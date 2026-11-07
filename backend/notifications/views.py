from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    report_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "kind", "title", "body", "is_read", "report_id", "created_at"]


def unread(user):
    return Notification.objects.filter(user=user, is_read=False).count()


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(user=request.user)
        pg = PageNumberPagination()
        page = pg.paginate_queryset(qs, request, view=self)
        res = pg.get_paginated_response(NotificationSerializer(page, many=True).data)
        res.data["unread_count"] = unread(request.user)
        return res


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"unread_count": unread(request.user)})


class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        n = get_object_or_404(Notification, pk=pk, user=request.user)
        if not n.is_read:
            n.is_read = True
            n.save(update_fields=["is_read"])
        return Response(status=204)


class ReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response(status=204)
