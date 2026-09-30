from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.SkillCategoryViewSet, basename='skill-category')
router.register('master', views.SkillViewSet, basename='skill')
router.register('student', views.StudentSkillViewSet, basename='student-skill')

urlpatterns = [
    path('', include(router.urls)),
]
