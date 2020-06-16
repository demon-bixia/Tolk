import datetime
import re

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.mixins import CreateModelMixin, DestroyModelMixin, RetrieveModelMixin, ListModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, GenericViewSet

from accounts.models import Contact
from accounts.serializers import ContactSerializer
from chat.utils import add_notification
from .exceptions import ConversationError
from .models import Conversation, Message, Notification, Settings
from .serializers import ConversationSerializer, MessageSerializer, NotificationSerializer, SettingsSerializer, \
    CreateGroupSerializer, AttachmentsSerializer


@api_view(['GET', 'HEAD'])
def api_root(request, format=None):
    if request.user.is_authenticated:
        return Response({
            'users': reverse('user-list', request=request, format=format),
            'contacts': reverse('contact-list', request=request, format=format),
            'conversations': reverse('conversation-list', request=request, format=format),
            'messages': reverse('message-list', request=request, format=format),
            'notifications': reverse('notification-list', request=request, format=format),
            'settings': reverse('settings-list', request=request, format=format),
            'authenticated': reverse('is-authenticated', request=request, format=format),
            'send-attachments': reverse('send-attachments', request=request, format=format),
            'logout': reverse('logout', request=request, format=format),
        })
    else:
        return Response({
            'login': reverse('login', request=request, format=format),
            'authenticated': reverse('is-authenticated', request=request, format=format),
        })


class CreateGroup(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateGroupSerializer(data=request.data)

        if serializer.is_valid():
            conversation = serializer.save()
            participants = self.get_participants(request=request)

            if request.user.contact.settings.private_mode:
                return Response(
                    {'success': False, 'errors': {'non_field_errors': ['you cannot create groups in private mode']}})

            if participants:
                conversation.participants.add(request.user.contact)

                for participant in participants:
                    contact = get_object_or_404(Contact, pk=participant)

                    if not contact.settings.private_mode:
                        conversation.participants.add(contact)
                    else:
                        return Response(
                            {'success': False, 'errors': {'non_field_errors': ['contact in private mode is added']}},
                            status=status.HTTP_400_BAD_REQUEST)

                conversation_serializer = ConversationSerializer(instance=conversation)

                creator_notification = {'type': 'chat', 'content': 'your new group has been created'}
                add_notification(creator_notification, request.user)

                p_content = f'{request.user.email} added you to a new group'
                participants_notification = {'type': 'chat',
                                             'content': p_content}

                for participant in conversation.participants.all():
                    if participant.user.id != request.user.id:
                        add_notification(participants_notification, participant.user)

                return Response({'success': True, 'conversation': conversation_serializer.data},
                                status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'success': False, 'errors': {'non_field_errors': ['group must at least have one participants']}},
                    status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'success': False, 'errors': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

    def get_participants(self, request):
        participants = list()
        pattern = r'\d+'

        for key, value in request.data.items():
            if 'contact_' in key and value == 'on':
                participants.append(re.search(pattern, key).group())

        return participants


class ConversationsViewSet(ModelViewSet):
    model = Conversation
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        contact = self.request.user.contact
        queryset = Conversation.objects.filter(participants=contact)
        return queryset

    def create(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            conversation = self.perform_create(serializer)
        except ConversationError as e:
            return Response({'success': False, 'error': e.code}, status=status.HTTP_400_BAD_REQUEST)

        if conversation:
            serialized_conversation = serializer.data
            contacts_serializer = ContactSerializer(instance=conversation.participants, many=True)
            serialized_conversation['participants'] = contacts_serializer.data

            headers = self.get_success_headers(serializer.data)

            contact_serializer = ContactSerializer(instance=request.user.contact)

            return Response(
                {
                    'success': True, 'conversation': serialized_conversation,
                    "authenticated_contact": contact_serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers)
        else:
            return Response({
                'success': False,
                'errors': {'non_field_errors': ['you cannot start a conversation with a non-friend contact ']},
            },
                status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        # check if conversation is started with a non friend contact
        for participant in serializer.validated_data['participants']:
            if participant.id is not self.request.user.contact.id:
                if self.request.user.contact not in participant.friends.all():
                    raise ConversationError('Cannot create a conversation with a non friend contact')

        # couple conversation validations
        if serializer.validated_data['type'] == 'couple':
            other_participant = None

            # get the other participant in the couple conversation
            for participant in serializer.validated_data['participants']:
                if participant.id is not self.request.user.contact.id:
                    other_participant = participant

            # check if conversation already exists
            for conversation in self.request.user.contact.conversations.all():
                if conversation.type == 'couple' and other_participant in conversation.participants.all():
                    raise ConversationError('conversation already exists')

        return serializer.save()

    def update(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().update(request, *args, **kwargs)
        return Response({'success': True, 'conversation': response.data}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().destroy(request, *args, **kwargs)
        return Response({'success': True}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().retrieve(request, *args, **kwargs)

        conversation = response.data

        contacts = Contact.objects.filter(conversations__id=conversation['id'])
        serializer = ContactSerializer(contacts, many=True)
        conversation['participants'] = serializer.data

        return Response({'success': True, "conversation": conversation}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().list(request, *args, **kwargs)

        conversations = response.data

        for conversation in conversations:
            contacts = Contact.objects.filter(conversations__id=conversation['id'])
            serializer = ContactSerializer(contacts, many=True)
            conversation['participants'] = serializer.data

        return Response({'success': True, 'conversations': conversations}, status=status.HTTP_200_OK)


class MessageViewSet(ListModelMixin,
                     RetrieveModelMixin,
                     CreateModelMixin,
                     DestroyModelMixin,
                     GenericViewSet):
    model = Message
    serializer_class = MessageSerializer
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        contact = self.request.user.contact
        queryset = Message.objects.filter(conversation__in=contact.conversations.all())
        return queryset

    def create(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().create(request, *args, **kwargs)
        return Response({'success': True, 'message': response.data}, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().destroy(request, *args, **kwargs)
        return Response({'success': True}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().retrieve(request, *args, **kwargs)
        return Response({'success': True, "message": response.data}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().list(request, *args, **kwargs)
        return Response({'success': True, 'messages': response.data}, status=status.HTTP_200_OK)


class NotificationViewSet(ListModelMixin,
                          RetrieveModelMixin,
                          CreateModelMixin,
                          DestroyModelMixin,
                          GenericViewSet):
    model = Notification
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(contact=self.request.user.contact)
        return queryset

    def create(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().create(request, *args, **kwargs)
        return Response({'success': True, 'notification': response.data}, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().destroy(request, *args, **kwargs)
        return Response({'success': True}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().retrieve(request, *args, **kwargs)
        return Response({'success': True, "notification": response.data}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().list(request, *args, **kwargs)
        return Response({'success': True, 'notifications': response.data}, status=status.HTTP_200_OK)


class SettingsViewSet(ModelViewSet):
    model = Settings
    serializer_class = SettingsSerializer
    queryset = Settings.objects.all()
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().create(request, *args, **kwargs)
        return Response({'success': True, 'settings': response.data}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().update(request, *args, **kwargs)
        return Response({'success': True, 'settings': response.data}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().destroy(request, *args, **kwargs)
        return Response({'success': True}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().retrieve(request, *args, **kwargs)
        return Response({'success': True, "settings": response.data}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super().list(request, *args, **kwargs)
        return Response({'success': True, 'settings': response.data}, status=status.HTTP_200_OK)


class ChangeSettings(APIView):
    """
        handles changing settings for user
    """
    serializer_class = SettingsSerializer

    def post(self, request):
        if request.data['setting'] == 'private_mode':
            self.change_private_mode(request.user, request.data['value'])
        elif request.data['setting'] == 'night_mode':
            self.change_appearance(request.user, request.data['value'])
        elif request.data['setting'] == 'notifications':
            self.change_notifications(request.user, request.data['value'])
        elif request.data['setting'] == 'save_notifications':
            self.change_save_notifications(request.user, request.data['value'])
        else:
            return Response({'success': False, 'error': 'setting not found'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.serializer_class(instance=request.user.contact.settings)
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)

    def change_appearance(self, user, value):
        user.contact.settings.night_mode = value
        user.contact.settings.save()

    def change_private_mode(self, user, value):
        user.contact.settings.private_mode = value
        user.contact.settings.save()

    def change_notifications(self, user, value):
        user.contact.settings.notifications = value
        user.contact.settings.save()

    def change_save_notifications(self, user, value):
        user.contact.settings.save_notifications = value
        user.contact.settings.save()


class SendAttachments(APIView):
    serializer_class = AttachmentsSerializer
    permission_classes = [IsAuthenticated, ]

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'contact': request.user.contact})

        if serializer.is_valid():
            attachment = serializer.save()

            attachment_serializer = AttachmentsSerializer(instance=attachment)
            message = MessageSerializer(instance=attachment.message).data

            return Response(
                {
                    "success": True,
                    'sender': request.user.id,
                    "sender_contact": request.user.contact.id,
                    "contact_pic": request.user.contact.contact_pic.url,
                    'conversation_id': attachment.message.conversation_id,
                    "time_sent": datetime.datetime.now().strftime("%I:%M %p"),
                    "date_sent": datetime.datetime.today().strftime("%d, %b"),
                    "is_file": True,
                    'message': message
                },
                status=status.HTTP_201_CREATED
            )

        return Response({"success": False}, status=status.HTTP_400_BAD_REQUEST)
