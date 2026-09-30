from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from accounts.permissions import IsAdmin, IsStudent
from .models import Course, StudentCourse
from .serializers import CourseSerializer, StudentCourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    filterset_fields = ['category', 'difficulty', 'is_active']
    search_fields = ['name', 'description', 'provider']
    
    def get_queryset(self):
        return Course.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]


class StudentCourseViewSet(viewsets.ModelViewSet):
    serializer_class = StudentCourseSerializer
    filterset_fields = ['status']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return StudentCourse.objects.filter(student=user).select_related('course')
        return StudentCourse.objects.select_related('student', 'course').all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStudent()]
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
