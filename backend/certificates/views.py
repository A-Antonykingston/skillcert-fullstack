"""
Certificate views with verification workflow and QR code generation.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
import qrcode
import io
import os
from django.core.files.base import ContentFile
from django.conf import settings
from accounts.permissions import IsAdmin, IsStudent, IsAdminOrFaculty
from accounts.views import create_audit_log
from .models import Certificate, CertificateCategory
from .serializers import (
    CertificateSerializer, CertificateCategorySerializer,
    CertificateVerifySerializer, CertificateRejectSerializer,
    PublicCertificateVerificationSerializer
)


class CertificateCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateCategorySerializer
    search_fields = ['name']
    
    def get_queryset(self):
        return CertificateCategory.objects.all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]


class CertificateViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateSerializer
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'issuing_organization', 'certificate_id']
    ordering_fields = ['created_at', 'issue_date', 'status']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Certificate.objects.filter(student=user).select_related('category', 'verified_by')
        return Certificate.objects.select_related('student', 'category', 'verified_by').all()
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action in ['verify', 'reject']:
            return [IsAdminOrFaculty()]
        return [IsStudent()]
    
    def perform_create(self, serializer):
        cert = serializer.save(student=self.request.user)
        create_audit_log(self.request.user, 'UPLOAD', 'certificates',
                        f'Certificate uploaded: {cert.title}', self.request)
        
        # Create notification for admin
        from notifications.models import Notification
        from accounts.models import User
        admins = User.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title='New Certificate Uploaded',
                message=f'{self.request.user.get_full_name()} uploaded a certificate: {cert.title}',
                notification_type='certificate',
                related_id=str(cert.id)
            )
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a certificate."""
        cert = self.get_object()
        serializer = CertificateVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cert.status = Certificate.Status.VERIFIED
        cert.verified_by = request.user
        cert.verified_at = timezone.now()
        cert.verification_comment = serializer.validated_data.get('comment', '')
        
        # Generate QR code
        qr_data = f"{settings.FRONTEND_URL}/verify/{cert.verification_code}"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = io.BytesIO()
        qr_img.save(buffer, format='PNG')
        buffer.seek(0)
        
        filename = f"qr_{cert.verification_code}.png"
        cert.qr_code.save(filename, ContentFile(buffer.read()), save=False)
        cert.save()
        
        # Notify student
        from notifications.models import Notification
        Notification.objects.create(
            user=cert.student,
            title='Certificate Verified! ✓',
            message=f'Your certificate "{cert.title}" has been verified.',
            notification_type='certificate',
            related_id=str(cert.id)
        )
        
        create_audit_log(request.user, 'VERIFY', 'certificates',
                        f'Certificate verified: {cert.title} for {cert.student.get_full_name()}',
                        request)
        
        return Response({
            'message': 'Certificate verified successfully!',
            'certificate': CertificateSerializer(cert).data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a certificate."""
        cert = self.get_object()
        serializer = CertificateRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cert.status = Certificate.Status.REJECTED
        cert.verified_by = request.user
        cert.verified_at = timezone.now()
        cert.rejection_reason = serializer.validated_data['reason']
        cert.verification_comment = serializer.validated_data.get('comment', '')
        cert.save()
        
        # Notify student
        from notifications.models import Notification
        Notification.objects.create(
            user=cert.student,
            title='Certificate Rejected',
            message=f'Your certificate "{cert.title}" was rejected. Reason: {cert.rejection_reason}',
            notification_type='certificate',
            related_id=str(cert.id)
        )
        
        create_audit_log(request.user, 'REJECT', 'certificates',
                        f'Certificate rejected: {cert.title}', request)
        
        return Response({
            'message': 'Certificate rejected.',
            'certificate': CertificateSerializer(cert).data
        })


class PublicCertificateVerifyView(APIView):
    """Public endpoint for QR code certificate verification."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, code):
        cert = get_object_or_404(Certificate, verification_code=code)
        serializer = PublicCertificateVerificationSerializer(cert)
        return Response({
            'valid': cert.status == 'verified',
            'certificate': serializer.data
        })
