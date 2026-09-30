from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('available', views.CourseViewSet, basename='course')
router.register('enrolled', views.StudentCourseViewSet, basename='student-course')

urlpatterns = [path('', include(router.urls))]
