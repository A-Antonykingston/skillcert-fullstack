"""
Project models.
"""
from django.db import models
from django.conf import settings
import uuid


class Project(models.Model):
    """Student projects."""
    
    class Category(models.TextChoices):
        ACADEMIC = 'academic', 'Academic'
        PERSONAL = 'personal', 'Personal'
        OPEN_SOURCE = 'open_source', 'Open Source'
        FREELANCE = 'freelance', 'Freelance'
        HACKATHON = 'hackathon', 'Hackathon'
        RESEARCH = 'research', 'Research'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.ACADEMIC)
    technologies = models.JSONField(default=list)  # List of tech used
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    project_image = models.ImageField(upload_to='projects/', blank=True, null=True)
    team_members = models.JSONField(default=list)  # List of team member names
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
