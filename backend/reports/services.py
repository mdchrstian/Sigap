from django.db import transaction

from locations.services import reverse_geocode

from .images import process_image
from .models import Report, ReportImage


def create_report(user, data, images):
    processed = [process_image(f, f"img{i}") for i, f in enumerate(images)]
    regency, address = "", data.get("address", "") or ""
    try:
        geo = reverse_geocode(data["latitude"], data["longitude"]) or {}
        regency = geo.get("regency", "") or ""
        if not address:
            address = geo.get("address", "") or ""
    except Exception:
        pass
    with transaction.atomic():
        report = Report.objects.create(
            reporter=user,
            category=data["category"],
            description=data["description"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            address=address[:255],
            regency=regency[:64],
            ai_used=data.get("ai_used", False),
            ai_suggested_category=data.get("ai_suggested_category"),
            ai_suggested_description=data.get("ai_suggested_description", ""),
            ai_observations=data.get("ai_observations", []),
        )
        for f in processed:
            ReportImage.objects.create(report=report, image=f)
    return report
