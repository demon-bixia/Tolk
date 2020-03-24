from rest_framework import serializers

from .models import Contact, User


class AddFriendSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)


class ContactSerializer(serializers.ModelSerializer):
    """
    used to serializer contact model
    """
    private_mode = serializers.BooleanField(source='settings.private_mode', required=False, read_only=True)

    class Meta:
        model = Contact
        fields = ('id', 'first_name', 'last_name', 'location',
                  'contact_pic', 'user', 'conversations', 'friends', 'settings', 'private_mode')
        extra_kwargs = {
            'location': {'required': True},
            'contact_pic': {'required': False},
            'conversations': {'required': False, 'read_only': True},
            'friends': {'required': False},
            'settings': {'required': False, 'read_only': True},
            'user': {'required': False},
        }

    def validate(self, attrs):
        if self.instance in attrs.get('friends', []):
            raise serializers.ValidationError('you cannot befriend yourself')
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    used to serialize user model
    """

    class Meta:
        model = User
        fields = ('id', 'email', 'date_joined', 'is_active', 'password', 'contact')
        extra_kwargs = {
            "password": {"write_only": True, "min_length": 7},
            "date_joined": {"read_only": True, "required": False},
            "is_active": {"read_only": True, "required": False},
            "contact": {"required": False},
        }
