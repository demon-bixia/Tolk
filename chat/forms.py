from django import forms

from .models import Message, Conversation, Header


class ConversationForm(forms.ModelForm):
    class Meta:
        model = Conversation
        fields = ['type', 'name', 'participants']

    def clean(self):
        cleaned_data = super(ConversationForm, self).clean()

        if cleaned_data.get('type') == 'couple':

            if len(cleaned_data.get('participants', [])) != 2:
                self.add_error('participants', 'conversation of type couple should have two participants only')

            elif not cleaned_data.get('participants', [])[0] in cleaned_data.get('participants', [])[1].friends.all():
                self.add_error('participants', 'you cant start a conversation with a non-friend contact')

        return cleaned_data


class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['content', 'sender', 'conversation', 'sent']

    def clean(self):
        cleaned_data = super(MessageForm, self).clean()

        if not cleaned_data.get('sender') in cleaned_data.get('conversation').participants.all():
            self.add_error('conversation', 'cannot send to a conversation that is not joined')

        return cleaned_data


class HeaderForm(forms.ModelForm):
    class Meta:
        model = Header
        fields = '__all__'
