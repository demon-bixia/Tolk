import datetime

from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import caches

from accounts.models import Contact
from accounts.serializers import ContactSerializer
from chat.models import Message, Notification
from chat.serializers import ConversationSerializer
from chat.utils import get_conversation_or_error
from .exceptions import ClientError

COMMANDS = ["MESSAGE", "JOIN", "LEAVE", "ERROR", "NOTIFICATION", 'STATUSES', 'CONVERSATION']


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
            self.connected_user = self.scope['user']

            cache = caches['default']
            cache.set(f"{self.connected_user.email}", "active")  # cache the user status

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
            cache.set(f"{self.connected_user.email}_conversations", joined_conversations)
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
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations')
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
        elif content['command'] == 'JOIN':  # if command is for joining a conversation then join the conversation
            await self.join_conversation(content['id'])
        elif content['command'] == 'LEAVE':  # if command is for leaving a conversation then call leave_conversation
            await self.leave_conversation(content['id'])
        elif content['command'] == 'MESSAGE':  # if command is for sending a message then call send message
            await self.send_message(content['id'], content['message'])
        elif content['command'] == 'STATUSES':
            await self.get_statuses()  # if command is for fetching the statuses for all of the friends
        elif content['command'] == 'NOTIFICATION':
            await self.send_notifications()
        elif content['command'] == 'CONVERSATION':
            await self.add_conversation(content['id'])

    async def join_conversation(self, conversation_id) -> None:
        conversation_id = int(conversation_id)
        conversation = await get_conversation_or_error(conversation_id=conversation_id, user=self.connected_user)

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
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations', {})
        joined_conversations[conversation_id] = {'name': group_name,
                                                 'type': conversation.type}
        status = cache.get(f'{self.connected_user.email}', 'offline')
        cache.set(f'{self.connected_user.email}_conversations', joined_conversations)
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
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations', {})
        joined_conversations.pop(conversation_id)
        cache.set(f'{self.connected_user.email}_conversations', joined_conversations)
        cache.close()

        print(f"left {group_name}")  # debug purpose

    async def send_message(self, conversation_id, message) -> None:
        conversation_id = int(conversation_id)
        group_name = f'conversation_{conversation_id}'

        event = {
            'type': 'conversation.message',
            'command': 'MESSAGE',
            'conversation_id': conversation_id,
            "content": message,
            "contact_pic": self.connected_user.contact.contact_pic.url,
            "sender": self.connected_user.id,
            "time_sent": datetime.datetime.now().strftime("%I:%M %p"),
            "date_sent": datetime.datetime.today().strftime("%d, %b"),
        }

        # send a message event
        await self.channel_layer.group_send(
            group_name,
            event
        )

        # save message after broad casting it
        await self.save_message(event)

    async def conversation_message(self, event) -> None:
        # get all the joined conversations
        cache = caches['default']
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations')
        cache.close()

        # if message is sent to a conversation that user is not joined in it
        if event['conversation_id'] in joined_conversations:
            await self.send_json(event)

    @database_sync_to_async
    def save_message(self, data) -> None:
        conversation = async_to_sync(get_conversation_or_error)(data['conversation_id'], self.connected_user)
        contact = Contact.objects.get(user__id=data['sender'])
        message = Message.objects.create(content=data['content'], sender=contact, conversation=conversation)
        message.sent = True
        message.save()

    async def get_statuses(self) -> None:
        friends = self.connected_user.contact.friends.all()
        cache = caches['default']
        statuses = dict()

        for friend in friends:
            status = cache.get(f'{friend.user.email}', False)

            if status:
                statuses[f'{friend.user.id}'] = status
            else:
                statuses[f'{friend.user.id}'] = 'offline'

        cache.close()

        await self.send_json({'command': 'STATUSES', 'statuses': statuses})

    async def status_changed(self, event) -> None:
        await self.send_json({'command': 'STATUS', 'user': event['user'], 'status': event['status']})

    async def send_notifications(self) -> None:
        cache = caches['default']
        notification_queue = cache.get(f'{self.connected_user.email}_notifications', False)

        if notification_queue:

            while True:
                try:
                    notification = notification_queue.pop(0)
                    await self.send_json({'command': 'NOTIFICATION', 'notification': notification})
                    await self.save_notification(notification)
                except IndexError:
                    break

        cache.set(f'{self.connected_user.email}_notifications', notification_queue)
        cache.close()

    @database_sync_to_async
    def save_notification(self, data) -> None:
        notification = Notification.objects.create(type=data['type'], content=data['content'],
                                                   contact=self.connected_user.contact)
        notification.save()

    async def add_conversation(self, conversation_id):
        group_name = f'{self.connected_user.id}_friends'
        conversation = await get_conversation_or_error(conversation_id=conversation_id, user=self.connected_user)
        conversation_serializer = ConversationSerializer(instance=conversation)

        contacts = conversation.participants.all()
        contacts_serializer = ContactSerializer(instance=contacts, many=True)

        conversation_object = conversation_serializer.data
        conversation_object['participants'] = contacts_serializer.data

        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'conversation_added',
                'creator': self.connected_user.id,
                'conversation': conversation_object,
            }
        )

    async def conversation_added(self, event):

        user_is_participant = False

        for participant in event['conversation']['participants']:
            if participant['user'] == self.connected_user.id and participant['user'] is not event['creator']:
                user_is_participant = True

        authenticated_contact = ContactSerializer(instance=self.connected_user.contact).data

        if user_is_participant:
            await self.send_json({
                'command': 'CONVERSATION',
                'conversation': event['conversation'],
                'authenticated_user': self.connected_user.id,
                'authenticated_contact': authenticated_contact,
                'creator': event['creator'],
            })
