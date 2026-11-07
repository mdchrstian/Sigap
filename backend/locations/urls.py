from django.urls import path

from .views import ReverseView, SearchView

urlpatterns = [
    path("locations/search", SearchView.as_view()),
    path("locations/reverse", ReverseView.as_view()),
]
