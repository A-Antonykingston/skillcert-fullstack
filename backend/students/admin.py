from django.contrib import admin
from .models import Department, StudentProfile, FacultyProfile, Announcement

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active']

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'register_number', 'year_of_study']
    list_filter = ['department', 'year_of_study']

@admin.register(FacultyProfile)
class FacultyProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'designation']

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'is_active', 'created_at']
