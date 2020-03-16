from django.contrib import admin

from .forms import MessageForm, ConversationForm, HeaderForm
from .models import Conversation, Message, Notification, Settings, Header


class InlineNotifications(admin.StackedInline):
    model = Notification


class InlineSettings(admin.StackedInline):
    model = Settings


class InlineMessage(admin.StackedInline):
    extra = 0
    model = Message
    form = MessageForm


class InlineHeader(admin.StackedInline):
    model = Header
    form = HeaderForm


class ConversationAdmin(admin.ModelAdmin):
    model = Conversation
    add_form = ConversationForm
    form = ConversationForm
    inlines = [InlineHeader, InlineMessage]
    filter_horizontal = ('participants',)


# Register your models here.
admin.site.register(Conversation, ConversationAdmin)
# admin.site.register(PendingMessages)
