from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class SigapUserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = ("email", "full_name", "role", "is_active", "date_joined")
    list_filter = ("role", "is_active")
    list_editable = ("role",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("full_name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "full_name", "role", "password1", "password2")}),)
    search_fields = ("email", "full_name")

    def save_model(self, request, obj, form, change):
        if not obj.is_superuser:
            obj.is_staff = obj.role == User.Role.ADMIN
        super().save_model(request, obj, form, change)
