from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from .models import User, Contact


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm Password", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'password1', 'password2')

    def clean_password2(self):
        password1 = self.cleaned_data['password1']
        password2 = self.cleaned_data['password2']
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError('Password mismatch')
        return password2

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('email', 'password', 'is_active', 'is_superuser')

    def clean_password(self):
        return self.initial['password']


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = '__all__'

    def clean(self):
        cleaned_data = super(ContactForm, self).clean()

        # will work on update only
        if self.instance in cleaned_data.get('friends', []):
            self.add_error('friends', 'you cannot befriend yourself')
