"""
Certificate models with verification workflow.
"""
from django.db import models
from django.conf import settings
import uuid


class CertificateCategory(models.Model):
    """Certificate categories."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Certificate Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Certificate(models.Model):
    """Student certificates."""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    title = models.CharField(max_length=300)
    issuing_organization = models.CharField(max_length=300)
    certificate_id = models.CharField(max_length=100, blank=True)
    category = models.ForeignKey(CertificateCategory, on_delete=models.SET_NULL, null=True, blank=True)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)
    certificate_file = models.FileField(upload_to='certificates/', blank=True, null=True)
    description = models.TextField(blank=True)
    
    # Verification
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_certificates')
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    verification_comment = models.TextField(blank=True)
    
    # QR verification
    verification_code = models.CharField(max_length=50, unique=True, blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.student.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.verification_code:
            self.verification_code = f"CERT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)
