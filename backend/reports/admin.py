from django.contrib import admin

from tracking.models import ReportStatusHistory

from .models import Category, Report, ReportImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("slug", "name", "is_active")
    list_editable = ("name", "is_active")


class ReportImageInline(admin.TabularInline):
    model = ReportImage
    extra = 0


class HistoryInline(admin.TabularInline):
    model = ReportStatusHistory
    extra = 0
    can_delete = False
    readonly_fields = ("from_status", "to_status", "note", "changed_by", "created_at")

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("code", "category", "status", "regency", "is_hidden", "created_at")
    list_filter = ("status", "category", "regency", "is_hidden")
    inlines = [ReportImageInline, HistoryInline]
    actions = ["hide", "unhide"]

    @admin.action(description="Sembunyikan")
    def hide(self, request, queryset):
        queryset.update(is_hidden=True)

    @admin.action(description="Tampilkan")
    def unhide(self, request, queryset):
        queryset.update(is_hidden=False)
