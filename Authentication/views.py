from django.contrib.auth import get_user_model
from django.contrib.auth import logout, authenticate, login
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import UserSerializer
from .serializers import LoginUserSerializer

User = get_user_model()


class UserAuthenticated(APIView):
    serializer_class = UserSerializer

    def get(self, request, format=None):
        """
        :param request:
        :param format:
        :return request.user.is_authenticated:
        """
        if request.user.is_authenticated:
            serializer = self.serializer_class(instance=request.user)
            return Response({'success': True, 'is_authenticated': True, 'authenticated_user': serializer.data})
        else:
            return Response({'success': True, 'is_authenticated': False})


class AuthViewSet(viewsets.GenericViewSet):
    serializer_class = LoginUserSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        logs user in
        :param request:
        :returns http 200 ok:
        :returns http 400 bad request:
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # user login serializer to validate fields
            data = serializer.data
            # authenticate user
            authenticated = self.authenticate(request, username=data.get('email'), password=data.get('password'))
            # check if authenticated
            if authenticated:
                # 200 accepted
                return Response({'success': True, 'errors': serializer.errors}, status=status.HTTP_202_ACCEPTED)
            else:
                try:
                    User.objects.get(email=data.get('email'))

                    return Response({"success": False, "errors": {"password": ["invalid password"]}},
                                    status=status.HTTP_400_BAD_REQUEST)

                except User.DoesNotExist:
                    # 400 bad request with custom error messages
                    return Response({"success": False, "errors": {"email": ["invalid email"]}},
                                    status=status.HTTP_400_BAD_REQUEST)
        else:
            # 400 bad request with serializer error messages
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post', 'get'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        logs user out
        :param request:
        :return http 200 ok:
        """
        logout(request)
        return Response({"success": True, "errors": None}, status=status.HTTP_200_OK)

    def authenticate(self, request, username, password):
        """
        runs credentials against auth backends and logs user in
        :param request:
        :param username:
        :param password:
        :return user:
        """
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return user
        else:
            return None


# split view sets into separate views
login_view = AuthViewSet.as_view({'post': 'login'})
logout_view = AuthViewSet.as_view({'post': 'logout', 'get': 'logout'})
