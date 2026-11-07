from django.urls import path

from .views import MarkReadView, NotificationListView, ReadAllView, UnreadCountView

urlpatterns = [
    path("notifications", NotificationListView.as_view()),
    path("notifications/unread-count", UnreadCountView.as_view()),
    path("notifications/read-all", ReadAllView.as_view()),
    path("notifications/<int:pk>/read", MarkReadView.as_view()),
]
