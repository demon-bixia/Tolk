# Generated by Django 2.2.4 on 2019-08-29 19:56

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('chat', '0005_auto_20190829_2251'),
    ]

    operations = [
        migrations.DeleteModel(
            name='PendingMessages',
        ),
    ]
