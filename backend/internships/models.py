"""
Internship models.
"""
from django.db import models
from django.conf import settings
import uuid


class Internship(models.Model):
    """Student internship experience."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='internships')
    company = models.CharField(max_length=300)
    role = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    technologies = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    location = models.CharField(max_length=200, blank=True)
    stipend = models.CharField(max_length=100, blank=True)
    certificate_file = models.FileField(upload_to='internship_certs/', blank=True, null=True)
    experience_letter = models.FileField(upload_to='experience_letters/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.role} at {self.company}"
