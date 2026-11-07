from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import ValidationError

from locations.services import reverse_geocode

from .images import process_image
from .models import Report, ReportImage


LINK_ERROR = "Laporan yang dipilih tidak valid untuk digabungkan."


def _resolve_link_target(data):
    from duplicates.services import visible_target
    target = visible_target(data["latitude"], data["longitude"], data["link_to_report_id"],
                            2 * settings.DUP_RADIUS_M)
    if target is None:
        raise ValidationError({"link_to_report_id": [LINK_ERROR]})
    return target


def create_report(user, data, images):
    target = _resolve_link_target(data) if data.get("link_to_report_id") else None
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
        if target:
            from duplicates.services import link_report
            link_report(report, target)
    from duplicates.services import store_embedding
    store_embedding(report)
    return report
