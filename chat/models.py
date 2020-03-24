import datetime
import secrets

from django.db import models

from accounts.models import Contact


class Conversation(models.Model):
    type_choices = (
        ('group', 'a group for users'),
        ('couple', 'only two users allowed'),
    )

    history_choices = (
        (True, 'save messages in db'),
        (False, 'save messages in browser cookies'),
    )

    type = models.CharField(max_length=10, default="couple", choices=type_choices)
    name = models.CharField(max_length=30, blank=True)
    participants = models.ManyToManyField(Contact, related_name='conversations')
    history_mode = models.BooleanField(default=True, choices=history_choices, blank=True)

    def save(self, **kwargs):
        super(Conversation, self).save(**kwargs)

        if not self.name:
            self.name = f"conversation_{self.pk}"
            super(Conversation, self).save(**kwargs)

    def get_last_message_content(self):
        if self.messages.count() > 0:
            return self.messages.last().content
        return None

    def get_other_users(self, email):
        other_users = []
        for participant in self.participants.all():
            if not participant.user.email == email:
                other_users.append(participant)

    def get_last_message_date(self):
        if self.messages.count() > 0:
            yesterday = datetime.date.today() - datetime.timedelta(days=1)
            date_sent = self.messages.last().date_sent
            if date_sent == datetime.date.today():
                return "Today"
            elif date_sent == yesterday:
                return "Yesterday"
            else:
                return date_sent.strftime("%d, %b")

    def __str__(self):
        return self.name


# functions for uploading files
def upload_conversation_header(instance, filename):
    return f"groups/{instance.conversation.name}/{secrets.token_hex(10)}_{filename}"


class Header(models.Model):
    conversation = models.OneToOneField(Conversation, on_delete=models.CASCADE)
    header = models.ImageField(upload_to=upload_conversation_header, default='groups/default/default.png')

    def __str__(self):
        return self.conversation.name


class Message(models.Model):
    content = models.TextField(verbose_name="content")
    sender = models.ForeignKey(Contact, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sent = models.BooleanField(default=True)
    date_sent = models.DateField(auto_now_add=True)

    time_sent = models.TimeField(auto_now_add=True)

    class Meta:
        ordering = ('date_sent', 'time_sent')

    def __str__(self):
        return f"sent by {self.sender.first_name} to {self.conversation}"

    def get_time_sent(self):
        return self.time_sent.strftime("%I:%M %p")


class Settings(models.Model):
    theme_choices = (
        (True, "use dark theme"),
        (False, "use light theme")
    )

    private_mode_choices = (
        (True, "other contacts cannot add you to a conversation"),
        (False, "other contacts can add you to a conversation"),
    )

    notifications_choices = (
        (True, 'receive notifications'),
        (False, 'never receive notifications')
    )

    night_mode = models.BooleanField(max_length=10, default=True, choices=theme_choices)
    private_mode = models.BooleanField(default=False)
    notifications = models.BooleanField(default=True)
    contact = models.OneToOneField(Contact, on_delete=models.CASCADE)

    def __str__(self):
        return self.contact.first_name


class Notification(models.Model):
    type_choices = (
        ('accounts', 'from the accounts app'),
        ('authentication', 'from the authentication app'),
        ('chat', 'from the chat app'),
        ('default', 'default format'),
    )

    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    content = models.CharField(max_length=80)
    type = models.CharField(max_length=30, default='default', choices=type_choices)

    def __str__(self):
        return self.content
