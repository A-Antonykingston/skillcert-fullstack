"""
Views for skills app.
"""
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from accounts.permissions import IsAdmin, IsStudent, IsAdminOrFaculty
from accounts.views import create_audit_log
from .models import SkillCategory, Skill, StudentSkill
from .serializers import SkillCategorySerializer, SkillSerializer, StudentSkillSerializer


class SkillCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = SkillCategorySerializer
    search_fields = ['name']
    
    def get_queryset(self):
        return SkillCategory.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    filterset_fields = ['category', 'is_active']
    search_fields = ['name']
    
    def get_queryset(self):
        return Skill.objects.select_related('category').all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]


class StudentSkillViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSkillSerializer
    filterset_fields = ['category', 'proficiency', 'is_verified']
    search_fields = ['skill_name']
    ordering_fields = ['proficiency_percentage', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return StudentSkill.objects.filter(student=user).select_related('category')
        elif user.role in ['admin', 'faculty']:
            student_id = self.request.query_params.get('student_id')
            if student_id:
                return StudentSkill.objects.filter(student_id=student_id).select_related('category')
            return StudentSkill.objects.select_related('category').all()
        return StudentSkill.objects.none()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStudent()]
    
    def perform_create(self, serializer):
        skill = serializer.save(student=self.request.user)
        create_audit_log(self.request.user, 'CREATE', 'skills',
                        f'Skill added: {skill.skill_name}', self.request)
    
    def perform_update(self, serializer):
        skill = serializer.save()
        create_audit_log(self.request.user, 'UPDATE', 'skills',
                        f'Skill updated: {skill.skill_name}', self.request)
    
    def perform_destroy(self, instance):
        create_audit_log(self.request.user, 'DELETE', 'skills',
                        f'Skill removed: {instance.skill_name}', self.request)
        instance.delete()
