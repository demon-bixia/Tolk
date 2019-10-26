from rest_framework import serializers

from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = Contact
        fields = ('first_name', 'last_name', 'location',
                  'contact_pic', 'user')
