from django.db.models.signals import post_save
from django.dispatch import receiver

from reports.models import Report

from .models import ReportStatusHistory


@receiver(post_save, sender=Report, dispatch_uid="tracking_initial_history")
def on_report_created(sender, instance, created, raw=False, **kwargs):
    if created and not raw:
        ReportStatusHistory.objects.create(
            report=instance, from_status=None, to_status=Report.Status.SUBMITTED,
            note="", changed_by_id=instance.reporter_id)
