import os
import django
import sys

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from students.models import Department
from certificates.models import CertificateCategory
from skills.models import SkillCategory, Skill

def seed():
    print("Seeding database...")
    
    # 1. Departments
    depts = [
        {'name': 'Computer Science and Engineering', 'code': 'CSE'},
        {'name': 'Information Technology', 'code': 'IT'},
        {'name': 'Electronics and Communication', 'code': 'ECE'},
        {'name': 'Mechanical Engineering', 'code': 'MECH'},
        {'name': 'Civil Engineering', 'code': 'CIVIL'},
        {'name': 'Artificial Intelligence and Data Science', 'code': 'AIDS'},
    ]
    for d in depts:
        Department.objects.get_or_create(code=d['code'], defaults={'name': d['name']})
        
    print("Departments seeded.")
    
    # 2. Certificate Categories
    cert_cats = [
        {'name': 'Course Completion', 'description': 'Online or offline courses'},
        {'name': 'Workshop', 'description': 'Participation in workshops'},
        {'name': 'Hackathon', 'description': 'Hackathon participation or wins'},
        {'name': 'Internship', 'description': 'Internship completion certificates'},
        {'name': 'Achievement', 'description': 'Special achievements and awards'},
    ]
    for c in cert_cats:
        CertificateCategory.objects.get_or_create(name=c['name'], defaults={'description': c['description']})
        
    print("Certificate Categories seeded.")
    
    # 3. Skill Categories and Skills
    skill_data = {
        'Programming Languages': ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Ruby'],
        'Web Development': ['React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring Boot', 'Express'],
        'Data Science & AI': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-Learn'],
        'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform'],
        'Database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Oracle'],
        'Soft Skills': ['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Time Management', 'Public Speaking'],
        'Core Engineering': ['Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks', 'Database Management Systems']
    }
    
    for cat_name, skills in skill_data.items():
        cat, _ = SkillCategory.objects.get_or_create(name=cat_name)
        for skill_name in skills:
            Skill.objects.get_or_create(name=skill_name, category=cat)
            
    print("Skills seeded.")
    
    # 4. Create an admin user if not exists
    if not User.objects.filter(email='admin@example.com').exists():
        admin = User.objects.create_superuser('admin@example.com', 'adminpass')
        admin.first_name = 'System'
        admin.last_name = 'Admin'
        admin.save()
        print("Admin user created: admin@example.com / adminpass")
        
    # 5. Create demo users (Student and Faculty)
    if not User.objects.filter(email='student@example.com').exists():
        student = User.objects.create_user('student@example.com', 'studentpass', role='student')
        student.first_name = 'Demo'
        student.last_name = 'Student'
        student.save()
        print("Demo Student created: student@example.com / studentpass")
        
    if not User.objects.filter(email='faculty@example.com').exists():
        faculty = User.objects.create_user('faculty@example.com', 'facultypass', role='faculty')
        faculty.first_name = 'Demo'
        faculty.last_name = 'Faculty'
        faculty.save()
        print("Demo Faculty created: faculty@example.com / facultypass")

if __name__ == '__main__':
    seed()
    print("Database seeding completed successfully.")
