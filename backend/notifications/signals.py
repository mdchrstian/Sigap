from django.db.models.signals import post_save
from django.dispatch import receiver

from reports.models import Report
from tracking.models import ReportStatusHistory

from .models import Notification


@receiver(post_save, sender=ReportStatusHistory, dispatch_uid="notify_status_changed")
def on_status_history(sender, instance, created, raw=False, **kwargs):
    if raw or not created or instance.from_status is None:
        return
    report = instance.report
    if instance.changed_by_id == report.reporter_id:
        return
    try:
        label = Report.Status(instance.to_status).label
    except ValueError:
        label = instance.to_status
    body = f"Status kini: {label}."
    if instance.note:
        body += f" Catatan: {instance.note}"
    Notification.objects.create(
        user_id=report.reporter_id, report=report, kind=Notification.Kind.STATUS_CHANGED,
        title=f"Status laporan {report.code} diperbarui", body=body)
