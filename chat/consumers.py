import datetime

from channels.db import database_sync_to_async
from channels.generic.websocket import JsonWebsocketConsumer, AsyncJsonWebsocketConsumer
from django.core.cache import caches

from accounts.serializers import ContactSerializer
from chat.models import (
    Notification,
    Settings,
    Contact,
    Conversation,
    Message,
)
from chat.serializers import (
    NotificationSerializer,
    ConversationSerializer,
    SettingsSerializer,
)
from .exceptions import ClientError
from .utils import get_conversation_or_error

LOAD_COMMANDS = [
    "ALL", "NOTIFICATIONS", "CONTACT",
    "SETTINGS", "CONVERSATIONS", "FRIENDS",
    "CHAT"
]

CHAT_COMMANDS = ["MESSAGE", "JOIN", "LEAVE", "ERROR"]


class LoadConsumer(JsonWebsocketConsumer):

    def connect(self):
        if self.scope['user'].is_authenticated:
            self.accept()
        else:
            self.close()

    def receive_json(self, content, **kwargs):
        if content['command'] == "ALL":
            data = self.load_all()
        elif content['command'] == "NOTIFICATIONS":
            data = self.load_notifications()
        elif content['command'] == "CONTACT":
            data = self.load_contact()
        elif content['command'] == "SETTINGS":
            data = self.load_settings_contact()
        elif content['command'] == "CONVERSATIONS":
            data = self.load_conversations_contact()
        elif content['command'] == "FRIENDS":
            data = self.load_friends()
        elif content['command'] == "CHAT":
            name = content['name']
            data = self.load_conversation_contact(name)
        else:
            data = {"success": False, "error": "no such command"}

        self.send_json(data)

    def load_all(self):
        contact = self.load_contact()
        notifications = self.load_notifications()
        conversations = self.load_conversations()
        settings = self.load_settings()
        friends = self.load_friends()

        return {
            "success": True,
            "contact": contact['contact'],
            "notifications": notifications['notifications'],
            "conversations": conversations['conversations'],
            "settings": settings['settings'],
            'friends': friends['friends'],
        }

    def load_conversations_contact(self):
        conversations = self.load_conversations()
        contact = self.load_contact()
        return {
            "success": True,
            "conversations": conversations['conversations'],
            "contact": contact['contact'],
        }

    def load_conversation_contact(self, name):
        conversation = self.load_conversation(name)
        contact = self.load_contact()
        return {
            "success": True,
            "conversation": conversation['conversation'],
            "contact": contact['contact'],
        }

    def load_settings_contact(self):
        settings = self.load_settings()
        contact = self.load_contact()
        return {
            "success": True,
            "settings": settings['settings'],
            "contact": contact['contact'],
        }

    def load_contact(self):
        user_id = self.scope['user'].id

        try:
            contact = Contact.objects.get(user_id=user_id)
        except Contact.DoesNotExist:
            return {"success": True, "error": "contact dose not exist"}

        serializer = ContactSerializer(contact)
        data = serializer.data
        return {"success": True, "contact": data}

    def load_conversations(self):
        conversations = Conversation.objects.filter(
            contacts=self.scope['user'].contact)
        if conversations:
            serializer = ConversationSerializer(conversations, many=True)
            data = serializer.data
            return {"success": True, "conversations": data}
        else:
            return {"success": True, "conversations": None}

    def load_conversation(self, name):
        conversation = Conversation.objects.filter(name=name).first()
        if conversation:
            serializer = ConversationSerializer(conversation)
            data = serializer.data
            return {"success": True, "conversation": data}
        return {"success": True, "conversation": None}

    def load_notifications(self):
        notifications = Notification.objects.filter(
            contact__user=self.scope['user'])

        if notifications:
            serializer = NotificationSerializer(notifications, many=True)
            data = serializer.data

            return {"success": True, "notifications": data}
        else:
            return {"success": True, "notifications": None}

    def load_settings(self):
        settings = Settings.objects.filter(
            contact__user=self.scope['user']).first()

        if settings:
            serializer = SettingsSerializer(settings)
            data = serializer.data
            return {"success": True, "settings": data}
        else:
            return {"success": True, "settings": None}

    def load_friends(self):
        friends = Contact.objects.filter(friends=self.scope['user'].contact)

        if friends:
            serializer = ContactSerializer(friends, many=True)
            data = serializer.data
            return {"success": True, "friends": data}
        else:
            return {"success": True, "friends": None}


# used to receive, send messages and keep

# track of online and offline users
class ChatConsumer(AsyncJsonWebsocketConsumer):
    conversations = set()
    message_queue = list()

    async def connect(self):
        if self.scope['user'].is_authenticated:
            await self.accept()
            # make a user var that stays even when user disconnect
            self.user = self.scope['user']

            status_cache = caches['default']
            status_cache.set(f"{self.user.email}", 'on')
            status_cache.close()
        else:
            await self.close()

    async def receive_json(self, content, **kwargs):
        if not content['command'] in CHAT_COMMANDS:
            await self.send_json({"success": False, "error": "command dose not exist"})
        elif content['command'] == "JOIN":
            await self.join_conversation(content['conversation_name'])
        elif content['command'] == "LEAVE":
            await self.leave_conversation(content['conversation_name'])
        elif content['command'] == "MESSAGE":
            await self.send_message(content['message'], content['conversation_name'])

    async def disconnect(self, code):
        # when socket disconnect change status
        status_cache = caches['default']
        status_cache.set(f"{self.user.email}", 'off')
        status_cache.close()

        # when socket disconnect save all messages to db
        await self.save_messages()

        # leave all conversations
        for conversation_name in list(self.conversations):
            try:
                await self.leave_conversation(conversation_name)
            except ClientError:
                pass

    async def join_conversation(self, conversation_name):
        await self.channel_layer.group_add(
            conversation_name,
            self.channel_name
        )

        await self.send_json({
            "success": True,
            "command": "JOIN",
            "conversation_name": conversation_name,
        })

        self.conversations.add(conversation_name)

        print(f"joined {conversation_name}")

    async def leave_conversation(self, conversation_name):
        conversation = await get_conversation_or_error(conversation_name, self.scope['user'])

        # remove that we are in the conversation conversation
        self.conversations.discard(conversation_name)

        # Remove them from the group so they no longer get conversation messages
        await self.channel_layer.group_discard(
            conversation.name,
            self.channel_name
        )

        print(f"left {conversation_name}")

    async def send_message(self, message, conversation_name):
        message = {
            "type": "conversation.message",
            "success": True,
            "command": "MESSAGE",
            "conversation_name": conversation_name,
            "message": message,
            "contact_pic": self.scope['user'].contact.contact_pic.url,
            "email": self.scope['user'].email,
            "time_sent": datetime.datetime.now().strftime("%I:%M %p"),
            "date_sent": datetime.datetime.today().strftime("%d, %b"),
        }

        await self.channel_layer.group_send(
            conversation_name,
            message
        )

        self.message_queue.append(message)

    # when someone send a message to a conversation
    async def conversation_message(self, event):
        # if message is sent to conversation that is not joined
        if event['conversation_name'] not in self.conversations:
            await self.send_json({
                "success": False,
                "error": "conversation is not joined"
            })

        # cache message for saving when socket disconnect
        # self.message_queue.append(event)

        # broadcast message
        await self.send_json(event)

    @database_sync_to_async
    # save all messages when disconnected
    def save_messages(self):
        if self.message_queue:
            status_cache = caches['default']
            for queued_message in self.message_queue:
                # remove message from queue
                self.message_queue.remove(queued_message)

                # make sure message in is sent to an existing conversation
                if queued_message['conversation_name'] in self.conversations:
                    conversation_name = queued_message['conversation_name']

                    # getting the conversation
                    try:
                        conversation = Conversation.objects.get(
                            name=conversation_name)
                    except Conversation.DoesNotExist:
                        pass

                    sender = conversation.contacts.filter(
                        user__email=queued_message['email']).first()
                    sent = True if status_cache.get(
                        f"{queued_message['email']}") == "on" else False
                    message = Message(content=queued_message['message'],
                                      sender=sender, conversation=conversation,
                                      sent=sent,
                                      time_sent=queued_message['time_sent'],
                                      date_sent=queued_message['date_sent'])
                    message.save()
            status_cache.close()
