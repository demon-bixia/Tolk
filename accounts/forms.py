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


class ContactCreateForm(forms.ModelForm):
    email = forms.EmailField(max_length=255, required=True, label='Email Address')
    password1 = forms.CharField(widget=forms.PasswordInput, required=True, label="Password", )

    class Meta:
        model = Contact
        fields = ('first_name', 'last_name', 'email', 'location', 'password1')

    def clean_email(self):
        try:
            if User.objects.get(email=self.cleaned_data.get('email')):
                raise forms.ValidationError('email Address is taken')
        except User.DoesNotExist:
            pass
        return self.cleaned_data.get('email')


class ContactUpdateForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ('first_name', 'last_name', 'location',)


class LoginForm(forms.Form):
    email = forms.EmailField(max_length=255, required=True)
    password = forms.CharField(widget=forms.PasswordInput, max_length=80, required=True)

    def clean_email(self):
        try:
            User.objects.get(email=self.cleaned_data.get('email'))
        except User.DoesNotExist:
            raise forms.ValidationError('incorrect email address')
        return self.cleaned_data.get('email')

    def clean_password(self):
        try:
            user = User.objects.get(email=self.cleaned_data.get('email'))
            if not user.check_password(self.cleaned_data.get('password')):
                raise forms.ValidationError('incorrect password')
            else:
                return self.cleaned_data.get('password')
        except User.DoesNotExist:
            raise forms.ValidationError('unknown password')


class ContactPictureForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ('contact_pic',)
