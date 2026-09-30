"""
Student profile and related models.
"""
from django.db import models
from django.conf import settings
import uuid


class Department(models.Model):
    """Academic department."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    head_of_department = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    """Extended student profile."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    register_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    course_name = models.CharField(max_length=200, blank=True)
    year_of_study = models.IntegerField(default=1, choices=[(i, f'Year {i}') for i in range(1, 6)])
    semester = models.IntegerField(default=1, choices=[(i, f'Semester {i}') for i in range(1, 11)])
    batch_year = models.IntegerField(null=True, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Career info
    career_objective = models.TextField(blank=True)
    career_interest = models.CharField(max_length=200, blank=True)
    preferred_job_role = models.CharField(max_length=200, blank=True)
    
    # Social links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    other_links = models.JSONField(default=list, blank=True)
    
    # Portfolio settings
    portfolio_slug = models.SlugField(max_length=100, unique=True, blank=True, null=True)
    portfolio_public = models.BooleanField(default=True)
    portfolio_theme = models.CharField(max_length=20, default='default')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.register_number or 'No Reg'}"
    
    @property
    def profile_completion(self):
        """Calculate profile completion percentage."""
        fields = [
            bool(self.user.first_name),
            bool(self.user.last_name),
            bool(self.user.phone),
            bool(self.user.avatar),
            bool(self.user.date_of_birth),
            bool(self.user.bio),
            bool(self.department),
            bool(self.register_number),
            bool(self.course_name),
            bool(self.career_objective),
            bool(self.career_interest),
            bool(self.linkedin_url or self.github_url),
        ]
        return int((sum(fields) / len(fields)) * 100)


class FacultyProfile(models.Model):
    """Extended faculty profile."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faculty_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='faculty')
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=200, blank=True)
    assigned_students = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='assigned_faculty')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.designation}"


class Announcement(models.Model):
    """System announcements."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, default='general', choices=[
        ('general', 'General'), ('academic', 'Academic'), ('event', 'Event'),
        ('placement', 'Placement'), ('urgent', 'Urgent')
    ])
    is_active = models.BooleanField(default=True)
    target_roles = models.JSONField(default=list)  # ['student', 'faculty']
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
