from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import Contact
from .models import Settings


@receiver(post_save, sender=Contact)
def create_settings(sender, created, instance, **kwargs):
    if created:
        # only runs if a new contact is created
        Settings.objects.create(contact=instance)


@receiver(post_save, sender=Contact)
def save_settings(sender, instance, **kwargs):
    if hasattr(instance, 'settings'):
        instance.settings.save()
