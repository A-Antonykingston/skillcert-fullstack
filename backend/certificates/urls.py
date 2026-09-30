from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.CertificateCategoryViewSet, basename='cert-category')
router.register('', views.CertificateViewSet, basename='certificate')

urlpatterns = [
    path('verify/<str:code>/', views.PublicCertificateVerifyView.as_view(), name='public-verify'),
    path('', include(router.urls)),
]
