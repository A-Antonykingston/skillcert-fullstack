"""
Achievement models.
"""
from django.db import models
from django.conf import settings
import uuid


class Achievement(models.Model):
    """Student achievements."""
    
    class Category(models.TextChoices):
        ACADEMIC = 'academic', 'Academic'
        SPORTS = 'sports', 'Sports'
        CULTURAL = 'cultural', 'Cultural'
        TECHNICAL = 'technical', 'Technical'
        HACKATHON = 'hackathon', 'Hackathon'
        COMPETITION = 'competition', 'Competition'
        LEADERSHIP = 'leadership', 'Leadership'
        VOLUNTEER = 'volunteer', 'Volunteer'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.ACADEMIC)
    date = models.DateField()
    organization = models.CharField(max_length=300, blank=True)
    position = models.CharField(max_length=100, blank=True)  # e.g. "1st Place", "Winner"
    certificate_file = models.FileField(upload_to='achievement_certs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return self.title
