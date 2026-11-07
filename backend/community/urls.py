from django.urls import path

from .views import CommentDeleteView, CommentListCreateView

urlpatterns = [
    path("reports/<int:pk>/comments", CommentListCreateView.as_view()),
    path("comments/<int:pk>", CommentDeleteView.as_view()),
]
