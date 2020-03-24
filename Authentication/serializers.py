from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class LoginUserSerializer(serializers.Serializer):
    """
    used to serialize authentication request credentials
    """
    email = serializers.EmailField(max_length=255, required=True)
    password = serializers.CharField(max_length=80, required=True,
                                     style={'input_type': 'password', 'placeholder': 'Password'})

    extra_kwargs = {
        "password": {'min_length': 8}
    }
