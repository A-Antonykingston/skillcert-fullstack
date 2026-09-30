"""
Serializers for students app.
"""
from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Department, StudentProfile, FacultyProfile, Announcement


class DepartmentSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = '__all__'
    
    def get_student_count(self, obj):
        return obj.students.count()


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_name = serializers.SerializerMethodField()
    profile_completion = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating student profile."""
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)
    date_of_birth = serializers.DateField(write_only=True, required=False)
    gender = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)
    bio = serializers.CharField(write_only=True, required=False)
    avatar = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = StudentProfile
        fields = [
            'department', 'register_number', 'course_name', 'year_of_study',
            'semester', 'batch_year', 'cgpa', 'career_objective', 'career_interest',
            'preferred_job_role', 'linkedin_url', 'github_url', 'portfolio_url',
            'other_links', 'portfolio_slug', 'portfolio_public', 'portfolio_theme',
            # User fields
            'first_name', 'last_name', 'phone', 'date_of_birth', 'gender',
            'address', 'bio', 'avatar',
        ]
    
    def update(self, instance, validated_data):
        # Extract user fields
        user_fields = {}
        for field in ['first_name', 'last_name', 'phone', 'date_of_birth', 'gender', 'address', 'bio', 'avatar']:
            if field in validated_data:
                user_fields[field] = validated_data.pop(field)
        
        # Update user
        if user_fields:
            user = instance.user
            for key, value in user_fields.items():
                setattr(user, key, value)
            user.save()
        
        # Update profile
        return super().update(instance, validated_data)


class FacultyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = FacultyProfile
        fields = '__all__'
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['id', 'author', 'created_at']
    
    def get_author_name(self, obj):
        return obj.author.get_full_name()


class StudentListSerializer(serializers.ModelSerializer):
    """Simplified student serializer for lists."""
    user = UserSerializer(read_only=True)
    department_name = serializers.SerializerMethodField()
    profile_completion = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'department_name', 'register_number', 'course_name',
                  'year_of_study', 'batch_year', 'profile_completion', 'created_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None
