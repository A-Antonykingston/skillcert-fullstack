from rest_framework import serializers
from .models import Course, StudentCourse

class CourseSerializer(serializers.ModelSerializer):
    enrollment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

class StudentCourseSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    course_detail = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = StudentCourse
        fields = '__all__'
        read_only_fields = ['id', 'student', 'created_at']
    
    def get_course_name(self, obj):
        return obj.course.name
