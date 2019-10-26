import datetime

from django.db import models

from accounts.models import Contact


class Conversation(models.Model):
    type_choices = (
        ('group', 'a group for users'),
        ('couple', 'only two users allowed'),
    )

    type = models.CharField(max_length=10, default="couple", choices=type_choices)
    name = models.CharField(max_length=30, blank=True)
    contacts = models.ManyToManyField(Contact)

    def save(self, **kwargs):
        super(Conversation, self).save(**kwargs)
        self.name = f"conversation_{self.pk}"
        super(Conversation, self).save(**kwargs)

    def get_last_message_content(self):
        if self.message_set.count() > 0:
            return self.message_set.last().content
        return None

    def get_other_users(self, email):
        users = []
        for contact in self.contacts.all():
            if not contact.user.email == email:
                users.append(contact)

    def get_last_message_date(self):
        if self.message_set.count() > 0:
            yesterday = datetime.date.today() - datetime.timedelta(days=1)
            date_sent = self.message_set.last().date_sent
            if date_sent == datetime.date.today():
                return "Today"
            elif date_sent == yesterday:
                return "Yesterday"
            else:
                return date_sent.strftime("%d, %b")

    def __str__(self):
        return self.name


class Message(models.Model):
    content = models.TextField(verbose_name="content")
    sender = models.ForeignKey(Contact, on_delete=models.PROTECT)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
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
        ("dark", "night mode"),
        ("light", "a light theme")
    )

    history_choices = (
        (True, "save chat history in db"),
        (False, "don't save history in db")
    )

    private_mode_choices = (
        (True, "other contacts cannot add you to a conversation"),
        (False, "other contacts can add you to a conversation"),
    )

    notifications_choices = (
        (True, 'receive notifications'),
        (False, 'never receive notifications')
    )

    theme = models.CharField(max_length=10, default="dark", choices=theme_choices)
    history = models.BooleanField(default=True, choices=history_choices)
    private_mode = models.BooleanField(default=False)
    notifications = models.BooleanField(default=False, )
    contact = models.OneToOneField(Contact, on_delete=models.CASCADE)

    def __str__(self):
        return self.contact.first_name


class Notification(models.Model):
    type_choices = (
        ('accounts', 'from the accounts app'),
        ('conversation', 'from a conversation'),
        ('default', 'default format')
    )

    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    content = models.CharField(max_length=80)
    type = models.CharField(max_length=30, default='default', choices=type_choices)

    def __str__(self):
        return self.content
