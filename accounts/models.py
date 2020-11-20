import secrets

from PIL import Image
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from django.db import models


# functions for uploading files
def upload_contact_pic(instance, filename):
    return f"users/{instance.user.pk}/profile/{secrets.token_hex(10)}_{filename}"


# Manager for user model
class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError('user mus have an email')

        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password):
        user = self.create_user(email=email, password=password)
        user.is_superuser = True
        user.is_active = True
        user.save()
        return user


# user model used for Authentication
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(verbose_name='Email Address', max_length=255, unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        return self.is_superuser


class Contact(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(verbose_name="First name", max_length=50)
    last_name = models.CharField(verbose_name="Last name", max_length=50)
    location = models.CharField(verbose_name="Location", max_length=80, blank=True)
    friends = models.ManyToManyField("self", verbose_name="Friends", blank=True)
    contact_pic = models.ImageField(
        verbose_name="Profile Picture",
        upload_to=upload_contact_pic,
        default="users/default/default.png"
    )

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = 'Profile'

    def __str__(self):
        return self.first_name

    def save(self, **kwargs):
        super(Contact, self).save()