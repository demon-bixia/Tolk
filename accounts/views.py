from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.utils.encoding import force_text, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.generic import View

from chat.models import Settings
from .forms import ContactCreateForm, LoginForm, ContactPictureForm, ContactUpdateForm
from .tokens import account_activation_token

User = get_user_model()


class UserAuthenticated(View):

    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({"authenticated": True})
        else:
            return JsonResponse({"authenticated": False})


class LoginView(View):
    form_class = LoginForm

    def post(self, request):
        form = self.form_class(request.POST)

        if form.is_valid():
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            self.login_user(request, email, password)
            return JsonResponse({"success": True, "form_errors": form.errors})
        else:
            return JsonResponse({"success": False, "form_errors": form.errors})

    def login_user(self, request, email, password):
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
        return user


class RegisterView(View):
    form_class = ContactCreateForm

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            contact = form.save(commit=False)
            user = self.create_user(form, contact)
            self.add_user(user, contact)
            self.send_activation_token(request, user)
            self.create_settings(contact)
            return JsonResponse({"success": True, "email": user.email, "form_errors": form.errors})
        else:
            return JsonResponse({"success": False, "form_errors": form.errors})

    def send_activation_token(self, request, user):
        current_site = get_current_site(request)
        mail_subject = 'Activate your account'
        message = render_to_string('partial/account_activation_template.html', {
            'user': user,
            'domain': current_site.domain,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': account_activation_token.make_token(user),
        })
        to_email = user.email
        email = EmailMessage(
            mail_subject,
            message,
            to=[to_email]
        )
        email.send()

    def add_user(self, user, contact):
        contact.user = user
        contact.save()
        return contact

    def create_user(self, form, contact):
        user = User(email=form.cleaned_data['email'])
        user.set_password(form.cleaned_data['password1'])
        user.save()
        return user

    def create_settings(self, contact):
        settings = Settings(contact=contact)
        settings.save()
        return settings


class ActivateAccount(View):

    def get(self, request, uidb64, token):
        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return redirect('index')
        else:
            return HttpResponse('<h1>Failed</h1>')


@method_decorator(login_required, name="dispatch")
class LogoutView(View):

    def get(self, request):
        logout(request)
        return JsonResponse({"success": True})


@method_decorator(login_required, name="dispatch")
class ContactUpdateView(View):
    form_class = ContactUpdateForm

    def post(self, request):
        contact = request.user.contact
        form = self.form_class(instance=contact, data=request.POST)
        if form.is_valid():
            contact = form.save(commit=False)
            contact.save()
            return JsonResponse({'success': True, 'form_errors': form.errors})
        else:
            return JsonResponse({'success': False, 'form_errors': form.errors})


@method_decorator(login_required, name="dispatch")
class ChangeContactPicture(View):
    form_class = ContactPictureForm

    def post(self, request):
        contact = request.user.contact
        form = self.form_class(request.POST, request.FILES, instance=contact)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False})
