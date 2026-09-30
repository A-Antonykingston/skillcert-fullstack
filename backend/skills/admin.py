from django.contrib import admin
from .models import SkillCategory, Skill, StudentSkill

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active']
    list_filter = ['category', 'is_active']

@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ['student', 'skill_name', 'proficiency', 'proficiency_percentage', 'is_verified']
    list_filter = ['proficiency', 'is_verified']
