# Generated by Django 4.1.7 on 2023-04-02 02:28

import chat.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('group', 'a group for users'), ('couple', 'only two users allowed')], default='couple', max_length=10)),
                ('name', models.CharField(blank=True, max_length=30)),
                ('history_mode', models.BooleanField(blank=True, choices=[(True, 'save messages in db'), (False, 'save messages in browser cookies')], default=True)),
                ('participants', models.ManyToManyField(related_name='conversations', to='accounts.contact')),
            ],
        ),
        migrations.CreateModel(
            name='Settings',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('night_mode', models.BooleanField(choices=[(True, 'use dark theme'), (False, 'use light theme')], default=True, max_length=10)),
                ('private_mode', models.BooleanField(choices=[(True, 'other contacts cannot add you to a conversation'), (False, 'other contacts can add you to a conversation')], default=False)),
                ('notifications', models.BooleanField(choices=[(True, 'receive notifications'), (False, 'never receive notifications')], default=True)),
                ('save_notifications', models.BooleanField(choices=[(True, 'save notifications'), (False, 'delete notifications')], default=False)),
                ('contact', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='accounts.contact')),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(max_length=80)),
                ('type', models.CharField(choices=[('accounts', 'from the accounts app'), ('authentication', 'from the authentication app'), ('chat', 'from the chat app'), ('default', 'default format')], default='default', max_length=30)),
                ('contact', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.contact')),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(blank=True, verbose_name='content')),
                ('sent', models.BooleanField(default=True)),
                ('date_sent', models.DateField(auto_now_add=True)),
                ('time_sent', models.TimeField(auto_now_add=True)),
                ('is_file', models.BooleanField(default=False)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='chat.conversation')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.contact')),
            ],
            options={
                'ordering': ('date_sent', 'time_sent'),
            },
        ),
        migrations.CreateModel(
            name='Header',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('header', models.ImageField(default='groups/default/default.png', upload_to=chat.models.upload_conversation_header)),
                ('conversation', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='chat.conversation')),
            ],
        ),
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to=chat.models.upload_attachment)),
                ('file_name', models.CharField(blank=True, max_length=200)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='chat.message')),
            ],
        ),
    ]
