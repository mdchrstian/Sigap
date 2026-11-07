from django.contrib import admin

from .models import AIProcessingLog


@admin.register(AIProcessingLog)
class AIProcessingLogAdmin(admin.ModelAdmin):
    list_display = ("id", "kind", "model", "status", "latency_ms", "user", "created_at")
    list_filter = ("kind", "status")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
