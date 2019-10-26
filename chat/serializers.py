from rest_framework import serializers

from accounts.serializers import ContactSerializer
from .models import Conversation, Message, Settings, Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('contact', 'content', 'type')


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.EmailField(source="sender.user.email", read_only=True)
    time_sent = serializers.TimeField(source="get_time_sent", read_only=True)
    conversation = serializers.CharField(source="conversation.name", read_only=True)

    class Meta:
        model = Message
        fields = ('content', 'sender', 'conversation',
                  'sent', 'date_sent', 'time_sent')


class ConversationSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True, read_only=True)
    message_set = MessageSerializer(many=True, read_only=False)
    last_message_content = serializers.CharField(source="get_last_message_content", default=None)
    last_message_date = serializers.DateField(source="get_last_message_date", default=None)

    class Meta:
        model = Conversation
        fields = ('type', 'name', 'contacts',
                  'last_message_content', 'last_message_date', 'message_set')


class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = "__all__"
