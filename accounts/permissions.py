from rest_framework import permissions


class IsAuthenticatedOrCreateOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.user.is_authenticated:
            return True
        elif not request.user.is_authenticated and request.method == 'POST':
            return True
        else:
            return False
