from django.contrib import admin

from .models import Conversation, Message, Notification, Settings

# Register your models here.
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(Notification)
admin.site.register(Settings)
# admin.site.register(PendingMessages)
