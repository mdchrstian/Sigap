from django.urls import path

from .views import OfficerReportListView, OfficerStatusView

urlpatterns = [
    path("officer/reports", OfficerReportListView.as_view()),
    path("officer/reports/<int:pk>/status", OfficerStatusView.as_view()),
]
