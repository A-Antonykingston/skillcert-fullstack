from django.contrib import admin
from .models import Internship

@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ['company', 'role', 'student', 'start_date', 'end_date']
