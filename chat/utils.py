from channels.db import database_sync_to_async

from .exceptions import ClientError
from .models import Conversation


@database_sync_to_async
def get_conversation_or_error(conversation_name, user):
    # Try to get the conversation else raise error
    if not user.is_authenticated:
        raise ClientError("User has to login")

    # Find the conversation they requested (by ID)
    try:
        conversation = Conversation.objects.get(name=conversation_name)

        # if user is not joined in the conversation
        if user.contact not in conversation.participants.all():
            # raise error
            raise ClientError("Not Participant in conversation")

    except Conversation.DoesNotExist:
        raise ClientError("Room Dose not exist")

    # return conversation if user is authenticated and joined joined in conversation
    return conversation
