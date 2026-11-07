from django.conf import settings
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import models


class ReportComment(models.Model):
    report = models.ForeignKey("reports.Report", on_delete=models.CASCADE,
                               related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name="report_comments")
    body = models.TextField(validators=[MinLengthValidator(3), MaxLengthValidator(1000)])
    image = models.ImageField(upload_to="comments/%Y/%m/", null=True, blank=True)
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"Comment {self.pk} on {self.report_id}"
