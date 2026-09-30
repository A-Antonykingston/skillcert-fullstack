"""
Views for students app.
"""
from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from accounts.permissions import IsAdmin, IsAdminOrFaculty, IsStudent
from accounts.views import create_audit_log
from .models import Department, StudentProfile, FacultyProfile, Announcement
from .serializers import (
    DepartmentSerializer, StudentProfileSerializer, StudentProfileUpdateSerializer,
    FacultyProfileSerializer, AnnouncementSerializer, StudentListSerializer
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """CRUD operations for departments."""
    serializer_class = DepartmentSerializer
    filterset_fields = ['is_active']
    search_fields = ['name', 'code']
    
    def get_queryset(self):
        return Department.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]
    
    def perform_create(self, serializer):
        dept = serializer.save()
        create_audit_log(self.request.user, 'CREATE', 'departments',
                        f'Department created: {dept.name}', self.request)
    
    def perform_destroy(self, instance):
        create_audit_log(self.request.user, 'DELETE', 'departments',
                        f'Department deleted: {instance.name}', self.request)
        instance.delete()


class StudentProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current student's profile."""
    permission_classes = [IsStudent]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentProfileUpdateSerializer
        return StudentProfileSerializer
    
    def get_object(self):
        profile, created = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        create_audit_log(request.user, 'UPDATE', 'students', 'Student profile updated', request)
        profile = self.get_object()
        return Response({
            'profile': StudentProfileSerializer(profile).data,
            'message': 'Profile updated successfully!'
        })


class StudentListViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve student profiles (admin/faculty)."""
    serializer_class = StudentListSerializer
    permission_classes = [IsAdminOrFaculty]
    filterset_fields = ['department', 'year_of_study', 'batch_year']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'register_number']
    ordering_fields = ['created_at', 'user__first_name']
    
    def get_queryset(self):
        return StudentProfile.objects.select_related('user', 'department').all()
    
    @action(detail=True, methods=['get'])
    def full_profile(self, request, pk=None):
        """Get complete student profile with all related data."""
        profile = self.get_object()
        data = StudentProfileSerializer(profile).data
        
        # Include related data
        from skills.models import StudentSkill
        from certificates.models import Certificate
        from projects.models import Project
        from internships.models import Internship
        from achievements.models import Achievement
        from skills.serializers import StudentSkillSerializer
        from certificates.serializers import CertificateSerializer
        from projects.serializers import ProjectSerializer
        from internships.serializers import InternshipSerializer
        from achievements.serializers import AchievementSerializer
        
        data['skills'] = StudentSkillSerializer(
            StudentSkill.objects.filter(student=profile.user), many=True).data
        data['certificates'] = CertificateSerializer(
            Certificate.objects.filter(student=profile.user), many=True).data
        data['projects'] = ProjectSerializer(
            Project.objects.filter(student=profile.user), many=True).data
        data['internships'] = InternshipSerializer(
            Internship.objects.filter(student=profile.user), many=True).data
        data['achievements'] = AchievementSerializer(
            Achievement.objects.filter(student=profile.user), many=True).data
        
        return Response(data)


class AnnouncementViewSet(viewsets.ModelViewSet):
    """CRUD operations for announcements."""
    serializer_class = AnnouncementSerializer
    filterset_fields = ['category', 'is_active']
    search_fields = ['title', 'content']
    
    def get_queryset(self):
        user = self.request.user
        qs = Announcement.objects.select_related('author').all()
        if user.role == 'student':
            qs = qs.filter(is_active=True)
        return qs
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminOrFaculty()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PortfolioPublicView(APIView):
    """Public portfolio view - no authentication required."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, slug):
        profile = get_object_or_404(StudentProfile, portfolio_slug=slug, portfolio_public=True)
        data = StudentProfileSerializer(profile).data
        
        from skills.models import StudentSkill
        from certificates.models import Certificate
        from projects.models import Project
        from internships.models import Internship
        from achievements.models import Achievement
        from skills.serializers import StudentSkillSerializer
        from certificates.serializers import CertificateSerializer
        from projects.serializers import ProjectSerializer
        from internships.serializers import InternshipSerializer
        from achievements.serializers import AchievementSerializer
        
        data['skills'] = StudentSkillSerializer(
            StudentSkill.objects.filter(student=profile.user), many=True).data
        data['certificates'] = CertificateSerializer(
            Certificate.objects.filter(student=profile.user, status='verified'), many=True).data
        data['projects'] = ProjectSerializer(
            Project.objects.filter(student=profile.user), many=True).data
        data['internships'] = InternshipSerializer(
            Internship.objects.filter(student=profile.user), many=True).data
        data['achievements'] = AchievementSerializer(
            Achievement.objects.filter(student=profile.user), many=True).data
        
        # Remove sensitive info
        if 'user' in data:
            for field in ['id', 'is_active', 'date_of_birth', 'address']:
                data['user'].pop(field, None)
        
        return Response(data)
