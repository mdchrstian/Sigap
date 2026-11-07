from django.urls import path

from .views import StaleView, SummaryView

urlpatterns = [
    path("analytics/summary", SummaryView.as_view()),
    path("analytics/stale", StaleView.as_view()),
]
