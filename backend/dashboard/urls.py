from django.urls import path

from .views import InsightsView, StaleView, SummaryView

urlpatterns = [
    path("analytics/summary", SummaryView.as_view()),
    path("analytics/stale", StaleView.as_view()),
    path("analytics/insights", InsightsView.as_view()),
]
