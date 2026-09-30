"""
Skills models.
"""
from django.db import models
from django.conf import settings
import uuid


class SkillCategory(models.Model):
    """Skill category."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Skill Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Skill(models.Model):
    """Master skill list."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['name', 'category']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.category.name})"


class StudentSkill(models.Model):
    """Student's skill with proficiency."""
    
    class Proficiency(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'
        EXPERT = 'expert', 'Expert'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_skills')
    skill_name = models.CharField(max_length=200)
    category = models.ForeignKey(SkillCategory, on_delete=models.SET_NULL, null=True, blank=True)
    proficiency = models.CharField(max_length=20, choices=Proficiency.choices, default=Proficiency.BEGINNER)
    proficiency_percentage = models.IntegerField(default=25)
    experience_months = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'skill_name']
        ordering = ['-proficiency_percentage']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.skill_name}"
