"""
Certificate serializers.
"""
from rest_framework import serializers
from .models import Certificate, CertificateCategory


class CertificateCategorySerializer(serializers.ModelSerializer):
    certificate_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateCategory
        fields = '__all__'
    
    def get_certificate_count(self, obj):
        return obj.certificate_set.count()


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = ['id', 'student', 'status', 'verified_by', 'verified_at',
                          'rejection_reason', 'verification_comment', 'verification_code',
                          'qr_code', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_verified_by_name(self, obj):
        return obj.verified_by.get_full_name() if obj.verified_by else None


class CertificateVerifySerializer(serializers.Serializer):
    """Serializer for verifying a certificate."""
    comment = serializers.CharField(required=False, allow_blank=True)


class CertificateRejectSerializer(serializers.Serializer):
    """Serializer for rejecting a certificate."""
    reason = serializers.CharField(required=True)
    comment = serializers.CharField(required=False, allow_blank=True)


class PublicCertificateVerificationSerializer(serializers.ModelSerializer):
    """Public serializer for QR verification page."""
    student_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = ['title', 'issuing_organization', 'certificate_id', 'issue_date',
                  'verification_code', 'status', 'verified_at', 'student_name',
                  'verified_by_name']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
    
    def get_verified_by_name(self, obj):
        return obj.verified_by.get_full_name() if obj.verified_by else None
