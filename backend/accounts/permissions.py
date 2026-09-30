"""
Permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    """Allow access only to students."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsFaculty(BasePermission):
    """Allow access only to faculty."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'faculty'


class IsAdmin(BasePermission):
    """Allow access only to admins."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrFaculty(BasePermission):
    """Allow access to admins and faculty."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'faculty']


class IsOwnerOrAdmin(BasePermission):
    """Allow access to the owner of the object or admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'student'):
            return obj.student == request.user
        return False
