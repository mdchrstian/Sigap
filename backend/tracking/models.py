from django.conf import settings
from django.db import models


class ReportStatusHistory(models.Model):
    report = models.ForeignKey("reports.Report", on_delete=models.CASCADE,
                               related_name="history")
    from_status = models.CharField(max_length=16, null=True, blank=True)
    to_status = models.CharField(max_length=16)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        verbose_name_plural = "status history"
