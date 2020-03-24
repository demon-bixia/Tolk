from channels.db import database_sync_to_async
from django.core.cache import caches

from .exceptions import ClientError
from .models import Conversation


@database_sync_to_async
def get_conversation_or_error(conversation_id, user):
    # Try to get the conversation else raise error
    if not user.is_authenticated:
        raise ClientError("User has to login")

    # Find the conversation they requested (by ID)
    try:
        conversation = Conversation.objects.get(id=conversation_id)

        # if user is not joined in the conversation
        if user.contact not in conversation.participants.all():
            # raise error
            raise ClientError("Not Participant in conversation")

    except Conversation.DoesNotExist:
        raise ClientError("Room Dose not exist")

    # return conversation if user is authenticated and joined joined in conversation
    return conversation


def add_notification(notification, user):
    # check if user has notifications open
    if user.contact.settings.notifications:
        # open cache
        cache = caches['default']
        # get the notification queue from the cache
        notification_queue = cache.get(f'{user.email}_notifications', False)
        # if queue dose'nt exist create a new one
        if not notification_queue:
            notification_queue = list()
        # append the notification in queue
        notification_queue.append(notification)
        # save the new queue in cache
        cache.set(f'{user.email}_notifications', notification_queue)
        # close cache
        cache.close()
