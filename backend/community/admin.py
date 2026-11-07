from django.contrib import admin

from .models import ReportComment


@admin.register(ReportComment)
class ReportCommentAdmin(admin.ModelAdmin):
    list_display = ("report_code", "author_email", "created_at", "is_hidden")
    list_filter = ("is_hidden",)
    actions = ["hide", "unhide"]

    @admin.display(description="Report")
    def report_code(self, obj):
        return obj.report.code

    @admin.display(description="Author")
    def author_email(self, obj):
        return obj.author.email

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("report", "author")

    @admin.action(description="Sembunyikan")
    def hide(self, request, queryset):
        queryset.update(is_hidden=True)

    @admin.action(description="Tampilkan")
    def unhide(self, request, queryset):
        queryset.update(is_hidden=False)
