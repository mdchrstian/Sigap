from django.urls import path

from .views import AnalyzePhotoView

urlpatterns = [path("ai/analyze-photo", AnalyzePhotoView.as_view())]
