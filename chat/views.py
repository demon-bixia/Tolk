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
from .models import Conversation, Message, Notification, Settings
from .serializers import ConversationSerializer, MessageSerializer, NotificationSerializer, SettingsSerializer, \
    CreateGroupSerializer


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
            if participants:
                conversation.participants.add(request.user.contact)

                for participant in participants:
                    contact = get_object_or_404(Contact, pk=participant)
                    conversation.participants.add(contact)

                conversation_serializer = ConversationSerializer(instance=conversation)
                return Response({'success': True, 'conversation': conversation_serializer.data},
                                status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'success': False, 'errors': {'non_field_errors': ['group must at least have one participants']}},
                    status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

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
        response = super().create(request, *args, **kwargs)
        return Response({'success': True, 'conversation': response.data}, status=status.HTTP_201_CREATED)

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
