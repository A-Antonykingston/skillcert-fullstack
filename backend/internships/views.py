from rest_framework import viewsets, permissions
from accounts.permissions import IsStudent
from accounts.views import create_audit_log
from .models import Internship
from .serializers import InternshipSerializer


class InternshipViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipSerializer
    search_fields = ['company', 'role']
    ordering_fields = ['start_date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Internship.objects.filter(student=user)
        student_id = self.request.query_params.get('student_id')
        if student_id:
            return Internship.objects.filter(student_id=student_id)
        return Internship.objects.select_related('student').all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsStudent()]
    
    def perform_create(self, serializer):
        internship = serializer.save(student=self.request.user)
        create_audit_log(self.request.user, 'CREATE', 'internships',
                        f'Internship added: {internship.role} at {internship.company}', self.request)
