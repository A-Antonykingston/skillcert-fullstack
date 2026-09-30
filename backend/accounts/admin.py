from django.contrib import admin
from .models import User, AuditLog

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'gender']
    search_fields = ['email', 'first_name', 'last_name']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'module', 'timestamp']
    list_filter = ['action', 'module']
    search_fields = ['description']
