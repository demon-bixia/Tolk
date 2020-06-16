import os

from rest_framework import serializers

from accounts.serializers import ContactSerializer
from .models import Conversation, Message, Settings, Notification, Header, Attachment


class AttachmentsSerializer(serializers.ModelSerializer):
    conversation = serializers.IntegerField(write_only=True)
    message = serializers.PrimaryKeyRelatedField(required=False, queryset=Message.objects.all())
    file_name = serializers.CharField(max_length=200, required=False, read_only=True)

    class Meta:
        model = Attachment
        fields = "__all__"

    def validate_conversation(self, attrs):
        try:
            Conversation.objects.get(pk=self.initial_data['conversation'])
        except Conversation.DoesNotExist:
            raise serializers.ValidationError

    def create(self, validated_data):
        message = Message.objects.create(conversation_id=self.initial_data['conversation'],
                                         sender=self.context['contact'],
                                         is_file=True)
        attachment = Attachment.objects.create(file=validated_data['file'], message=message)
        attachment.file_name = os.path.basename(attachment.file.name)[21:len(os.path.basename(attachment.file.name))]
        attachment.save()
        return attachment


class MessageSerializer(serializers.ModelSerializer):
    sender = ContactSerializer()
    time_sent = serializers.TimeField(read_only=True, required=False, format="%I: %M %p", )
    attachments = AttachmentsSerializer(required=False, read_only=True, many=True)

    class Meta:
        model = Message
        fields = '__all__'

    def validate(self, attrs):
        if not attrs.get('sender') in attrs.get('conversation').participants.all():
            raise serializers.ValidationError('cannot send to a conversation that is not joined')

        return attrs


class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.CharField(source="get_last_message_content", default=None, read_only=True)
    last_message_date = serializers.DateField(source="get_last_message_date", default=None, read_only=True)
    header = serializers.ImageField(source='header.header', read_only=True, required=False)
    messages = MessageSerializer(many=True, required=False)

    class Meta:
        model = Conversation
        fields = ('id', 'name', 'type', 'header', 'participants', 'messages', 'last_message', 'last_message_date',
                  'history_mode',)
        extra_kwargs = {
            'participants': {'required': False},
            'messages': {'read_only': True, 'required': False},
            'history_mode': {'required': False},
        }

    def validate(self, attrs):
        if attrs.get('type') == 'couple' or self.instance.type == 'couple':

            if len(attrs.get('participants', [])) != 2:
                raise serializers.ValidationError('conversation of type couple should have two participants only')

            elif not attrs.get('participants', [])[0] in attrs.get('participants', [])[1].friends.all():
                raise serializers.ValidationError('you cant start a conversation with a non-friend contact')

        return attrs

    def create(self, validated_data):
        if validated_data.get('name', None):
            conversation = Conversation(name=validated_data.get('name'), type=validated_data.get('type'))
        else:
            conversation = Conversation(type=validated_data.get('type'))
        conversation.save()

        for participant in validated_data.get('participants'):
            conversation.participants.add(participant)

        return conversation

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.type = validated_data.get('type', instance.type)

        if validated_data.get('participants'):
            instance.participants.clear()

            for participant in validated_data.get('participants'):
                instance.participants.add(participant)

        instance.save()
        return instance


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = '__all__'


class CreateConversationSerializer(serializers.Serializer):
    contact_id = serializers.IntegerField(required=True)

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class CreateGroupSerializer(serializers.Serializer):
    group_name = serializers.CharField(max_length=30)
    group_header = serializers.ImageField(required=False)

    def create(self, validated_data):
        name = validated_data.get('group_name')
        header_image = validated_data.get('group_header')

        conversation = Conversation.objects.create(name=name, type='group')

        if header_image:
            header = Header.objects.create(conversation=conversation, header=header_image)
        else:
            header = Header.objects.create(conversation=conversation)

        return conversation

    def update(self, instance, validated_data):
        pass
