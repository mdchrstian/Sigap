from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from . import services


class _Base(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "geocode"


class SearchView(_Base):
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not 3 <= len(q) <= 100:
            return Response({"detail": "q must be 3-100 characters"}, status=400)
        try:
            return Response(services.search(q))
        except services.GeocodingError:
            return Response({"detail": "Geocoding unavailable"}, status=503)


class ReverseView(_Base):
    def get(self, request):
        try:
            lat = float(request.query_params["lat"])
            lng = float(request.query_params["lng"])
        except (KeyError, ValueError):
            return Response({"detail": "lat and lng required"}, status=400)
        if not services.is_in_bali(lat, lng):
            return Response({"address": "", "regency": "", "in_bali": False})
        try:
            res = services.reverse_geocode(lat, lng)
        except services.GeocodingError:
            return Response({"detail": "Geocoding unavailable"}, status=503)
        return Response({**res, "in_bali": True})
