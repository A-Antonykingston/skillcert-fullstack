from rest_framework import viewsets, permissions
from accounts.permissions import IsStudent
from accounts.views import create_audit_log
from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    filterset_fields = ['category']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Project.objects.filter(student=user)
        student_id = self.request.query_params.get('student_id')
        if student_id:
            return Project.objects.filter(student_id=student_id)
        return Project.objects.select_related('student').all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStudent()]
    
    def perform_create(self, serializer):
        project = serializer.save(student=self.request.user)
        create_audit_log(self.request.user, 'CREATE', 'projects',
                        f'Project added: {project.title}', self.request)
    
    def perform_destroy(self, instance):
        create_audit_log(self.request.user, 'DELETE', 'projects',
                        f'Project deleted: {instance.title}', self.request)
        instance.delete()
