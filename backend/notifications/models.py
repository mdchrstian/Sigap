from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Kind(models.TextChoices):
        STATUS_CHANGED = "status_changed", "Status changed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name="notifications")
    report = models.ForeignKey("reports.Report", null=True, blank=True,
                               on_delete=models.CASCADE, related_name="+")
    kind = models.CharField(max_length=32, choices=Kind.choices,
                            default=Kind.STATUS_CHANGED)
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["user", "is_read"])]
