from django.contrib import admin
from .models import Certificate, CertificateCategory

@admin.register(CertificateCategory)
class CertificateCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['title', 'student', 'status', 'issuing_organization', 'issue_date', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'issuing_organization']
