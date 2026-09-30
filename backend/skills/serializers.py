"""
Serializers for skills app.
"""
from rest_framework import serializers
from .models import SkillCategory, Skill, StudentSkill


class SkillCategorySerializer(serializers.ModelSerializer):
    skill_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SkillCategory
        fields = '__all__'
    
    def get_skill_count(self, obj):
        return obj.skills.count()


class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Skill
        fields = '__all__'
    
    def get_category_name(self, obj):
        return obj.category.name


class StudentSkillSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentSkill
        fields = '__all__'
        read_only_fields = ['id', 'student', 'is_verified', 'created_at', 'updated_at']
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
