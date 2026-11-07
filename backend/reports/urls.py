from django.urls import path

from .views import CategoryListView, MyReportsView, ReportCreateView, ReportDetailView

urlpatterns = [
    path("categories", CategoryListView.as_view()),
    path("reports", ReportCreateView.as_view()),
    path("reports/mine", MyReportsView.as_view()),
    path("reports/<int:pk>", ReportDetailView.as_view()),
]
