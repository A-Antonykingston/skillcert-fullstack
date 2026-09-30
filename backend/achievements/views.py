from rest_framework import viewsets, permissions
from accounts.permissions import IsStudent
from accounts.views import create_audit_log
from .models import Achievement
from .serializers import AchievementSerializer


class AchievementViewSet(viewsets.ModelViewSet):
    serializer_class = AchievementSerializer
    filterset_fields = ['category']
    search_fields = ['title', 'description', 'organization']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Achievement.objects.filter(student=user)
        student_id = self.request.query_params.get('student_id')
        if student_id:
            return Achievement.objects.filter(student_id=student_id)
        return Achievement.objects.select_related('student').all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStudent()]
    
    def perform_create(self, serializer):
        achievement = serializer.save(student=self.request.user)
        create_audit_log(self.request.user, 'CREATE', 'achievements',
                        f'Achievement added: {achievement.title}', self.request)
