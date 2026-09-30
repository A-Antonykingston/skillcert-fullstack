"""
Notification models.
"""
from django.db import models
from django.conf import settings
import uuid


class Notification(models.Model):
    """User notifications."""
    
    class NotificationType(models.TextChoices):
        CERTIFICATE = 'certificate', 'Certificate'
        SKILL = 'skill', 'Skill'
        PROJECT = 'project', 'Project'
        INTERNSHIP = 'internship', 'Internship'
        ACHIEVEMENT = 'achievement', 'Achievement'
        COURSE = 'course', 'Course'
        SYSTEM = 'system', 'System'
        PROFILE = 'profile', 'Profile'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=300)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    related_id = models.CharField(max_length=100, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
