from django.conf import settings
from django.db import models


class AIProcessingLog(models.Model):
    KINDS = [("analyze_photo", "analyze_photo"), ("embedding", "embedding"),
             ("insights", "insights")]
    STATUSES = [("success", "success"), ("failed", "failed")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                             on_delete=models.SET_NULL, related_name="+")
    kind = models.CharField(max_length=20, choices=KINDS)
    model = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=10, choices=STATUSES)
    latency_ms = models.PositiveIntegerField(default=0)
    error = models.TextField(blank=True)
    prompt_tokens = models.PositiveIntegerField(null=True, blank=True)
    completion_tokens = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
