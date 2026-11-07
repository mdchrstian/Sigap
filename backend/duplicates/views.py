from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import find_candidates


class CheckSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    category_id = serializers.IntegerField()
    description = serializers.CharField(max_length=2000)


def _item(c, request):
    r = c["report"]
    first = next(iter(r.images.all()), None)
    url = request.build_absolute_uri(first.image.url) if first else None
    sim = c["similarity"]
    return {
        "report_id": r.id, "code": r.code, "category_name": r.category.name,
        "description": r.description[:200], "distance_m": int(round(c["distance"])),
        "similarity": round(sim, 2) if sim is not None else None,
        "status": r.status, "status_label": r.get_status_display(),
        "thumbnail_url": url, "master_id": r.master_id, "created_at": r.created_at,
    }


class CheckView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = CheckSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        res = find_candidates(d["latitude"], d["longitude"], d["category_id"],
                              d["description"])
        return Response({"decision": res["decision"],
                         "candidates": [_item(c, request) for c in res["candidates"]]})
