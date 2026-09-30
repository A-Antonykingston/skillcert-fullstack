from django.contrib import admin
from .models import Course, StudentCourse

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'difficulty', 'provider', 'is_active']

@admin.register(StudentCourse)
class StudentCourseAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'progress']
