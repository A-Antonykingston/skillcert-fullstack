"""
Analytics views for dashboard statistics.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from accounts.models import User
from students.models import StudentProfile, Department
from certificates.models import Certificate
from skills.models import StudentSkill, SkillCategory
from projects.models import Project
from internships.models import Internship
from accounts.permissions import IsAdmin, IsAdminOrFaculty, IsStudent
import datetime


class AdminDashboardAnalytics(APIView):
    """Statistics for admin dashboard."""
    permission_classes = [IsAdmin]
    
    def get(self, request):
        # Basic counts
        total_students = User.objects.filter(role='student').count()
        total_certificates = Certificate.objects.count()
        pending_verification = Certificate.objects.filter(status='pending').count()
        verified_certificates = Certificate.objects.filter(status='verified').count()
        rejected_certificates = Certificate.objects.filter(status='rejected').count()
        total_projects = Project.objects.count()
        total_internships = Internship.objects.count()
        total_skills_added = StudentSkill.objects.count()
        
        # Student department distribution
        department_stats = list(Department.objects.annotate(
            student_count=Count('students')
        ).values('name', 'student_count'))
        
        # Skill category distribution
        skill_stats = list(SkillCategory.objects.annotate(
            skill_count=Count('studentskill')
        ).values('name', 'skill_count'))
        
        # Certificates over last 6 months
        six_months_ago = datetime.date.today() - datetime.timedelta(days=180)
        cert_timeline = list(Certificate.objects.filter(created_at__gte=six_months_ago)
                             .annotate(month=TruncMonth('created_at'))
                             .values('month')
                             .annotate(count=Count('id'))
                             .order_by('month'))
        
        # Format dates for JSON
        for item in cert_timeline:
            if item['month']:
                item['month'] = item['month'].strftime('%Y-%m')
        
        return Response({
            'overview': {
                'total_students': total_students,
                'total_certificates': total_certificates,
                'pending_verification': pending_verification,
                'verified_certificates': verified_certificates,
                'rejected_certificates': rejected_certificates,
                'total_projects': total_projects,
                'total_internships': total_internships,
                'total_skills_added': total_skills_added,
            },
            'charts': {
                'department_distribution': department_stats,
                'skill_distribution': skill_stats,
                'certificate_timeline': cert_timeline,
            }
        })


class StudentCareerReadiness(APIView):
    """Calculate career readiness score for a student."""
    permission_classes = [IsStudent]
    
    def get(self, request):
        user = request.user
        
        # 1. Profile Completion (20%)
        try:
            profile = StudentProfile.objects.get(user=user)
            profile_score = profile.profile_completion
        except StudentProfile.DoesNotExist:
            profile_score = 0
            
        # 2. Skills (20%) - Target: 10 skills
        skills_count = StudentSkill.objects.filter(student=user).count()
        skills_score = min(100, (skills_count / 10) * 100)
        
        # 3. Certificates (20%) - Target: 3 verified certificates
        verified_certs = Certificate.objects.filter(student=user, status='verified').count()
        certs_score = min(100, (verified_certs / 3) * 100)
        
        # 4. Projects (20%) - Target: 3 projects
        projects_count = Project.objects.filter(student=user).count()
        projects_score = min(100, (projects_count / 3) * 100)
        
        # 5. Internships/Experience (20%) - Target: 1 internship
        internships_count = Internship.objects.filter(student=user).count()
        internships_score = min(100, (internships_count / 1) * 100)
        
        # Overall Readiness Score
        overall_score = (
            (profile_score * 0.20) +
            (skills_score * 0.20) +
            (certs_score * 0.20) +
            (projects_score * 0.20) +
            (internships_score * 0.20)
        )
        
        # Generate suggestions
        suggestions = []
        if profile_score < 80:
            suggestions.append("Complete your profile information including career objectives.")
        if skills_count < 5:
            suggestions.append("Add more technical and soft skills to your profile.")
        if verified_certs == 0:
            suggestions.append("Upload certificates and get them verified.")
        if projects_count < 2:
            suggestions.append("Add more academic or personal projects.")
        if internships_count == 0:
            suggestions.append("Add internship experience if you have any.")
            
        return Response({
            'overall_score': round(overall_score),
            'breakdown': {
                'profile': round(profile_score),
                'skills': round(skills_score),
                'certificates': round(certs_score),
                'projects': round(projects_score),
                'internships': round(internships_score),
            },
            'suggestions': suggestions
        })
