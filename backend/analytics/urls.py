from django.urls import path
from . import views

urlpatterns = [
    path('admin-dashboard/', views.AdminDashboardAnalytics.as_view(), name='admin-dashboard'),
    path('career-readiness/', views.StudentCareerReadiness.as_view(), name='career-readiness'),
]
