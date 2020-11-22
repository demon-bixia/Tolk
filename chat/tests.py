from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Contact
from .models import Conversation

User = get_user_model()


class TestCreateGroupView(TestCase):
    def setUp(self) -> None:

        self.client.post('/api/register/', {
            'email': 'guest_1@email.com',
            'password': 'password',
            'first_name': 'guest_1',
            'last_name': 'user',
            'location': 'Guest, City',
        })
        self.contact_1 = Contact.objects.get(user__email='guest_1@email.com')

        self.client.post('/api/register/', {
            'email': 'guest_2@email.com',
            'password': 'password',
            'first_name': 'guest_2',
            'last_name': 'user',
            'location': 'Guest, City',
        })
        self.contact_2 = Contact.objects.get(user__email='guest_2@email.com')

        self.client.post('/api/login/', {'email': self.contact_1.user.email, 'password': 'password'})

    def test_create_group_with_one_member(self):
        response = self.client.post('/api/create-group/', {'group_name': 'the meme team'})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['errors']['non_field_errors'][0], 'group must at least have one participants')

    def test_create_group(self):
        response = self.client.post('/api/create-group/', {
            'group_name': 'the meme team',
            f'contact_{self.contact_2.pk}': 'on',
        })

        self.assertEqual(response.status_code, 201)
        self.assertIsNotNone(Conversation.objects.get(name='the meme team'))

