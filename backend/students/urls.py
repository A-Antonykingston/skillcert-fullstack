from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('departments', views.DepartmentViewSet, basename='department')
router.register('list', views.StudentListViewSet, basename='student-list')
router.register('announcements', views.AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('profile/', views.StudentProfileView.as_view(), name='student-profile'),
    path('portfolio/<slug:slug>/', views.PortfolioPublicView.as_view(), name='portfolio-public'),
    path('', include(router.urls)),
]
