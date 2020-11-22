from django.test import TestCase
from .models import User, Contact


class TestUserModel(TestCase):

    def test_user_creation(self):
        user = User.objects.create_user(email='guest_1@user.com')
        self.assertEqual(user.email, 'guest_1@user.com')
        self.assertFalse(user.is_superuser)

    def test_superuser_creation(self):
        user = User.objects.create_superuser(email='guest_1@user.com', password="password")
        self.assertEqual(user.email, 'guest_1@user.com')
        self.assertTrue(user.is_superuser)


class TestRegisterView(TestCase):
    def test_bad_credentials(self):
        response = self.client.post('/api/register/', {
            'email': 'bad_email.com',
            'password': 'password',
            'first_name': 'guest',
            'last_name': 'user',
            'location': 'guest, city',
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(str(response.data['errors']['email'][0]), 'Enter a valid email address.')

    def test_account_registration(self):
        response = self.client.post('/api/register/', {
            'email': 'guest@email.com',
            'password': 'password',
            'first_name': 'guest',
            'last_name': 'user',
            'location': 'Guest, City',
        })

        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(User.objects.get(email='guest@email.com'))


class TestAddFriendView(TestCase):
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

    def test_user_befriend_itself(self):
        response = self.client.post('/api/add-friend/', {'email': self.contact_1.user.email})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['errors']['email'][0], 'you cannot befriend yourself')

    def test_friend_user_in_private_mode(self):
        setattr(self.contact_2.settings, 'private_mode', True)
        self.contact_2.settings.save()

        response = self.client.post('/api/add-friend/', {'email': self.contact_2.user.email})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['errors']['email'][0], 'this contact is in private')

        setattr(self.contact_2.settings, 'private_mode', False)
        self.contact_2.settings.save()

    def test_add_while_in_private_mode(self):
        setattr(self.contact_1.settings, 'private_mode', True)
        self.contact_1.settings.save()

        response = self.client.post('/api/add-friend/', {'email': self.contact_2.user.email})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['errors']['non_field_errors'][0], 'you cannot add contacts in private mode')

        setattr(self.contact_1.settings, 'private_mode', False)
        self.contact_1.settings.save()

    def test_add_user_that_dose_not_exist(self):
        response = self.client.post('/api/add-friend/', {'email': 'an_email_that_does_not_exist@email.com'})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['errors']['email'][0], 'no contact with this email')

    def test_add_friend(self):
        response = self.client.post('/api/add-friend/', {'email': self.contact_2.user.email})
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(self.contact_1.friends.get(user__email=self.contact_2.user.email))