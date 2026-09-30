"""
Command to create sample data for the Student Skill & Certificate Management System.
"""
from django.core.management.base import BaseCommand
from accounts.models import User
from students.models import Department, StudentProfile, FacultyProfile
from skills.models import SkillCategory, Skill, StudentSkill
from certificates.models import CertificateCategory, Certificate
from projects.models import Project
import datetime
from django.utils import timezone


class Command(BaseCommand):
    help = 'Creates initial demo data and accounts'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating demo data...')
        
        # 1. Create Users
        admin, created = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'username': 'admin',
                'first_name': 'System',
                'last_name': 'Admin',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write('Created admin account')
            
        faculty, created = User.objects.get_or_create(
            email='faculty@example.com',
            defaults={
                'username': 'faculty',
                'first_name': 'John',
                'last_name': 'Professor',
                'role': 'faculty'
            }
        )
        if created:
            faculty.set_password('faculty123')
            faculty.save()
            self.stdout.write('Created faculty account')
            
        student, created = User.objects.get_or_create(
            email='student@example.com',
            defaults={
                'username': 'student',
                'first_name': 'Alice',
                'last_name': 'Student',
                'role': 'student',
                'bio': 'Final year CS student passionate about web development and AI.'
            }
        )
        if created:
            student.set_password('student123')
            student.save()
            self.stdout.write('Created student account')

        # 2. Create Departments
        depts = [
            ('Computer Science', 'CSE'),
            ('Information Technology', 'IT'),
            ('Artificial Intelligence', 'AI'),
            ('Electronics', 'ECE')
        ]
        dept_objs = {}
        for name, code in depts:
            dept, _ = Department.objects.get_or_create(name=name, defaults={'code': code})
            dept_objs[code] = dept

        # 3. Create Profiles
        if created: # if student was created
            StudentProfile.objects.create(
                user=student,
                department=dept_objs['CSE'],
                register_number='REG2023001',
                course_name='B.Tech',
                year_of_study=4,
                career_interest='Software Development'
            )
            
            FacultyProfile.objects.create(
                user=faculty,
                department=dept_objs['CSE'],
                designation='Associate Professor'
            )

        # 4. Create Skill Categories & Skills
        tech_cat, _ = SkillCategory.objects.get_or_create(name='Technical Skills')
        soft_cat, _ = SkillCategory.objects.get_or_create(name='Soft Skills')
        
        skills = [
            (tech_cat, 'Python'), (tech_cat, 'Django'), (tech_cat, 'React'), 
            (tech_cat, 'JavaScript'), (tech_cat, 'SQL'),
            (soft_cat, 'Communication'), (soft_cat, 'Leadership'), (soft_cat, 'Teamwork')
        ]
        
        skill_objs = {}
        for cat, name in skills:
            s, _ = Skill.objects.get_or_create(category=cat, name=name)
            skill_objs[name] = s
            
        # Add skills to student
        if created:
            StudentSkill.objects.create(
                student=student, skill_name='Python', category=tech_cat,
                proficiency='advanced', proficiency_percentage=85
            )
            StudentSkill.objects.create(
                student=student, skill_name='React', category=tech_cat,
                proficiency='intermediate', proficiency_percentage=70
            )

        # 5. Create Certificate Categories & Certificates
        cert_cat, _ = CertificateCategory.objects.get_or_create(name='Online Course')
        
        if created:
            Certificate.objects.create(
                student=student,
                title='Python for Data Science',
                issuing_organization='Coursera',
                category=cert_cat,
                issue_date=timezone.now().date() - datetime.timedelta(days=30),
                status='pending'
            )
            
            # A verified certificate
            cert = Certificate.objects.create(
                student=student,
                title='React Advanced Concepts',
                issuing_organization='Udemy',
                category=cert_cat,
                issue_date=timezone.now().date() - datetime.timedelta(days=90),
                status='verified',
                verified_by=faculty,
                verified_at=timezone.now()
            )
            
            # Project
            Project.objects.create(
                student=student,
                title='Student Management System',
                description='A full stack application built with Django and React.',
                category='academic',
                technologies=['Django', 'React', 'MySQL']
            )

        self.stdout.write(self.style.SUCCESS('Successfully created demo data!'))
        self.stdout.write('Credentials:')
        self.stdout.write('Admin: admin@example.com / admin123')
        self.stdout.write('Faculty: faculty@example.com / faculty123')
        self.stdout.write('Student: student@example.com / student123')
