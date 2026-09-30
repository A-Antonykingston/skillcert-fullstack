from rest_framework import serializers
from .models import Achievement

class AchievementSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
