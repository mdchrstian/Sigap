from django.conf import settings
from django.db import models


class Category(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class MasterReport(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def report_count(self):
        return self.reports.count()


class Report(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Dikirim"
        UNDER_REVIEW = "under_review", "Ditinjau"
        VERIFIED = "verified", "Terverifikasi"
        IN_PROGRESS = "in_progress", "Diproses"
        COMPLETED = "completed", "Selesai"
        REJECTED = "rejected", "Ditolak"

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name="reports")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="reports")
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=255, blank=True)
    regency = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.SUBMITTED)
    master = models.ForeignKey(MasterReport, null=True, blank=True, on_delete=models.SET_NULL,
                               related_name="reports")
    ai_used = models.BooleanField(default=False)
    ai_suggested_category = models.ForeignKey(Category, null=True, blank=True,
                                              on_delete=models.SET_NULL, related_name="+")
    ai_suggested_description = models.TextField(blank=True)
    ai_observations = models.JSONField(default=list, blank=True)
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["latitude", "longitude"])]

    @property
    def code(self):
        return f"SGP-{self.id:06d}"

    def __str__(self):
        return self.code


class ReportImage(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="reports/%Y/%m/")
    created_at = models.DateTimeField(auto_now_add=True)
