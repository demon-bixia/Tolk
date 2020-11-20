from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from chat.models import Conversation
from chat.utils import add_notification
from .models import Contact
from .permissions import IsAuthenticatedOrCreateOnly
from .serializers import UserSerializer, ContactSerializer, AddFriendSerializer

User = get_user_model()  # contrib.auth User


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_friend(request, format=None):
    serializer = AddFriendSerializer(data=request.data)
    if serializer.is_valid():
        try:
            friend_user = User.objects.get(email=serializer.data.get('email'))

            if request.user.contact.settings.private_mode:
                return Response(
                    {'success': False, 'errors': {'non_field_errors': ['you cannot add contacts in private mode']}},
                    status=status.HTTP_400_BAD_REQUEST)

            if friend_user.contact == request.user.contact:
                return Response({"success": False, "errors": {'email': ['you cannot befriend yourself']}},
                                status=status.HTTP_400_BAD_REQUEST)

            if friend_user.contact.settings.private_mode:
                return Response({'success': False, "errors": {'email': ['this contact is in private']}},
                                status=status.HTTP_400_BAD_REQUEST)

            else:
                friend_user.contact.friends.add(request.user.contact)  # add  authenticated user contact to friends
                notification = {'type': 'chat', 'content': 'your new contact is added'}
                add_notification(notification=notification, user=request.user)

                # create a conversation
                """                
                conversation_already_exist = False
                added_conversation = None

                # search for a conversation couple in common
                for conversation in friend_user.contact.conversations.filter(type='couple'):
                    if request.user.contact in conversation.participants.all():
                        conversation_already_exist = True
                        added_conversation = conversation

                if not conversation_already_exist:
                    conversation = Conversation()
                    conversation.save()
                    conversation.participants.add(friend_user.contact, request.user.contact)
                    added_conversation = conversation

                    f_content = f'{request.user.email} started a conversation with you'
                    friend_user_notification = {'type': 'chat',
                                                'content': f_content}

                    add_notification(friend_user_notification, friend_user)

                    user_notification = {'type': 'chat', 'content': 'your new chat is ready'}
                    add_notification(user_notification, request.user)

                contact_serializer = ContactSerializer(instance=friend_user.contact)
                conversation_serializer = ConversationSerializer(instance=added_conversation)

                return Response(
                    {"success": True, "contact": contact_serializer.data, "conversation": conversation_serializer.data})
                """
                contact_serializer = ContactSerializer(instance=friend_user.contact)

                return Response({"success": True, "contact": contact_serializer.data})

        except User.DoesNotExist:
            return Response({'success': False, 'errors': {'email': ['no contact with this email']}},
                            status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    user_serializer = UserSerializer
    contact_serializer = ContactSerializer

    def post(self, request):
        user_serializer = self.user_serializer(data=request.data)

        if user_serializer.is_valid():
            # create a user
            user = user_serializer.save()
            user.set_password(request.data['password'])
            user.save()
            # create a contact
            contact_serializer = self.contact_serializer(data=request.data, context={'user': user.id})
            if contact_serializer.is_valid():
                contact = contact_serializer.save(user=user)

                # create a new notifications
                content = f'hey {contact.first_name} your new account is created'
                notification = {'type': 'accounts', 'content': content}
                add_notification(notification, user)

                return Response({'contact': contact_serializer.data}, status=status.HTTP_200_OK)
            else:
                # delete user if contact is invalid
                user.delete()
                return Response({'errors': contact_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'errors': user_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrCreateOnly]

    def get_queryset(self):
        contact = self.request.user.contact
        queryset = User.objects.filter(contact__friends=contact)
        return queryset

    def create(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(UserViewSet, self).create(request, *args, **kwargs)
        return Response({'success': True, 'user': response.data}, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(self.request.data['password'])
        user.save()

    def update(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(UserViewSet, self).update(request, *args, **kwargs)
        return Response({'success': True, 'user': response.data}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(UserViewSet, self).destroy(request, *args, **kwargs)
        return Response({'success': True}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(UserViewSet, self).retrieve(request, *args, **kwargs)
        return Response({'success': True, "user": response.data}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(UserViewSet, self).list(request, *args, **kwargs)
        return Response({'success': True, 'users': response.data}, status=status.HTTP_200_OK)


class ContactViewSet(ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticatedOrCreateOnly]

    def get_queryset(self):
        contact = self.request.user.contact
        queryset = Contact.objects.filter(friends=contact) | Contact.objects.filter(id=contact.id)
        return queryset.distinct()

    def create(self, request, *args, **kwargs):
        """
            adds operation success boolean for client
        """
        response = super(ContactViewSet, self).create(request, *args, **kwargs)
        return Response({'success': True, 'contact': response.data}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(ContactViewSet, self).update(request, *args, **kwargs)
        return Response({'success': True, 'contact': response.data}, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        contact = serializer.save()
        content = f'hey there {contact.first_name} your account information is updated'
        notification = {'type': 'accounts',
                        'content': content}
        add_notification(notification, contact.user)

    def destroy(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(ContactViewSet, self).destroy(request, *args, **kwargs)
        return Response({'success': True}, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        for conversation in Conversation.objects.filter(type='couple', participants=instance):
            # remove all couple conversations that this participant joined
            conversation.delete()

        instance.delete()

    def retrieve(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(ContactViewSet, self).retrieve(request, *args, **kwargs)
        return Response({'success': True, "contact": response.data}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        """
        adds operation success boolean for client
        """
        response = super(ContactViewSet, self).list(request, *args, **kwargs)
        return Response({'success': True, 'contacts': response.data}, status=status.HTTP_200_OK)
