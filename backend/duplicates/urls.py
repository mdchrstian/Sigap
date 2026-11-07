from django.urls import path

from .views import CheckView

urlpatterns = [path("duplicates/check", CheckView.as_view())]
