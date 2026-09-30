"""
Views for accounts app - Authentication and User Management.
"""
from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, AuditLog
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, AuditLogSerializer,
    AdminUserSerializer
)
from .permissions import IsAdmin, IsAdminOrFaculty


def get_client_ip(request):
    """Get client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def create_audit_log(user, action, module, description, request=None):
    """Create an audit log entry."""
    AuditLog.objects.create(
        user=user,
        action=action,
        module=module,
        description=description,
        ip_address=get_client_ip(request) if request else None
    )


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Create audit log
        create_audit_log(user, 'REGISTER', 'accounts', f'New user registered: {user.email}', request)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful!'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint."""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Create audit log
        create_audit_log(user, 'LOGIN', 'accounts', f'User logged in: {user.email}', request)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful!'
        })


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile."""
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        create_audit_log(request.user, 'UPDATE', 'accounts', 'Profile updated', request)
        return Response({
            'user': UserSerializer(request.user).data,
            'message': 'Profile updated successfully!'
        })


class ChangePasswordView(APIView):
    """Change user password."""
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Current password is incorrect.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        create_audit_log(request.user, 'CHANGE_PASSWORD', 'accounts', 'Password changed', request)
        
        return Response({'message': 'Password changed successfully!'})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """View audit logs (admin only)."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['action', 'module', 'user']
    search_fields = ['description', 'action', 'module']
    ordering_fields = ['timestamp']
    
    def get_queryset(self):
        return AuditLog.objects.select_related('user').all()


class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin management of users."""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering_fields = ['created_at', 'email']
    
    def get_queryset(self):
        return User.objects.all()
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        action_str = 'activated' if user.is_active else 'deactivated'
        create_audit_log(request.user, 'TOGGLE_USER', 'accounts', 
                        f'User {user.email} {action_str}', request)
        return Response({'message': f'User {action_str} successfully!',
                        'is_active': user.is_active})


class LogoutView(APIView):
    """Logout endpoint - blacklist refresh token."""
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        create_audit_log(request.user, 'LOGOUT', 'accounts', f'User logged out', request)
        return Response({'message': 'Logged out successfully!'})
