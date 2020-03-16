import datetime
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import caches

from accounts.models import Contact
from chat.models import Message
from chat.utils import get_conversation_or_error
from .exceptions import ClientError

COMMANDS = ["MESSAGE", "JOIN", "LEAVE", "ERROR", "NOTIFICATION", 'STATUSES']


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
            # add a list that will contain all the joined conversations
            cache.set(f"{self.connected_user.email}_conversations", dict())
            cache.close()
        else:
            await
            self.close()  # reject connection

    async def disconnect(self, code) -> None:
        """
        sets user status to off when disconnected
        """
        cache = caches['default']
        cache.set(f"{self.connected_user.email}", 'offline')
        status = cache.get(f'{self.connected_user.email}', 'offline')
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations')
        cache.close()

        # send event to all conversations informing them
        # that the status has changes
        for key, value in joined_conversations.items():
            if value['type'] == 'couple':
                await
                self.channel_layer.group_send(
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
                await
                self.leave_conversation(key)
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
            await
            self.send_json({'success': False, 'error': 'command dose not exist'})
        elif content['command'] == 'JOIN':  # if command is for joining a conversation then join the conversation
            await
            self.join_conversation(content['conversation_name'])
        elif content['command'] == 'LEAVE':  # if command is for leaving a conversation then call leave_conversation
            await
            self.leave_conversation(content['conversation_name'])
        elif content['command'] == 'MESSAGE':  # if command is for sending a message then call send message
            await
            self.send_message(content['conversation_name'], content['message'])
        elif content['command'] == 'STATUSES':
            await
            self.get_statuses()  # if command is for fetching the statuses for all of the friends

    async def join_conversation(self, conversation_name):
        conversation = await
        get_conversation_or_error(conversation_name=conversation_name, user=self.connected_user)

        # create a group named with the conversation name and
        # add this channel to it
        await self.channel_layer.group_add(
            conversation.name.replace(' ', ''),
            self.channel_name,
        )

        # send a message to client informing him that the
        # they joined the conversation
        await self.send_json({
            'success': True,
            'command': 'JOIN',
            'conversation_name': conversation_name,
        })

        # add conversation to a list of joined conversations
        cache = caches['default']
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations', {})
        joined_conversations[conversation_name] = {'name': conversation_name.replace(' ', ''),
                                                   'type': conversation.type}
        status = cache.get(f'{self.connected_user.email}', 'offline')
        cache.set(f'{self.connected_user.email}_conversations', joined_conversations)
        cache.close()

        # send event to newly joined conversation telling it
        # that the user status has changed
        await
        self.channel_layer.group_send(
            joined_conversations[conversation_name]['name'],
            {
                'type': 'status.changed',
                'user': self.connected_user.id,
                'status': status,
            }
        )

        print(f"joined {conversation_name}")  # debug purpose

    async def leave_conversation(self, conversation_name):

        # remove channel from group
        await self.channel_layer.group_discard(
            conversation_name.replace(' ', ''),
            self.channel_name
        )

        # send a message to client informing him that the
        # they left the conversation
        await
        self.send_json({
            'success': True,
            'command': 'LEAVE',
            'conversation_name': conversation_name,
        })

        # remove from cached joined conversation list
        cache = caches['default']
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations', {})
        joined_conversations.pop(conversation_name)
        cache.set(f'{self.connected_user.email}_conversations', joined_conversations)
        cache.close()

        print(f"left {conversation_name}")  # debug purpose

    async def send_message(self, conversation_name, message):
        event = {
            'type': 'conversation.message',
            'command': 'MESSAGE',
            'conversation_name': conversation_name,
            "content": message,
            "contact_pic": self.connected_user.contact.contact_pic.url,
            "sender": self.connected_user.id,
            "time_sent": datetime.datetime.now().strftime("%I:%M %p"),
            "date_sent": datetime.datetime.today().strftime("%d, %b"),
        }

        # send a message event
        await self.channel_layer.group_send(
            conversation_name.replace(' ', ''),
            event
        )

        # save message after broad casting it
        await
        self.save_message(event)

    async def conversation_message(self, event):
        # get all the joined conversations
        cache = caches['default']
        joined_conversations = cache.get(f'{self.connected_user.email}_conversations')
        cache.close()

        # if message is sent to a conversation that user is not joined in it
        if event['conversation_name'] in joined_conversations:
            await
            self.send_json(event)

    @database_sync_to_async
    def save_message(self, event):
        conversation = async_to_sync(get_conversation_or_error)(event['conversation_name'], self.connected_user)
        contact = Contact.objects.get(user__id=event['sender'])
        message = Message.objects.create(content=event['content'], sender=contact, conversation=conversation)
        message.sent = True
        message.save()

    async def get_statuses(self):
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

        await
        self.send_json({'command': 'STATUSES', 'statuses': statuses})

    async def status_changed(self, event):
        await
        self.send_json({'command': 'STATUS', 'user': event['user'], 'status': event['status']})
