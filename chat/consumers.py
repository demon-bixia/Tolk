import datetime

from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import caches

from accounts.models import Contact, User
from accounts.serializers import ContactSerializer
from chat.models import Message, Notification, Conversation
from chat.serializers import ConversationSerializer
from .exceptions import ClientError


COMMANDS = [
    "MESSAGE",
    "JOIN",
    "LEAVE",
    "ERROR",
    "NOTIFICATION",
    'STATUSES',
    'CONVERSATION',
    'ATTACHMENT_SENT',
    'FRIEND_ADDED',
]


# used to receive, send messages and keep
# track of online and offline users
class ChatConsumer(AsyncJsonWebsocketConsumer):
    connected_user = None

    async def connect(self) -> None:
        """
        check id user is authenticated if user is
        authenticated the connect to channel and sets up
        a cache db
        """

        if self.scope['user'].is_authenticated:
            # accept user
            await self.accept()
            # to keep track of user
            self.connected_user = await self.get_connected_user()

            cache = caches['default']
            cache.set(f"{self.connected_user.email}",
                      "active")  # cache the user status

            # add your self to your own friend list
            await self.channel_layer.group_add(
                f'{self.connected_user.id}_friends',
                self.channel_name
            )

            # loop the connected user's friends list and
            # add yourself to the each friend's friend list
            for friend in self.connected_user.contact.friends.all():
                group_name = f'{friend.user.id}_friends'
                await self.channel_layer.group_add(
                    group_name,
                    self.channel_name
                )

            # create a new dict that contains the conversation the user joins
            # every time they connected
            joined_conversations = dict()
            cache.set(f"{self.connected_user.email}_conversations",
                      joined_conversations)
            # close cache
            cache.close()
            # send all notifications that the user has
            await self.send_notifications()
        else:
            await self.close()  # reject connection

    async def disconnect(self, code) -> None:
        """
        sets user status to off when disconnected
        """
        cache = caches['default']
        cache.set(f"{self.connected_user.email}", 'offline')
        status = cache.get(f'{self.connected_user.email}', 'offline')
        joined_conversations = cache.get(
            f'{self.connected_user.email}_conversations')
        cache.close()

        # leave your own friend list
        own_friend_list_group_name = f'{self.connected_user.id}_friends'
        await self.channel_layer.group_discard(
            own_friend_list_group_name,
            self.channel_name
        )

        # leave all other friend lists
        for friend in self.connected_user.contact.friends.all():
            group_name = f'{friend.user.id}_friends'
            await self.channel_layer.group_discard(
                group_name,
                self.channel_name
            )

        # send event to all conversations informing them
        # that the status has changes
        for key, value in joined_conversations.items():
            if value['type'] == 'couple':
                await self.channel_layer.group_send(
                    value['name'],
                    {
                        'type': 'status.changed',
                        'user': self.connected_user.id,
                        'status': status,
                    }
                )

        # leave all conversations
        for key, value in joined_conversations.items():
            try:
                await self.leave_conversation(key)
            except ClientError:
                pass

    async def receive_json(self, content, **kwargs) -> None:
        """
        receives a command and calls the specific command handler
        :param content:
        :param kwargs:
        :return None:
        """
        if content['command'] not in COMMANDS:
            await self.send_json({'success': False, 'error': 'command dose not exist'})
        # if command is for joining a conversation then join the conversation
        elif content['command'] == 'JOIN':
            await self.join_conversation(content['id'])
        # if command is for leaving a conversation then call leave_conversation
        elif content['command'] == 'LEAVE':
            await self.leave_conversation(content['id'])
        # if command is for sending a message then call send message
        elif content['command'] == 'MESSAGE':
            await self.send_message(content['id'], content['message'], content['contact_pic'])
        elif content['command'] == 'STATUSES':
            # if command is for fetching the statuses for all of the friends
            await self.get_statuses()
        elif content['command'] == 'NOTIFICATION':
            await self.send_notifications()
        elif content['command'] == 'CONVERSATION':
            await self.add_conversation(content['id'])
        elif content['command'] == "ATTACHMENT_SENT":
            await self.send_attachment(content['message'])
        elif content['command'] == 'FRIEND_ADDED':
            await self.add_friend(content['contact'])

    # Commands executers
    async def join_conversation(self, conversation_id) -> None:
        conversation_id = int(conversation_id)
        conversation = await self.get_conversation(conversation_id=conversation_id)

        # create a group named with the conversation name and
        # add this channel to it
        group_name = f'conversation_{conversation_id}'

        await self.channel_layer.group_add(
            group_name,
            self.channel_name,
        )

        # send a message to client informing him that the
        # they joined the conversation
        await self.send_json({
            'success': True,
            'command': 'JOIN',
            'conversation_id': conversation_id,
        })

        # add conversation to a list of joined conversations
        cache = caches['default']
        joined_conversations = cache.get(
            f'{self.connected_user.email}_conversations', {})
        joined_conversations[conversation_id] = {'name': group_name,
                                                 'type': conversation.type}
        status = cache.get(f'{self.connected_user.email}', 'offline')
        cache.set(f'{self.connected_user.email}_conversations',
                  joined_conversations)
        cache.close()

        # send event to newly joined conversation telling it
        # that the user status has changed
        await self.channel_layer.group_send(
            joined_conversations[conversation_id]['name'],
            {
                'type': 'status.changed',
                'user': self.connected_user.id,
                'status': status,
            }
        )

        print(f"joined {group_name}")  # debug purpose

    async def leave_conversation(self, conversation_id) -> None:

        group_name = f'conversation_{conversation_id}'

        # remove channel from group
        await self.channel_layer.group_discard(
            group_name,
            self.channel_name
        )

        # send a message to client informing him that the
        # they left the conversation
        await self.send_json({
            'success': True,
            'command': 'LEAVE',
            'conversation_id': conversation_id,
        })

        # remove from cached joined conversation list
        cache = caches['default']
        joined_conversations = cache.get(
            f'{self.connected_user.email}_conversations', {})
        joined_conversations.pop(conversation_id)
        cache.set(f'{self.connected_user.email}_conversations',
                  joined_conversations)
        cache.close()

        print(f"left {group_name}")  # debug purpose

    async def send_message(self, conversation_id, message, contact_pic) -> None:
        conversation_id = int(conversation_id)
        group_name = f'conversation_{conversation_id}'

        event = {
            'type': 'conversation.message',
            'command': 'MESSAGE',
            'conversation_id': conversation_id,
            "message": {
                "content": message,
                "sender": {
                    'user': self.connected_user.id,
                    "contact_pic": contact_pic,
                },
                "time_sent": datetime.datetime.now().strftime("%I:%M %p"),
                "date_sent": datetime.datetime.today().strftime("%d, %b"),
            },
        }

        # send a message event
        await self.channel_layer.group_send(
            group_name,
            event
        )

        # save message after broad casting it
        await self.save_message(event)

    async def get_statuses(self) -> None:
        cache = caches['default']
        statuses = dict()

        for friend in self.connected_user.contact.friends.all():
            status = cache.get(f'{friend.user.email}', False)

            if status:
                statuses[f'{friend.user.id}'] = status
            else:
                statuses[f'{friend.user.id}'] = 'offline'

        cache.close()

        await self.send_json({'command': 'STATUSES', 'statuses': statuses})

    async def send_notifications(self) -> None:
        cache = caches['default']
        notification_queue = cache.get(
            f'{self.connected_user.email}_notifications', False)

        if notification_queue:

            while True:
                try:
                    notification = notification_queue.pop(0)
                    await self.send_json({'command': 'NOTIFICATION', 'notification': notification})

                    if self.connected_user.contact.settings.save_notifications:
                        await self.save_notification(notification)

                except IndexError:
                    break

        cache.set(f'{self.connected_user.email}_notifications',
                  notification_queue)
        cache.close()

    async def add_conversation(self, conversation_id):
        group_name = f'{self.connected_user.id}_friends'

        conversation = await self.get_conversation(conversation_id=conversation_id)
        contacts = conversation.participants.all()

        conversation_object = await self.serialize_conversation(conversation)
        conversation_object['participants'] = await self.serialize_contact(contacts, many=True)

        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'conversation_added',
                'creator': self.connected_user.id,
                'conversation': conversation_object,
            }
        )

    async def send_attachment(self, message):
        group_name = f'{self.connected_user.id}_friends'

        conversation = await self.get_conversation(conversation_id=message['conversation_id'])
        conversation_object = await self.serialize_conversation(conversation)

        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'attachment.sent',
                'message': message,
                'conversation': conversation_object,
            }
        )

    async def conversation_message(self, event) -> None:
        # get all the joined conversations
        cache = caches['default']
        joined_conversations = cache.get(
            f'{self.connected_user.email}_conversations')
        cache.close()

        # if message is sent to a conversation that user is not joined in it
        if event['conversation_id'] in joined_conversations:
            await self.send_json(event)

    async def add_friend(self, friend):
        # get the new friend contact
        friend_contact = self.connected_user.contact.friends.get(
            pk=friend['id'])
        # access the cached friend list and added this user to it
        group_name = f"{friend_contact.user.id}_friends"
        # add connected user to the new friend list
        await self.channel_layer.group_add(
            group_name,
            self.channel_name,
        )

        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'new_friend_added',
                'group_name': f'{self.connected_user.id}_friends',
                'target_user': friend_contact.user.id,
            }
        )

    # Events handlers
    async def status_changed(self, event) -> None:
        await self.send_json({'command': 'STATUS', 'user': event['user'], 'status': event['status']})

    async def conversation_added(self, event):

        user_is_participant = False

        for participant in event['conversation']['participants']:
            if participant['user'] == self.connected_user.id and participant['user'] is not event['creator']:
                user_is_participant = True

        authenticated_contact = self.serialize_contact(
            self.connected_user.contact)

        if user_is_participant:
            await self.send_json({
                'command': 'CONVERSATION',
                'conversation': event['conversation'],
                'authenticated_user': self.connected_user.id,
                'authenticated_contact': authenticated_contact,
                'creator': event['creator'],
            })

    async def attachment_sent(self, event):
        user_is_participant = False

        for participant in event['conversation']['participants']:
            if participant == self.connected_user.contact.id and participant is not event['message']['sender_contact']:
                user_is_participant = True

        if user_is_participant:
            await self.send_json({
                'command': 'MESSAGE',
                'conversation_id': event['conversation']['id'],
                'message': event['message']['message'],
            })

    async def new_friend_added(self, event):
        if self.connected_user.id == int(event['target_user']):
            await self.channel_layer.group_add(
                event['group_name'],
                self.channel_name
            )

    # database helpers
    @database_sync_to_async
    def save_notification(self, data) -> None:
        notification = Notification.objects.create(type=data['type'], content=data['content'],
                                                   contact=self.connected_user.contact)
        notification.save()

    @database_sync_to_async
    def save_message(self, data) -> None:
        conversation = async_to_sync(
            self.get_conversation)(data['conversation_id'])
        contact = Contact.objects.get(
            user__id=data['message']['sender']['user'])
        message = Message.objects.create(
            content=data['message']['content'], sender=contact, conversation=conversation)
        message.sent = True
        message.save()

    @database_sync_to_async
    def get_connected_user(self):
        return User.objects.select_related('contact', 'contact__settings').prefetch_related(
            'contact__friends', 'contact__friends__user').get(pk=self.scope['user'].pk)

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        # Try to get the conversation else raise error
        if not self.connected_user.is_authenticated:
            raise ClientError("User has to login")

        # Find the conversation they requested (by ID)
        try:
            conversation = Conversation.objects.prefetch_related('participants', 'messages').get(
                id=conversation_id)

            # if user is not joined in the conversation
            if self.connected_user.contact not in conversation.participants.all():
                # raise error
                raise ClientError("Not Participant in conversation")

        except Conversation.DoesNotExist:
            raise ClientError("Room Dose not exist")

        # return conversation if user is authenticated and joined joined in conversation
        return conversation

    # serialization helpers
    @database_sync_to_async
    def serialize_conversation(self, conversation, many=False):
        serializer = ConversationSerializer(conversation, many=many)
        return serializer.data

    @database_sync_to_async
    def serialize_contact(self, contact, many=False):
        serializer = ContactSerializer(contact, many=many)
        return serializer.data
